import string
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd 
from test import typhoon_tracker, scores_printer, names_printer, year_range_getter

app = FastAPI()

class Item(BaseModel):
    text: str = None
    is_done: bool = False

class Body(BaseModel):
    coordinates: List[List[float]]
    database: str
    range: List[int]

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
        
    data = typhoon_tracker(list_coordinates, body.database, body.range)
    list_coordinates.clear()
    return data

@app.get('/neighbors')
def get_neighbors():
    return scores_printer()

@app.get('/neighbors_names')
def get_names():
    return names_printer()

@app.get('/year_getter')
def get_years():
    return year_range_getter()