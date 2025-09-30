# Backend Architecture Reference

> **Note**: This is a reference architecture for the complete AeroSight system. The current Lovable deployment is frontend-only with mock data. For production deployment, implement this backend separately.

## Directory Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry
│   ├── config.py               # Configuration management
│   ├── models.py               # Pydantic models
│   ├── db.py                   # Database connection
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── stations.py     # Station management
│   │   │   ├── current.py      # Current conditions
│   │   │   ├── forecast.py     # Forecast retrieval
│   │   │   └── ingest.py       # Data ingestion triggers
│   │   └── deps.py             # Dependency injection
│   ├── ingest/
│   │   ├── tempo.py            # TEMPO satellite data fetcher
│   │   ├── openaq.py           # OpenAQ API integration
│   │   └── weather.py          # Weather API integration
│   ├── ml/
│   │   ├── preprocessing.py    # Feature engineering
│   │   ├── bias_correction.py  # TEMPO bias correction
│   │   ├── transport.py        # Wind transport model
│   │   ├── forecast_model.py   # XGBoost wrapper
│   │   └── explainer.py        # SHAP explainability
│   └── utils/
│       ├── aqi.py              # AQI calculations
│       └── spatial.py          # Geospatial utilities
├── tests/
│   ├── test_api.py
│   ├── test_ingest.py
│   └── test_ml.py
├── scripts/
│   ├── download_tempo.py       # Batch TEMPO download
│   └── backfill_data.py        # Historical data import
├── requirements.txt
├── Dockerfile
└── alembic/                    # Database migrations
    ├── versions/
    └── env.py
```

## API Endpoints

### Health & Status

```
GET /health
Response: {"status": "ok", "version": "1.0.0", "db": "connected"}
```

### Data Ingestion

```
POST /ingest/tempo
Body: {
  "start_time": "2025-01-15T00:00:00Z",
  "end_time": "2025-01-15T23:00:00Z",
  "bbox": [-122.5, 37.7, -122.3, 37.8]
}
Response: {"status": "success", "records_inserted": 24}
```

```
POST /ingest/openaq
Body: {
  "station_ids": ["sf-downtown", "sf-bayview"],
  "lookback_hours": 48
}
Response: {"status": "success", "records_inserted": 96}
```

### Stations

```
GET /stations?bbox=-122.5,37.7,-122.3,37.8
Response: {
  "stations": [
    {
      "id": "sf-downtown",
      "name": "San Francisco Downtown",
      "lat": 37.7749,
      "lon": -122.4194,
      "source": "openaq",
      "pollutants": ["no2", "o3", "pm25"]
    }
  ]
}
```

### Current Conditions

```
GET /current/{station_id}
Response: {
  "station_id": "sf-downtown",
  "timestamp": "2025-01-15T14:00:00Z",
  "aqi": 45,
  "pollutants": {
    "no2": 22,
    "o3": 35,
    "pm25": 12
  },
  "data_quality": {
    "tempo": 0.92,
    "openaq": 0.88,
    "weather": 0.95
  }
}
```

### Forecasts

```
GET /forecast/{station_id}?hours=48
Response: {
  "station_id": "sf-downtown",
  "forecast": [
    {
      "timestamp": "2025-01-15T15:00:00Z",
      "aqi": 48,
      "confidence_interval": [42, 54],
      "pollutants": {
        "no2": 24,
        "o3": 38,
        "pm25": 13
      },
      "contributions": {
        "tempo": 0.45,
        "weather": 0.30,
        "historical": 0.25
      }
    }
  ]
}
```

### Explainability

```
GET /provenance/{station_id}/{timestamp}
Response: {
  "model_version": "v1.2.0",
  "features": [
    {
      "name": "TEMPO NO2 Column",
      "value": 22.5,
      "impact": 0.35,
      "source": "TEMPO L2 Product"
    }
  ],
  "data_quality": {...},
  "model_confidence": 0.87
}
```

## Database Schema

### PostgreSQL + TimescaleDB

```sql
-- Stations table
CREATE TABLE stations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    source VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEMPO observations (hypertable)
CREATE TABLE tempo_observations (
    time TIMESTAMPTZ NOT NULL,
    station_id VARCHAR(50) REFERENCES stations(id),
    no2 DOUBLE PRECISION,
    o3 DOUBLE PRECISION,
    hcho DOUBLE PRECISION,
    quality_flag INTEGER,
    pixel_lat DOUBLE PRECISION,
    pixel_lon DOUBLE PRECISION
);

