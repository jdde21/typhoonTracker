from test import typhoon_tracker, sid_track_scores_dict, names_printer, year_range_getter, wind_speed_and_pressure_getter, all_typhoons_tracks_getter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from datetime import timezone, datetime
from fastapi import FastAPI, Query
from typing import List, Optional
from pymongo import MongoClient
from dotenv import load_dotenv
from pydantic import BaseModel
from zoneinfo import ZoneInfo
import pandas as pd 
import re
import os

PATTERN = re.compile(r'\b[A-Z]{2,}\b')
ACCEPTABLE_HOURS = 12

app = FastAPI()

class Item(BaseModel):
    text: str = None
    is_done: bool = False

class Body(BaseModel):
    coordinates: List[List[float]]
    database: str
    range: List[int]
    neighbors: int

items = []
list_coordinates = []

origins = [
    "http://localhost",
    "http://localhost:5173",
]

recent_typhoons = pd.read_csv('recent_typhoons_cleaned_all_coordinates_horizontal.csv', encoding = 'latin-1')
unique_sid = list(dict.fromkeys(recent_typhoons["SID"].tolist())) # removes duplicates while maintaining the same order

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
MONGO_URI = os.environ["MONGO_URI"]
CLIENT = MongoClient(MONGO_URI)
DB = CLIENT["typhoon_tracker"]
COLLECTION = DB["storm_records"]
WEATHER_DISTURBANCES_COLLECTION = DB["live_weather_disturbances"]


@app.get('/')
def root():
    return {'hello': 'world'}

@app.post('/append')
def append(item: Item):
    items.append(item)
    return items

@app.post('/input')
def input_coordinates(body: Body):
    for coordinate in body.coordinates:
        list_coordinates.append(coordinate)
    if body.range[0] == 0:
        body.range = []
        
    data = typhoon_tracker(list_coordinates, body.database, body.range, body.neighbors)
    list_coordinates.clear()
    return data

@app.get('/neighbors')
def get_neighbors():
    return sid_track_scores_dict()

@app.get('/neighbors_names')
def get_names():
    return names_printer()

@app.get('/year_getter')
def get_years():
    return year_range_getter()

@app.get('/neighbors_wind_speed_and_pressure/{database}')
def get_wind_speed_and_pressure(database: str):
    return wind_speed_and_pressure_getter(database)

@app.get('/all_typhoons/{database}')
def get_all_typhoons(database: str, start: Optional[str] = None, end: Optional[str] = None):
    if start == "-Infinity" or end == "Infinity":
        return all_typhoons_tracks_getter(database)
    return all_typhoons_tracks_getter(database, [int(start), int(end)])

@app.get("/get_live_typhoons")
def get_live_typhoons(name: str):
    live_typhoon_list = WEATHER_DISTURBANCES_COLLECTION.find_one()["names"]
    if name not in live_typhoon_list:
        return 
    
    typhoon_records = []
    typhoon_records.append(COLLECTION.find_one({"name": name}))
    
    # as of now, kaya pa lang ma display isang live typhoon
    record = typhoon_records[0]
    coordinates = record['coordinates_timegap']
    return coordinates

@app.get("/get_live_typhoons_names")
def get_live_typhoons_names():
    live_typhoon_list = WEATHER_DISTURBANCES_COLLECTION.find_one()["names"]
    return live_typhoon_list

# @app.get('/most_recent')
# def get_most_recent():
#     most_recent = collection.find_one(sort=[("timestamp", -1)])
#     utc_time = most_recent["timestamp"].replace(tzinfo=timezone.utc)
#     hours = gap_hours(utc_time)
#     most_recent["_id"] = str(most_recent["_id"])
#     if hours <= ACCEPTABLE_HOURS:
#         temp = PATTERN.search(most_recent["name"])
#         name = temp.group(0) if temp else None
#         print("name", name)
#         coordinates = most_recent["coordinates"]
#         year = utc_time.year
#         add(f"{name} {year}", coordinates, utc_time)
    
#     return jsonable_encoder(most_recent)

# def gap_hours(utc_time):
#     ph_time = utc_time.astimezone(ZoneInfo("Asia/Manila"))
#     ph_now = datetime.now(ZoneInfo("Asia/Manila"))
#     gap = ph_now - ph_time
#     return int(gap.total_seconds() // 3600)

# def add(name, coordinates, most_recent):
#     doc = permanent_collection.find_one({"name": name})

#     if doc:
#         coordinates_timegap = doc["coordinates_timegap"]
#         recent_timestamp = doc["recent_timestamp"].replace(tzinfo=timezone.utc)
#         if recent_timestamp == most_recent:
#             return
        
#     else:
#         coords = [float(x.strip()) for x in coordinates.split(",")]
#         coords.append(0)
#         new_doc = {
#             "name": name,
#             "coordinates_timegap": [coords], 
#             "recent_timestamp": most_recent
#         }
#         permanent_collection.insert_one(new_doc)