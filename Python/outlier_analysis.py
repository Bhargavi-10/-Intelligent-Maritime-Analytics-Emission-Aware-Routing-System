# -*- coding: utf-8 -*-
"""
Created on Fri Apr 10 21:05:36 2026

@author: bharg
"""

import pandas as pd
import numpy as np

def get_outlier_stats(df):
    columns = ['fuel_consumption', 'distance', 'CO2_emissions']
    
    stats = {}
    boxplot_data = {}
    
    for col in columns:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        
        outliers_low = len(df[df[col] < lower])
        outliers_high = len(df[df[col] > upper])
        
        stats[col] = {
            'outliers_low': outliers_low,
            'outliers_high': outliers_high,
            'total': len(df),
            'Q1': float(Q1), 
            'Q3': float(Q3),
            'min': float(df[col].min()), 
            'max': float(df[col].max())
        }
        
        boxplot_data[col] = {
            'min': float(df[col].min()),
            'Q1': float(Q1),
            'median': float(df[col].median()),
            'Q3': float(Q3),
            'max': float(df[col].max()),
            'outliers': df[(df[col] < lower) | (df[col] > upper)][col].tolist()
        }
    
    return stats, boxplot_data