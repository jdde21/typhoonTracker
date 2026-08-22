import pandas as pd 


def main():
    df = pd.read_csv('typhoons.csv', encoding = 'latin-1')

    cleaned = df[df["SEASON"] != "Year"]
    cleaned["SEASON"] = cleaned["SEASON"].astype(int)
    recent_typhoons = cleaned#[cleaned["SEASON"] >= 2000]
    column_names = list(recent_typhoons.columns)
    proper_names = ["LAT", "LON", "NAME", "SEASON", "SID", "ISO_TIME"]
    for name in column_names:
        if name not in proper_names:
            recent_typhoons = recent_typhoons.drop(name, axis=1)

    # recent_typhoons = recent_typhoons[recent_typhoons["TOKYO_WIND"].str.len() > 1]


    # name_count = {}
    # for name in recent_typhoons["SID"]:
    #     try:
    #         name_count[name] += 1
    #     except:
    #         name_count[name] = 1


    # keys = list(name_count.keys())
    # keys = sorted(keys)
    # for key in keys:
    #     print(f"{key}: {name_count[key]}")
        
    recent_typhoons.to_csv("recent_typhoons_cleaned_all_coordinates_only.csv", index=False)

main()