SELECT create_hypertable('tempo_observations', 'time');

-- OpenAQ ground measurements (hypertable)
CREATE TABLE openaq_measurements (
    time TIMESTAMPTZ NOT NULL,
    station_id VARCHAR(50) REFERENCES stations(id),
    pollutant VARCHAR(10) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20) NOT NULL,
    data_quality DOUBLE PRECISION
);

SELECT create_hypertable('openaq_measurements', 'time');

-- Weather data (hypertable)
CREATE TABLE weather_data (
    time TIMESTAMPTZ NOT NULL,
    station_id VARCHAR(50) REFERENCES stations(id),
    temperature DOUBLE PRECISION,
    wind_speed DOUBLE PRECISION,
    wind_direction DOUBLE PRECISION,
    pressure DOUBLE PRECISION,
    humidity DOUBLE PRECISION
);

SELECT create_hypertable('weather_data', 'time');

-- Forecasts (hypertable)
CREATE TABLE forecasts (
    issued_at TIMESTAMPTZ NOT NULL,
    forecast_time TIMESTAMPTZ NOT NULL,
    station_id VARCHAR(50) REFERENCES stations(id),
    aqi INTEGER,
    no2 DOUBLE PRECISION,
    o3 DOUBLE PRECISION,
    pm25 DOUBLE PRECISION,
    confidence_lower DOUBLE PRECISION,
    confidence_upper DOUBLE PRECISION,
    model_version VARCHAR(20)
);

SELECT create_hypertable('forecasts', 'issued_at');
```

## ML Pipeline Implementation

### 1. Bias Correction (`ml/bias_correction.py`)

```python
import numpy as np
from sklearn.linear_model import LinearRegression

class TEMPOBiasCorrector:
    """
    Corrects systematic biases in TEMPO satellite retrievals
    using collocated ground station measurements.
    """
    
    def __init__(self):
        self.models = {}  # One per pollutant
    
    def fit(self, tempo_data: np.ndarray, ground_truth: np.ndarray, 
            pollutant: str):
        """
        Fit linear regression: ground_truth = a * tempo + b
        """
        model = LinearRegression()
        model.fit(tempo_data.reshape(-1, 1), ground_truth)
        self.models[pollutant] = model
    
    def transform(self, tempo_data: np.ndarray, pollutant: str) -> np.ndarray:
        """
        Apply bias correction to new TEMPO observations
        """
        model = self.models.get(pollutant)
        if model is None:
            return tempo_data
        return model.predict(tempo_data.reshape(-1, 1))
```

### 2. Transport Baseline (`ml/transport.py`)

```python
import numpy as np

class WindTransportModel:
    """
    Simple Lagrangian transport model for pollution advection.
    Implements backward trajectory to find upwind sources.
    """
    
    def predict_baseline(self, current_aqi: float, wind_speed: float,
                        wind_direction: float, time_delta_hours: int) -> float:
        """
        Baseline forecast using wind transport only.
        
        Args:
            current_aqi: Current AQI at station
            wind_speed: m/s
            wind_direction: degrees (meteorological convention)
            time_delta_hours: Forecast horizon
        
        Returns:
            Baseline AQI prediction
        """
        # Simple decay model
        decay_rate = 0.05  # per hour (accounts for deposition, mixing)
        transport_factor = np.exp(-decay_rate * time_delta_hours)
        
        # Modify by wind dispersion
        dispersion_factor = 1.0 + (wind_speed / 10.0)  # Higher wind = more dispersion
        
        baseline = current_aqi * transport_factor / dispersion_factor
        return baseline
```

### 3. XGBoost Residual Model (`ml/forecast_model.py`)

```python
import xgboost as xgb
import numpy as np

