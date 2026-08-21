from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import warnings
from typing import List

warnings.filterwarnings("ignore")

app = FastAPI(title="OKR ML Service")

class ForecastRequest(BaseModel):
    data: List[float]

@app.post("/forecast")
def forecast(req: ForecastRequest):
    data = req.data
    
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Not enough data points")
    
    if len(data) == 1:
        return {"forecast": round(data[0], 2)}
        
    try:
        # Using simple ARIMA for small datasets
        order = (1, 0, 0) if len(data) >= 3 else (0, 1, 0)
        
        model = ARIMA(data, order=order)
        model_fit = model.fit()
        
        forecast_array = model_fit.forecast(steps=1)
        forecast_value = float(forecast_array.iloc[0] if hasattr(forecast_array, 'iloc') else forecast_array[0])
        forecast_value = max(0.0, min(100.0, float(forecast_value)))
        
        return {"forecast": round(forecast_value, 2)}
    except Exception as e:
        # Fallback to simple moving average
        sma = sum(data) / len(data)
        return {"forecast": round(sma, 2), "warning": str(e)}

@app.get("/health")
def health():
    return {"status": "ok"}
