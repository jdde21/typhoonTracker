import pandas as pd 
import numpy as np
import re

def get_database_by_agency(agency):

    match agency:
        case "JMA":
            typhoon_database = pd.read_csv('cleaned/cleaned_japan.csv', encoding = 'latin-1')
        case "JTWC":
            typhoon_database = pd.read_csv('cleaned/cleaned_usa.csv', encoding = 'latin-1')
        case "CMA":
            typhoon_database = pd.read_csv('cleaned/cleaned_china.csv', encoding = 'latin-1')
        case "HKO":
            typhoon_database = pd.read_csv('cleaned/cleaned_hongkong.csv', encoding = 'latin-1')
        case "IMD":
            typhoon_database = pd.read_csv('cleaned/cleaned_india.csv', encoding = 'latin-1')
        case "KMA":
            typhoon_database = pd.read_csv('cleaned/cleaned_korea.csv', encoding = 'latin-1')
        case _:
            typhoon_database = pd.read_csv('new_data.csv', encoding = 'latin-1')
    
    return typhoon_database

def get_database_by_agency_additional_properties(agency):
    match agency:
        case "JMA":
            typhoon_database = pd.read_csv('additional_properties/TOKYO_typhoons_additional_properties.csv', encoding = 'latin-1')
        case "JTWC":
            typhoon_database = pd.read_csv('additional_properties/USA_typhoons_additional_properties.csv', encoding = 'latin-1')
        case "CMA":
            typhoon_database = pd.read_csv('additional_properties/CMA_typhoons_additional_properties.csv', encoding = 'latin-1')
        case "HKO":
            typhoon_database = pd.read_csv('additional_properties/HKO_typhoons_additional_properties.csv', encoding = 'latin-1')
        case "IMD":
            typhoon_database = pd.read_csv('additional_properties/NEWDELHI_typhoons_additional_properties.csv', encoding = 'latin-1')
        case "KMA":
            typhoon_database = pd.read_csv('additional_properties/KMA_typhoons_additional_properties.csv', encoding = 'latin-1')
        case _:
            typhoon_database = pd.read_csv('additional_properties/WMO_typhoons_additional_properties.csv', encoding = 'latin-1')
    
    return typhoon_database
    

def coordinates_cleaner(list_of_coordinates):
    list_of_coordinates = list_of_coordinates.replace('[', '')
    list_of_coordinates = list_of_coordinates.replace(']', '')
    return re.findall(r"\(\d+\.\d+, \d+\.\d+, \d\)", list_of_coordinates)

