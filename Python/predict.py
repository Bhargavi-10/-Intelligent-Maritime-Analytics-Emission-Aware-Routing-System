# -*- coding: utf-8 -*-
"""
Created on Sat Apr  4 21:19:34 2026

@author: bharg
"""
# -*- coding: utf-8 -*-

import pandas as pd
import joblib
import pickle

# -----------------------------
# LOAD MODELS
# -----------------------------
model = joblib.load("model.pkl")
columns = joblib.load("columns.pkl")

fuel_model = joblib.load("fuel_model.pkl")

# CO2 MODEL (NEW)
co2_model = pickle.load(open("model.pkl", "rb"))
encoders = pickle.load(open("encoders.pkl", "rb"))

categorical_cols = ['ship_type','fuel_type','weather_conditions','season']


# -----------------------------
# COST PREPROCESS
# -----------------------------
def preprocess_input(input_data):
    import json

    if isinstance(input_data, str):
        input_data = json.loads(input_data)

    fuel_type = input_data.get('fuel_type', '').strip().upper()
    fuel_price_map = {'HFO': 850, 'DIESEL': 1700}

    input_data['fuel_price'] = fuel_price_map.get(fuel_type, 0)

    input_df = pd.DataFrame([input_data])
    input_df = pd.get_dummies(input_df)
    input_df = input_df.reindex(columns=columns, fill_value=0)

    return input_df


# -----------------------------
# ROUTE OPTIMIZATION
# -----------------------------
def find_optimal_route_fuel(df, fuel_model, input_data):

    results = []
    override_keys = ['fuel_type', 'engine_efficiency']

    for route in df['route_id'].unique():

        numeric_cols = df.select_dtypes(include='number').columns
        sample_numeric = df[df['route_id'] == route][numeric_cols].mean().to_dict()

        sample_categorical = {
            "ship_type": df[df['route_id'] == route]["ship_type"].mode()[0],
            "route_id": route,
            "fuel_type": input_data.get("fuel_type", "HFO"),
            "weather_conditions": df[df['route_id'] == route]["weather_conditions"].mode()[0],
            "month": df[df['route_id'] == route]["month"].mode()[0],
        }

        sample = {**sample_categorical, **sample_numeric}

        for key in override_keys:
            if key in input_data:
                sample[key] = input_data[key]

        input_df = pd.DataFrame([sample])

        fuel_per_km = fuel_model.predict(input_df)[0]
        total_fuel = fuel_per_km * sample['distance']

        results.append({
            "route_id": route,
            "predicted_fuel": total_fuel
        })

    best = pd.DataFrame(results).nsmallest(3, 'predicted_fuel')
    return best.to_dict(orient='records')


# =============================
# 🔥 CO2 LOGIC STARTS HERE
# =============================
def encode_input(data):
    df = pd.DataFrame([data])
    print("📊 Encoding values:", {col: df[col].iloc[0] for col in categorical_cols})
    
    for col in categorical_cols:
        val = df[col].iloc[0]
        try:
            df[col] = encoders[col].transform([val])[0]
        except ValueError as e:
            print(f"⚠️ Unseen {col}: '{val}' → using 0")
            df[col] = 0  # Default to first class
    
    return df

def predict_co2(data):
    df = encode_input(data)
    
    # 🔥 FIX: Select ONLY model features (exact order from training)
    model_features = ['ship_type', 'distance', 'fuel_type', 'weather_conditions', 'engine_efficiency', 'season']
    df = df[model_features]
    
    print("✅ Final features for prediction:", list(df.columns))
    result = co2_model.predict(df)
    return float(result[0])


def classify_emission(val):
    if val < 8000:
        return "Low"
    elif val < 12000:
        return "Medium"
    else:
        return "High"


def get_season_analysis(base_input):
    seasons = encoders['season'].classes_
    results = []

    for s in seasons:
        temp = base_input.copy()
        temp['season'] = s
        co2 = predict_co2(temp)
        results.append([s, round(co2, 2)])

    best = min(results, key=lambda x: x[1])
    return results, best


def generate_insight(data):
    insights = []

    if data['weather_conditions'] == "rough":
        insights.append("Rough weather increases emissions")

    if data['engine_efficiency'] < 30:
        insights.append("Low engine efficiency increases CO2")

    if data['distance'] > 300:
        insights.append("Long distance increases emissions")

    if not insights:
        insights.append("Conditions are optimal")

    return ". ".join(insights) + "."


def generate_suggestion(best_season, current_season):

    if best_season == current_season:
        return "You are already operating in the optimal season. Improve efficiency to further reduce CO2."

    else:
        return f"Operate in {best_season} season instead of {current_season} to reduce CO2."

def get_season(month):
    if month in ['November','December','January','February','March']:
        return 'Summer'
    elif month in ['April','May','June']:
        return 'Spring'
    else:
        return 'Autumn'


def full_co2_prediction(data):
    
    data['season'] = get_season(data['month'])
    co2 = predict_co2(data)

    emission_level = classify_emission(co2)

    season_results, best = get_season_analysis(data)

    insight = generate_insight(data)

    suggestion = generate_suggestion(best[0] , data['season'])

    return {
        "predicted_co2": round(co2, 2),
        "emission_level": emission_level,
        "best_season": best[0],
        "min_co2": best[1],
        "season_comparison": season_results,
        "insight": insight,
        "suggestion": suggestion
    }