class ForecastModel:
    """
    XGBoost model to predict residuals from baseline forecast.
    """
    
    def __init__(self):
        self.model = xgb.XGBRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )
    
    def prepare_features(self, row):
        """
        Feature engineering for each forecast point.
        """
        return {
            # TEMPO features
            'tempo_no2': row['tempo_no2'],
            'tempo_o3': row['tempo_o3'],
            'tempo_quality': row['tempo_quality'],
            
            # Weather features
            'temperature': row['temperature'],
            'wind_speed': row['wind_speed'],
            'wind_direction_sin': np.sin(np.radians(row['wind_direction'])),
            'wind_direction_cos': np.cos(np.radians(row['wind_direction'])),
            'pressure': row['pressure'],
            'humidity': row['humidity'],
            
            # Temporal features
            'hour_of_day': row['timestamp'].hour,
            'day_of_week': row['timestamp'].dayofweek,
            'is_weekend': int(row['timestamp'].dayofweek >= 5),
            'month': row['timestamp'].month,
            
            # Historical features
            'aqi_24h_ago': row['aqi_lag_24h'],
            'aqi_7d_avg': row['aqi_rolling_7d'],
            
            # Baseline prediction
            'baseline_forecast': row['baseline'],
            
            # Forecast horizon
            'forecast_hour': row['forecast_delta_hours']
        }
    
    def train(self, X_train, y_train):
        """
        y_train = actual_aqi - baseline_forecast (residuals)
        """
        self.model.fit(X_train, y_train)
    
    def predict(self, X_test, baseline_forecasts):
        """
        Final forecast = baseline + predicted_residual
        """
        residuals = self.model.predict(X_test)
        return baseline_forecasts + residuals
```

### 4. SHAP Explainer (`ml/explainer.py`)

```python
import shap

class ForecastExplainer:
    """
    Provides SHAP values for model explainability.
    """
    
    def __init__(self, model):
        self.explainer = shap.TreeExplainer(model)
    
    def explain_forecast(self, features):
        """
        Returns SHAP values showing how each feature contributed.
        """
        shap_values = self.explainer.shap_values(features)
        
        explanation = []
        for feature_name, feature_value, shap_value in zip(
            features.columns, features.values[0], shap_values[0]
        ):
            explanation.append({
                'name': feature_name,
                'value': float(feature_value),
                'impact': float(shap_value)
            })
        
        # Sort by absolute impact
        explanation.sort(key=lambda x: abs(x['impact']), reverse=True)
        return explanation
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://aerosight:password@localhost:5432/aerosight
REDIS_URL=redis://localhost:6379/0

# NASA Earthdata
NASA_EARTHDATA_USERNAME=your_username
NASA_EARTHDATA_PASSWORD=your_password

# OpenAQ (optional, increases rate limits)
OPENAQ_API_KEY=your_key

# Weather API
NOAA_API_TOKEN=your_token

# Model
MODEL_PATH=/app/models/forecast_model.pkl
MODEL_VERSION=v1.2.0

# Application
LOG_LEVEL=INFO
WORKERS=4
```

## Deployment with Docker

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ app/
COPY scripts/ scripts/

# Run migrations and start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_DB: aerosight
      POSTGRES_USER: aerosight
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  backend:
    build: ./backend
    depends_on:
      - db
      - redis
    environment:
      DATABASE_URL: postgresql://aerosight:password@db:5432/aerosight
      REDIS_URL: redis://redis:6379/0
    ports:
      - "8000:8000"
    volumes:
      - ./backend/app:/app/app
      - ./models:/app/models
  
  frontend:
    build: .
    ports:
      - "8080:8080"
    environment:
      VITE_API_BASE_URL: http://localhost:8000

volumes:
  postgres_data:
```

## Testing

```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_get_stations():
    response = client.get("/stations")
    assert response.status_code == 200
    assert isinstance(response.json()["stations"], list)

def test_forecast_endpoint():
    response = client.get("/forecast/sf-downtown?hours=48")
    assert response.status_code == 200
    forecast = response.json()["forecast"]
    assert len(forecast) == 48
    assert all("aqi" in point for point in forecast)
```

---

For full implementation details, see individual module docstrings and NASA TEMPO documentation.