def coordinates_to_dict(typhoon_database, year_range, unique_sid, inputs):
    recent_typhoons_dict = {}
    recent_typhoons_dict_closest_to_farthest = {}
    typhoon_names = {}
    typhoon_scores = {} # gagamitin ko eto para malaman ko kung ano yung sid nung top k typhoons sa scores. yung score ay key tapos yung sid yung value. may ran into a problem if may parehong score pero i think improbable
    scores = [] # will hold the distance scores of each typhoon compared to the new typhoon

    # nilalagay sa recent typhoons dict yung mga coordinates per typhoon (sid ginagamit as key, yung coordinates (naka 2dimensional array siya) ginagamit as value)
    for index, row in typhoon_database.iterrows():
        list_of_coordinates = row['COORDINATES']
        year = int(row['SID'][0:4])


        if (len(year_range) != 0 and (year < year_range[0] or year > year_range[1])):
            continue
        
        # just removes all the unnecessary characters inside the coordinates
        list_of_coordinates = list_of_coordinates.replace('[', '')
        list_of_coordinates = list_of_coordinates.replace(']', '')
        coordinates = re.findall(r"\(\d+\.\d+, \d+\.\d+, \d\)", list_of_coordinates)
        
        sid = unique_sid[index]
        recent_typhoons_dict[sid] = np.empty((0,3)) # initializing an empty 2d np array

 
        closest_index = [-1,-1] # will contain the index of the coordinate sa typhoon in the current iteration is closest dun sa first coordinate nung bagong typhoon; first element is index, second element is yung distance niya compared to the first coordinate ng bagyo


        # this loop finds the closest point of the typhoon in the database to the first point of the new typhoon
        for index, coordinate in enumerate(coordinates): # para makuha yung index
            temp = coordinate
            temp = temp.replace('(', '')
            temp = temp.replace(')', '')
            temp = temp.split(',')
            temp = np.array(list(map(float, temp))) # converted the coordinates to a float instead of a string
       

            distance = np.linalg.norm(temp[:2] - inputs[0,:2])
     
            # hinahanap neto yung i coconsider as first point sa mga bagyo sa training set
            if closest_index[0] == -1:
                closest_index[0] = index
                closest_index[1] = distance
            elif distance < closest_index[1]:
                closest_index[0] = index
                closest_index[1] = distance

            recent_typhoons_dict[sid] = np.vstack((recent_typhoons_dict[sid], temp))
        
        


        #  this obtains the time gaps in between track records of the typhoon (e.g., first track was obtained at 9am, second track was obtained at 10 am so the time gap is 1)
        typhoon_iso_time = (recent_typhoons_dict[sid][closest_index[0] + 1:, 2]).flatten() 
 
        # same thing is happening in input_iso_time but it is done for the incoming typhoon
        # .flatten() ginagawang 1d array kasi originally 2d array eto pero yung list element nagcocontain lng ng isang element
        input_iso_time = inputs[1:,2].flatten() 


        # typhoon_indices will contain the indices of the coordinates of the old typhoon (which is being compared to the new one) that is similar in terms of time to the new typhoon
        # e.g., new typhoon's input data is (8.11, 129.2, 3), (8.12, 129.5, 3)
        # and old typhoon's data is (16.5, 123.8, 2), (16.6, 123.5, 3), (16.7, 123.2, 3), (16.8, 122.9, 3), (16.8, 122.8, 1)
        # out of the old typhoon's data, what will be chosen is (16.5, 123.8, 2), (16.6, 123.5, 3)
        typhoon_indices = [closest_index[0]] 
        current_index_increment = closest_index[0] + 1

    
  
        # this section ay para sa paghanap ng mga points while considering yung gap of time between records nung training data typhoons and yung bagong typhoon
        for input_time in input_iso_time:
            closest_time_index = [float('inf'), float('-inf')] #first element is index, second element is yung difference in time
            current_time = 0
            for index, typhoon_time in enumerate(typhoon_iso_time):
                current_time += typhoon_time
                if current_time == input_time:
                    closest_time_index = [index + current_index_increment, 0]
                    typhoon_iso_time = np.delete(typhoon_iso_time, slice(0, index + 1)) # basically, idedelete neto yung mga tinignan ng typhoon_iso_time to make way for the next iteration
                    current_index_increment += index + 1 # index + 1 is the number of elements removed
                    break
                else:
                    closest_time_index = [index + current_index_increment, abs(current_time - input_time)] if closest_time_index[1] > abs(current_time - input_time) else closest_time_index 
                    if current_time > input_time:
                        # print(typhoon_iso_time, index + 1, closest_time_index[0])
                        typhoon_iso_time = np.delete(typhoon_iso_time, slice(0, index))
                        current_index_increment += index
                        break
                
            typhoon_indices.append(closest_time_index[0])
        
        try:
            distance_of_tracks = np.linalg.norm(inputs[:, :2] - recent_typhoons_dict[sid][typhoon_indices, :2]) # frobenius
            # distance_of_tracks = np.sum(np.linalg.norm(inputs[:, :2] - recent_typhoons_dict[sid][typhoon_indices, :2], axis = 1)) # per point euclidean distance
            # if secret < 6:
            #     secret += 1
            #     print("frobenius", distance_of_tracks)
            #     print("per-point", np.sum(np.linalg.norm(inputs[:, :2] - recent_typhoons_dict[sid][typhoon_indices, :2], axis = 1)))

        except:
            continue
        score = distance_of_tracks.mean()
        
        recent_typhoons_dict_closest_to_farthest[sid] = recent_typhoons_dict[sid][typhoon_indices + list(range(typhoon_indices[-1] + 1, recent_typhoons_dict[sid].shape[0])), :]

        typhoon_names[sid] = row['NAME']
            
        if score in typhoon_scores:
            typhoon_scores[score].append(sid)
        else:
            typhoon_scores[score] = [sid]        
            scores.append(score)
        scores = sorted(scores)

    return [recent_typhoons_dict_closest_to_farthest, typhoon_names, typhoon_scores, scores]


# pag compute ng weights ay 1/(distance + 1e-8). nilagyan ng 1e-8 para if distance is 0, di magka error. the lower the denominator, the higher the weight
# this gets the minimum amount of records contained dun sa mga tracks ng pinakamalapit na typhoons in terms of coordinates
def determine_weights(recent_typhoons_dict_closest_to_farthest, typhoon_scores, scores, neighbors):
    minimum = float('inf')  # random high number lang eto
    weights = []
    i = 0
    while i < neighbors:
        list_of_sid = typhoon_scores[scores[i]]
        for sid in list_of_sid:
            weights.append(1/(scores[i] + 1e-8))
            tracks = recent_typhoons_dict_closest_to_farthest[sid]
            if len(tracks) < minimum:
                minimum = len(tracks)
            i += 1
            if i >= neighbors:
                return [weights, minimum]
            
            
    return [weights, minimum]

def predicted_track(recent_typhoons_dict_closest_to_farthest, typhoon_scores, scores, weights, inputs, minimum, neighbors):
    total_tracks = np.empty((minimum,3))
    total_tracks.fill(0)
    
    # nilalagay ko lng yung tracks given as input. as is na siya sa total tracks. di siya mababago
    total_tracks[0:inputs.shape[0], :] += inputs
    # ginagawa naman dito ay from all the neighbors, kukunin yung values from index [inputs.shape[0], minimum] -- this is because yung index 0 to inputs.shape - 1 ay binigay na ng user --
    # (continuation) at i-aadd sa total tracks.
    i = 0
    scores_counter = 0
    while i < neighbors:
        list_of_sid = typhoon_scores[scores[scores_counter]]
        
        for sid in list_of_sid:
            tracks = recent_typhoons_dict_closest_to_farthest[sid]
    
            temp_tracks = np.empty((minimum,3))
            temp_tracks.fill(0)
            for j in range(inputs.shape[0], minimum):
                temp_tracks[j] += tracks[j] * weights[i] # yung track ng typhoon will now be multiplied by its weight
            total_tracks += temp_tracks
            i += 1
            if i >= neighbors:
                return total_tracks
            
        scores_counter += 1

    return total_tracks
        
        
        