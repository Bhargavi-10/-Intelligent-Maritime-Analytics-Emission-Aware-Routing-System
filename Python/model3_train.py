# -*- coding: utf-8 -*-
"""
Created on Tue Apr  7 07:54:30 2026

@author: bharg
"""

# -*- coding: utf-8 -*-
"""
CO2 Emission Prediction Model
"""

import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
import pickle

# Load dataset
df = pd.read_csv("ship_fuel_efficiency.csv")

# -------- SEASON FEATURE --------
def get_season(month):
    if month in ['November','December','January','February','March']:
        return 'Summer'
    elif month in ['April','May','June']:
        return 'Spring'
    else:
        return 'Autumn'

df['season'] = df['month'].apply(get_season)

# -------- DROP UNUSED --------
df = df.drop(columns=['ship_id', 'route_id', 'month'])

# -------- ENCODING --------
categorical_cols = ['ship_type','fuel_type','weather_conditions','season']
encoders = {}

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# -------- FEATURES --------
X = df[['ship_type','distance','fuel_type',
        'weather_conditions','engine_efficiency','season']]

y = df['CO2_emissions']

# -------- MODEL --------
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# -------- SAVE --------
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(encoders, open("encoders.pkl", "wb"))

print("Model trained & saved successfully ✅")