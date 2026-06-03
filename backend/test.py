import pandas as pd 
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import confusion_matrix
from sklearn.metrics import classification_report
import numpy as np
import re
from helper import get_database_by_agency, coordinates_to_dict, determine_weights


SCORES = []
TYPHOON_SCORES = []
MINIMUM = 0
STARTING_POINT = 0
TRACKS = []
NEIGHBORING_TYPHOON_NAMES = {}

def typhoon_tracker(coordinates=None, agency="Default", year_range = []):
    
    typhoon_database = get_database_by_agency(agency)

    unique_sid = list(dict.fromkeys(typhoon_database["SID"].tolist())) # removes duplicates while maintaining the same order

    inputs = np.empty((0,3))
    for coordinate in coordinates:
        inputs = np.vstack((inputs, coordinate))
    number_of_track_reports = inputs.shape[0]
    
    neighbors = 7

    # recent_typhoons_dict_closest_to_farthest is a dict containing the sid as a key and the tracks/coordinates as the value
    # typhoon_names is a dict containing the sid as a key and the name of the typhoon that corresponds with the sid as the value
    # typhoon_scores is a dict containing the euclidean distance as a key and the sid as the value
    # scores is a list containing the euclidean distance of each typhoon 
    # the function coordinates_to_dict() primarily converts the tracks/coordinates in the typhoon_database into clean data and place inside a dict
    recent_typhoons_dict_closest_to_farthest, typhoon_names, typhoon_scores, scores = coordinates_to_dict(typhoon_database, year_range, unique_sid, inputs)
   
    # pag compute ng weights ay 1/(distance + 1e-8). nilagyan ng 1e-8 para if distance is 0, di magka error. the lower the denominator, the higher the weight
    # this gets the minimum amount of records contained dun sa mga tracks ng pinakamalapit na typhoons in terms of coordinates
    weights, minimum = determine_weights(recent_typhoons_dict_closest_to_farthest, typhoon_scores, scores, neighbors)

     # just initializing the global variables SCORES so that the scores generated in this function can be used in other functions
    global SCORES
    global TYPHOON_SCORES
    global STARTING_POINT
    global MINIMUM
    global TRACKS
    global NEIGHBORING_TYPHOON_NAMES
    TYPHOON_SCORES = typhoon_scores
    SCORES = scores[0:neighbors]
    MINIMUM = minimum
    STARTING_POINT = number_of_track_reports # same as inputs.shape[0]
    TRACKS = recent_typhoons_dict_closest_to_farthest
    NEIGHBORING_TYPHOON_NAMES = typhoon_names

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
    return total_tracks.tolist()


def scores_printer():
    dict_of_tracks = {}
    for index, scores in enumerate(SCORES):
        sid = TYPHOON_SCORES[scores]
        temp = TRACKS[sid]
        temp = temp[0:MINIMUM]
        dict_of_tracks[sid] = temp.tolist()

    return dict_of_tracks


def names_printer():
    return NEIGHBORING_TYPHOON_NAMES


if __name__ == "__main__":
    typhoon_tracker()
    scores_printer()