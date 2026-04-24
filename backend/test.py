import pandas as pd 
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import confusion_matrix
from sklearn.metrics import classification_report
import numpy as np
import re



def typhoon_tracker(coordinates):
    recent_typhoons = pd.read_csv('recent_typhoons_cleaned_all_coordinates_horizontal.csv', encoding = 'latin-1')
    unique_sid = list(dict.fromkeys(recent_typhoons["SID"].tolist())) # removes duplicates while maintaining the same order

    inputs = np.empty((0,3))

    for coordinate in coordinates:
        inputs = np.vstack((inputs, coordinate))

    # inputs = np.vstack((inputs, [8.10, 128.6, 0]))
    # inputs = np.vstack((inputs, [8.20, 127.90, 3]))
    # inputs = np.vstack((inputs, [8.30, 127.40, 3]))
    # inputs = np.vstack((inputs, [8.5, 127.0, 3]))
    #inputs = np.vstack((inputs, [9.2, 124.7, 12]))
    #inputs = np.vstack((inputs, [10.2, 122.7, 12]))

    # inputs = np.vstack((inputs, [11.3, 137.7, 0]))
    # inputs = np.vstack((inputs, [11.6, 137.8, 6]))
    # inputs = np.vstack((inputs, [12.2, 137.6, 6]))

    # inputs = np.vstack((inputs, [12.0, 137.3, 6]))
    # inputs = np.vstack((inputs, [10.5, 136.9, 6]))
    # inputs = np.vstack((inputs, [10.5, 137.3, 6]))

    # inputs = np.vstack((inputs, [10.9, 138.6, 6]))
    # inputs = np.vstack((inputs, [10.2, 138.2, 6]))
    # inputs = np.vstack((inputs, [10.6, 138.7, 6]))


    # inputs = np.vstack((inputs, [11.3, 137.7, 0]))
    # inputs = np.vstack((inputs, [11.6, 137.8, 6]))
    # inputs = np.vstack((inputs, [12.2, 137.6, 6]))

    number_of_track_reports = inputs.shape[0]

    recent_typhoons_dict = {}
    recent_typhoons_dict_closest_to_farthest = {}

    typhoon_scores = {} # gagamitin ko eto para malaman ko kung ano yung sid nung top k typhoons sa scores. yung score ay key tapos yung sid yung value. may ran into a problem if may parehong score pero i think improbable
    scores = [] # will hold the distance scores of each typhoon compared to the new typhoon
    neighbors = 7

    # nilalagay sa recent typhoons dict yung mga coordinates per typhoon (sid ginagamit as key, yung coordinates (naka 2dimensional array siya) ginagamit as value)
    for index, row in recent_typhoons.iterrows():
        list_of_coordinates = row['COORDINATES']
        list_of_coordinates = list_of_coordinates.replace('[', '')
        list_of_coordinates = list_of_coordinates.replace(']', '')
        coordinates = re.findall(r"\(\d+\.\d+, \d+\.\d+, \d\)", list_of_coordinates)
        
        sid = unique_sid[index]
        recent_typhoons_dict[sid] = np.empty((0,3)) # initializing an empty 2d np array
        
        closest_index = [-1,-1] # will contain the index of the coordinate sa typhoon in the current iteration is closest dun sa first coordinate nung bagong typhoon; first element is index, second element is yung distance niya compared to the first coordinate ng bagyo

        for index, coordinate in enumerate(coordinates): # para makuha yung index
            temp = coordinate
            temp = temp.replace('(', '')
            temp = temp.replace(')', '')
            temp = temp.split(',')
            temp = np.array(list(map(float, temp)))

            distance = np.linalg.norm(temp[:2] - inputs[0,:2])

            # hinahanap neto yung i coconsider as first point sa mga bagyo sa training set
            if closest_index[0] == -1:
                closest_index[0] = index
                closest_index[1] = distance
            elif distance < closest_index[1]:
                closest_index[0] = index
                closest_index[1] = distance

            recent_typhoons_dict[sid] = np.vstack((recent_typhoons_dict[sid], temp))
        

        typhoon_iso_time = (recent_typhoons_dict[sid][closest_index[0] + 1:, 2]).flatten()
        input_iso_time = inputs[1:,2].flatten() # .flatten() ginagawang 1d array kasi originally 2d array eto pero yung list element nagcocontain lng ng isang element
        typhoon_indices = [closest_index[0]]
        current_index_increment = closest_index[0] + 1

        # this section ay para sa paghanap ng mga points while considering yung gap of time between records nung training data typhoons and yung bagong typhoon
        for input_time in input_iso_time:
            closest_time_index = [1000, 1000] #yung 1000 arbitrary number lang yan. nilakihan ko para palaging less than yung difference ng abs(current_time - input_time). first element is index, second element is yung difference in time
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
                        typhoon_iso_time = np.delete(typhoon_iso_time, slice(0, index + 1))
                        current_index_increment += index + 1
                        break
                
            typhoon_indices.append(closest_time_index[0])

        
        
        try:
            # print(inputs[:, :2])
            # print(recent_typhoons_dict[sid][typhoon_indices, :2])
            # print(inputs[:, :2] - recent_typhoons_dict[sid][typhoon_indices, :2])
            distance_of_tracks = np.linalg.norm(inputs[:, :2] - recent_typhoons_dict[sid][typhoon_indices, :2])
        except:
            continue
        score = distance_of_tracks.mean()
        
        recent_typhoons_dict_closest_to_farthest[sid] = recent_typhoons_dict[sid][typhoon_indices + list(range(typhoon_indices[-1] + 1, recent_typhoons_dict[sid].shape[0])), :]

        typhoon_scores[score] = sid
        scores.append(score)
        scores = sorted(scores)


    minimum = 1000 # random high number lang eto
    weights = []
    # pag compute ng weights ay 1/(distance + 1e-8). nilagyan ng 1e-8 para if distance is 0, di magka error. the lower the denominator, the higher the weight
    # this gets the minimum amount of records contained dun sa mga tracks ng pinakamalapit na typhoons in terms of coordinates
    for i in range(neighbors):
        sid = typhoon_scores[scores[i]]
        if i == 0:
            print(sid)
        weights.append(1/(scores[i] + 1e-8))
        tracks = recent_typhoons_dict_closest_to_farthest[sid]
        if len(tracks) < minimum:
            minimum = len(tracks)

    



    # this will be where the final predicted tracks will be placed
    total_tracks = np.empty((minimum,3))
    total_tracks.fill(0)

    # nilalagay ko lng yung tracks given as input. as is na siya sa total tracks. di siya mababago
    total_tracks[0:inputs.shape[0], :] += inputs
    # ginagawa naman dito ay from all the neighbors, kukunin yung values from index [inputs.shape[0], minimum] -- this is because yung index 0 to inputs.shape - 1 ay binigay na ng user --
    # (continuation) at i-aadd sa total tracks.
    for i in range(neighbors):
        sid = typhoon_scores[scores[i]]
        tracks = recent_typhoons_dict_closest_to_farthest[sid]

        temp_tracks = np.empty((minimum,3))
        temp_tracks.fill(0)
        for j in range(inputs.shape[0], minimum):
            temp_tracks[j] += tracks[j] * weights[i] # yung track ng typhoon will now be multiplied by its weight
        total_tracks += temp_tracks



    total_tracks[inputs.shape[0]:, :] /= np.array(weights).sum() # instead of neighbors, yung sum ng weights magiging denominator
    print(total_tracks)
    return total_tracks.tolist()
