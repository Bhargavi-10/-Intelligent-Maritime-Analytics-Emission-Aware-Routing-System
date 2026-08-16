# -*- coding: utf-8 -*-
"""
Created on Mon Apr  6 16:59:26 2026

@author: bharg
"""

# -*- coding: utf-8 -*-
"""
Created on Sat Apr  6 2026
@author: bharg
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from xgboost import XGBRegressor
import joblib

# -----------------------------
# Load dataset
# -----------------------------
df = pd.read_csv('ship_fuel_efficiency.csv')

# Compute fuel per km
df["fuel_per_km"] = df["fuel_consumption"] / df["distance"]

# -----------------------------
# Features & target
# -----------------------------
X = df.drop(["fuel_consumption", "fuel_per_km"], axis=1)
y = df["fuel_per_km"]

# Categorical & numerical columns
categorical_cols = ["ship_type", "route_id", "fuel_type", "weather_conditions", "month"]
numerical_cols = ["distance", "engine_efficiency"]

# -----------------------------
# Preprocessing pipeline
# -----------------------------
preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
    ("num", "passthrough", numerical_cols)
])

# -----------------------------
# XGBoost model pipeline
# -----------------------------
fuel_model = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", XGBRegressor(objective='reg:squarederror', n_estimators=100, random_state=42))
])

# -----------------------------
# Train-test split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
fuel_model.fit(X_train, y_train)

# -----------------------------
# Save model
# -----------------------------
joblib.dump(fuel_model, "fuel_model.pkl")
print("Fuel prediction model saved successfully!")

print("xgboost installed successfully")