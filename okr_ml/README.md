# OKR ML Service

Predictive performance forecasting microservice for the **OKRSystem (Objecto)** platform. This service runs a time-series forecasting model using ARIMA (AutoRegressive Integrated Moving Average) with an automated Simple Moving Average (SMA) fallback to project upcoming quarterly OKR completion percentages.

---

## Features

- **FastAPI REST API**: High-performance, lightweight asynchronous Python API.
- **Time-Series Forecasting**: Uses `statsmodels.tsa.arima.model.ARIMA` on historical quarterly completion percentages.
- **Resilient Fallbacks**: Smoothly defaults to moving average if data points are sparse or non-convergent.
- **Health Probes**: Built-in `/health` endpoint for container orchestrators and backend status checks.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Python 3.9+** | Runtime environment |
| **FastAPI** | REST API framework |
| **Uvicorn** | High-performance ASGI web server |
| **Statsmodels** | Statistical models & ARIMA time-series analysis |
| **Pandas** | Numerical series manipulation |
| **Pydantic** | Request schema validation |

---

## Getting Started

### 1. Prerequisites
- Python 3.9, 3.10, 3.11, or 3.12 installed
- `pip` package manager

### 2. Setup Virtual Environment

Navigate to the `okr_ml` directory:

```bash
cd okr_ml
```

Create and activate a virtual environment:

**Windows (PowerShell / Command Prompt):**
```bash
python -m venv venv
.\venv\Scripts\activate
```

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Service

Start the local development server on port 8000:

```bash
uvicorn main:app --reload --port 8000
```

The service will be accessible at:
- **API URL**: [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Endpoints

### 1. Health Check
Checks if the service is running.

- **Method**: `GET`
- **Path**: `/health`
- **Response**:
  ```json
  {
    "status": "ok"
  }
  ```

### 2. OKR Performance Forecast
Predicts the next-period OKR progress percentage based on historical quarterly data points.

- **Method**: `POST`
- **Path**: `/forecast`
- **Request Body**:
  ```json
  {
    "data": [65.0, 72.5, 80.0]
  }
  ```
- **Response**:
  ```json
  {
    "forecast": 87.5
  }
  ```
- **Error / Fallback Behavior**:
  - If `len(data) == 0`: Returns HTTP `400 Bad Request` (`"Not enough data points"`).
  - If `len(data) == 1`: Returns the single existing value rounded to 2 decimal places.
  - If ARIMA fitting fails: Automatically calculates and returns the Simple Moving Average (`sma`) along with a warning field.
  - Forecast values are clamped between `0.0` and `100.0`.

---

## Docker Deployment

You can build and run the ML service independently using Docker:

```bash
# Build Docker image
docker build -t okr-ml-service -f Dockerfile .

# Run container on port 8000
docker run -p 8000:8000 --name okr_ml_service okr-ml-service
```

Alternatively, launch the complete system (MongoDB, Backend, ML service) with Docker Compose from the root directory:

```bash
docker compose up --build
```
