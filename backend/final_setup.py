import pandas as pd
import time

def main():
    start = time.time()

    recent_typhoons = pd.read_csv('recent_typhoons_cleaned_all_coordinates_only.csv', encoding = 'latin-1')

    unique_sid = list(dict.fromkeys(recent_typhoons["SID"].tolist())) # removes duplicates while maintaining the same order

    clean = {
        "SID": [],
        "COORDINATES": [],
        "NAME": [],
    }

    for sid in unique_sid:
        name = True
        coordinates = []
        past_time = -1

        for index, row in recent_typhoons.iterrows():

            temp_coordinates = ()
            if row["SID"] == sid:
                if name:
                    clean["NAME"].append(row["NAME"])
                    name = False
                else: # this is for random forest setup. comment out this block if not random forest
                    coordinates[-1] += (row["LAT"],)
                    coordinates[-1] += (row["LON"],)
                    
                temp_coordinates += (row["LAT"],)
                temp_coordinates += (row["LON"],)
            
                temp_time = row["ISO_TIME"]
                iso_time = temp_time.split()[1]
                hour = int(iso_time.split(':')[0]) if int(iso_time.split(':')[0]) != 0 else 0 if past_time == -1 else 24 # if first in the entry for the specific typhoon, 0 but if not first and hour is equal to 0, then 24

                if past_time == -1:
                    temp_coordinates += (0,)
                    past_time = hour
                else:
                    elapsed_hours = hour - past_time
                    temp_coordinates += (elapsed_hours,)
                    past_time = hour % 24 # if wala yung modulo, magiging 24 yung past_time. masisira yung pag calculate sa mga succeeding hours
                coordinates.append(temp_coordinates)
                recent_typhoons = recent_typhoons.drop(index)
            else:
                recent_typhoons = recent_typhoons.reset_index(drop=True)
                break
        del coordinates[-1] # this is for random forest setup. comment out this line if not random forest
        clean["COORDINATES"].append(coordinates)
        clean["SID"].append(sid)



    new = pd.DataFrame(clean)

    new.to_csv("rf_new_data.csv", index = False)

    end = time.time()
    print("Elapsed time:", end - start, "seconds")

main()