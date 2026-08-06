from datetime import datetime, timezone
from pymongo import MongoClient
from dotenv import load_dotenv
from zoneinfo import ZoneInfo
from bs4 import BeautifulSoup
import requests
import certifi
import re
import os

PATTERN = re.compile(r'\b[A-Z]{2,}\b')

load_dotenv()
MONGO_URI = os.environ["MONGO_URI"]

CLIENT = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
DB = CLIENT["typhoon_tracker"]

COLLECTION = DB["storm_records"]
WEATHER_DISTURBANCES_COLLECTION = DB["live_weather_disturbances"]
LIVE_TYPHOON_LIST = WEATHER_DISTURBANCES_COLLECTION.find_one()

def get_last_coords(typhoon_name):
    last_record = COLLECTION.find_one({"name": typhoon_name})
    return last_record

    
def sanitize_filename(name):
    temp = PATTERN.search(name)
    name = temp.group(0) if temp else None
    return name

def gap_hours(utc_time):
    ph_time = utc_time.astimezone(ZoneInfo("Asia/Manila"))
    ph_now = datetime.now(ZoneInfo("Asia/Manila"))
    gap = ph_now - ph_time
    return int(gap.total_seconds() // 3600)

def save_data(data):
    new_typhoon_names = []
    
    for entry in data:
        for name, coords in entry.items():
            typhoon_name = sanitize_filename(name)
            new_typhoon_names.append(typhoon_name)
            new_coords = [float(coords[0]), float(coords[1])]
    
            last_record = get_last_coords(typhoon_name)
    
            if last_record and coordinates_comparer(new_coords, last_record["coordinates_timegap"][-1]):
                print(f"No change for: {name}")
                continue
            
            if last_record:
                last_record_coords = last_record["coordinates_timegap"]
                last_record_timestamp = last_record["recent_timestamp"].replace(tzinfo=timezone.utc)
                time_gap = gap_hours(last_record_timestamp)
                last_record_coords.append([*new_coords, time_gap])
                
                COLLECTION.update_one(
                    {"_id": last_record["_id"]},
                    {"$set": {
                        "recent_timestamp": datetime.now(timezone.utc),
                        "coordinates_timegap": last_record_coords
                    }}
                )
                print(f"Change detected, updated: {typhoon_name}")
            else:
                new_record = {
                    "name": typhoon_name,
                    "coordinates_timegap": [[*new_coords, 0]],
                    "recent_timestamp": datetime.now(timezone.utc)
                }
                COLLECTION.insert_one(new_record)
                print(f"Change detected, inserted: {typhoon_name}")
                
    WEATHER_DISTURBANCES_COLLECTION.update_one(
        {"_id": LIVE_TYPHOON_LIST["_id"]},
        {"$set": {"names": new_typhoon_names}}
    )
    
def coordinates_comparer(new_coords, last_coords):
    if new_coords[0] == last_coords[0] and new_coords[1] == last_coords[1]:
        return True
    return False

def coordinates_finder(li_items):
    for li in li_items:
        spans = li.find_all("span")
        if len(spans) > 1:
            label = spans[0].get_text(strip=True).rstrip(":")
            if label == 'Coordinates (Lat-Lon)':
                value = spans[1].get_text(strip=True)
                numbers = re.findall(r"\d+\.\d+", value)
                
                return numbers
        else:
            print("Unparsed li:", li.get_text(strip=True))
            return None
def scrape():
    url = "https://www.typhoon2000.ph/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    session = requests.Session()
    response = session.get(url, headers=headers, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Find the figure with class "table", then the ul inside it
    figures = soup.find_all("figure", class_="table")
    headings = soup.find_all("h5", class_="vc_custom_heading")
    list_of_data = []

    if headings:
        for index, heading in enumerate(headings):
            data = {}

            if (len(figures) != len(headings)):
                print("No figures")
                WEATHER_DISTURBANCES_COLLECTION.update_one(
                    {"_id": LIVE_TYPHOON_LIST["_id"]},
                    {"$set": {"names": []}}
                )
                # new_record = {
                #     "name": "None",
                #     "coordinates": f"{[0,0]}",
                #     "timestamp": datetime.now(timezone.utc)
                # }
                # COLLECTION.insert_one(new_record)
                return
                
            figure = figures[index]
            li_items = figure.find_all("li", class_="subtext")

            data[heading.get_text(strip=True)] = coordinates_finder(li_items)
            list_of_data.append(data)
            print(data)

    else:
        print("Figure/table not found — page structure may have changed.")
    
    save_data(list_of_data)

        
if __name__ == "__main__":
    scrape()