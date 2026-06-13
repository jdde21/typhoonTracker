import numpy as np
from helper import get_database_by_agency, coordinates_to_dict, determine_weights, predicted_track, get_database_by_agency_additional_properties


SCORES = []
TYPHOON_SCORES = []
MINIMUM = 0
STARTING_POINT = 0
TRACKS = []
NEIGHBORING_TYPHOON_NAMES = {}

def typhoon_tracker(coordinates=None, agency="Default", year_range = [], neighbors=7):
    
    typhoon_database = get_database_by_agency(agency)

    unique_sid = list(dict.fromkeys(typhoon_database["SID"].tolist())) # removes duplicates while maintaining the same order

    inputs = np.empty((0,3))
    for coordinate in coordinates:
        inputs = np.vstack((inputs, coordinate))
    number_of_track_reports = inputs.shape[0]
    
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

    total_tracks = predicted_track(recent_typhoons_dict_closest_to_farthest, typhoon_scores, scores, weights, inputs, minimum, neighbors)
  
    total_tracks[inputs.shape[0]:, :] /= np.array(weights).sum() # instead of neighbors, yung sum ng weights magiging denominator
    return total_tracks.tolist()


def sid_track_scores_dict():
    dict_of_tracks = {}
    for score in SCORES:
        sid = TYPHOON_SCORES[score]
        temp = TRACKS[sid]
        temp = temp[0:MINIMUM]
        dict_of_tracks[sid] = [temp.tolist(), score]

    return dict_of_tracks


def names_printer():
    return NEIGHBORING_TYPHOON_NAMES

def year_range_getter():
    TYPHOON_AGENCIES = ["Default", "JTWC", "JMA", "CMA", "HKO", "IMD", "KMA"]
    database_year_range = {}
    for agency in TYPHOON_AGENCIES:
        typhoon_database = get_database_by_agency(agency)
        first_year = int(typhoon_database["SID"].iloc[0][0:4])
        last_year = int(typhoon_database["SID"].iloc[-1][0:4])
        database_year_range[agency] = [first_year, last_year]
    
    return database_year_range
    
def wind_speed_and_pressure_getter(agency):
    typhoon_database = get_database_by_agency_additional_properties(agency)
    
    neighboring_typhoons_additional_properties = {}
    for score in SCORES:
        sid = TYPHOON_SCORES[score]
        additional_properties = typhoon_database[typhoon_database["SID"] == sid]
        print(additional_properties, sid)
        neighboring_typhoons_additional_properties[sid] = additional_properties.tolist()
        
    return neighboring_typhoons_additional_properties
        

if __name__ == "__main__":
    year_range_getter()
    # typhoon_tracker()
    # scores_printer()
    