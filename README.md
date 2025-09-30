# AeroSight - TEMPO-Powered Hyperlocal Air Quality Forecasts

[![NASA Space Apps Challenge 2025](https://img.shields.io/badge/NASA%20Space%20Apps-2025-blue.svg)](https://www.spaceappschallenge.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌍 Overview

**AeroSight** is an advanced air quality forecasting platform that combines NASA's TEMPO (Tropospheric Emissions: Monitoring of Pollution) satellite observations with ground-based monitoring networks and machine learning to deliver unprecedented hourly air quality forecasts at neighborhood scale.

### Key Features

- 🛰️ **TEMPO Satellite Integration**: Leverages NASA's first space-based instrument for continuous North American air quality monitoring
- 📊 **48-Hour Hyperlocal Forecasts**: Hourly predictions with unprecedented spatial resolution
- 🤖 **Explainable ML**: XGBoost-based forecasting with SHAP-style feature attribution
- 🗺️ **Interactive Visualization**: Real-time map interface with animated forecast playback
- 💡 **WHO Health Guidelines**: Actionable health advisories based on air quality levels
- 🔬 **Data Quality Transparency**: Clear provenance tracking for TEMPO, OpenAQ, and weather data sources

## 🎯 NASA Space Apps Challenge Alignment

### Challenge Categories Addressed

- **Air Quality Monitoring & Prediction**
- **Data Fusion & Integration**
- **Machine Learning for Earth Science**
- **Public Health Applications**

### NASA Judging Criteria

1. **Impact**: Addresses critical public health need for localized air quality forecasts
2. **Creativity**: Novel fusion of TEMPO satellite data with ML explainability
3. **Validity**: Implements bias correction and skill score evaluation
4. **Relevance**: Direct application of NASA TEMPO mission data
5. **Presentation**: Interactive demo with clear data provenance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with WebGL support

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aerosight-spaceapps-2025.git
cd aerosight-spaceapps-2025

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Demo Mode

The current version runs in **demo mode** with simulated TEMPO data and mock forecasts to showcase the architecture. For production deployment:

1. Configure NASA Earthdata credentials (see [Authentication Setup](#authentication-setup))
2. Deploy backend API (see [Backend Setup](#backend-setup))
3. Configure environment variables

## 🏗️ Architecture

```
┌─────────────────┐
│  TEMPO Satellite │  ← NASA's geostationary pollution monitor
│   (Hourly NO₂,  │     Resolution: 2km × 4.75km
│    O₃, HCHO)    │     Coverage: North America
└────────┬────────┘
         │
         ├──────────┐
         │          │
    ┌────▼────┐  ┌──▼────────┐
    │ OpenAQ  │  │  Weather  │  ← Ground truth + meteorology
    │ Ground  │  │   APIs    │
    │ Stations│  │           │
    └────┬────┘  └──┬────────┘
         │          │
         └────┬─────┘
              │
      ┌───────▼──────────┐
      │  Data Pipeline   │
      │  • Bias Correct  │  ← Calibration using ground stations
      │  • Transport     │  ← Wind advection baseline
      │  • ML Residual   │  ← XGBoost for complex patterns
      └───────┬──────────┘
              │
      ┌───────▼──────────┐
      │  48h Forecasts   │  ← Hourly predictions
      │  + Explainability│     + SHAP values
      └───────┬──────────┘
              │
      ┌───────▼──────────┐
      │   React Frontend │
      │  • Interactive   │
      │    Map View      │
      │  • Animated      │
      │    Playback      │
      │  • Health Cards  │
      └──────────────────┘
```

## 📊 Data Sources

### 1. TEMPO Satellite (NASA)

- **Provider**: NASA Earth Science
- **Coverage**: North America (hourly daytime)
- **Resolution**: 2km × 4.75km (unprecedented for space-based AQ monitoring)
- **Parameters**: NO₂, O₃, HCHO column densities
- **Access**: [NASA Earthdata](https://earthdata.nasa.gov/)

### 2. OpenAQ Network

- **Provider**: OpenAQ Foundation
- **Stations**: 10,000+ global ground monitors
- **Parameters**: PM2.5, PM10, NO₂, O₃, SO₂, CO
- **API**: [OpenAQ API v2](https://docs.openaq.org/)

### 3. Weather Data

- **Provider**: NOAA/NWS APIs
- **Parameters**: Temperature, wind speed/direction, pressure, humidity
- **Usage**: Input features + transport modeling

## 🤖 Machine Learning Pipeline

### Model Architecture

```
Forecast = Baseline + ML_Residual

Baseline:
  1. Bias Correction (Linear regression: TEMPO → Ground truth)
  2. Transport Model (Wind advection using weather data)

ML_Residual:
  - Algorithm: XGBoost Regressor
  - Features: TEMPO columns, weather, time-of-day, day-of-week, historical patterns
  - Target: Difference between actual AQI and baseline
  - Training: 6 months historical data per station
```

### Explainability (SHAP Values)

- Feature attribution for every prediction
- Data quality scores for each source
- Model confidence intervals

### Evaluation Metrics

- **Skill Score vs Persistence**: Demonstrates improvement over naive "tomorrow = today" baseline
- **Reliability Diagrams**: Calibration of predicted vs observed distributions
- **RMSE by Forecast Hour**: Error growth characterization

## 🎨 Frontend Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS (space-themed design system)
- **Animations**: Framer Motion
- **Mapping**: Leaflet + React-Leaflet
- **Charts**: Recharts
- **UI Components**: shadcn/ui

### Design System

The AeroSight design system uses a **space/orbital theme** to reflect the TEMPO satellite mission:

- **Primary**: Deep space blue (#3b82f6) - TEMPO branding
- **Secondary**: Teal (#06b6d4) - Clean air quality indicator
- **Accent**: Nebula purple (#9333ea) - ML/AI elements
- **AQI Colors**: WHO-standard gradient from green (good) to maroon (hazardous)

## 🔒 Authentication Setup

For production deployment with real TEMPO data:

1. **Register for NASA Earthdata**:
   ```bash
   https://urs.earthdata.nasa.gov/users/new
   ```

2. **Configure Credentials**:
   ```bash
   # Backend .env file
   NASA_EARTHDATA_USERNAME=your_username
   NASA_EARTHDATA_PASSWORD=your_password
   OPENAQ_API_KEY=your_openaq_key  # Optional, increases rate limits
   ```

3. **Update Ingestion Scripts**:
   See `backend/app/ingest/tempo.py` for credential usage

## 📦 Backend Setup

> **Note**: The backend is provided as reference architecture. The current Lovable deployment runs frontend-only in demo mode.

### Technology Stack

- **API Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15 + TimescaleDB extension
- **ML Framework**: XGBoost, Scikit-learn, SHAP
- **Data Processing**: Pandas, NumPy, Xarray (for netCDF TEMPO files)

### Local Development

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --reload --port 8000
```

### Docker Deployment

```bash
# Build and run all services
docker-compose up --build

# Frontend: http://localhost:8080
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 📓 Jupyter Notebooks

Located in `/notebooks`:

1. **`ingestion_demo.ipynb`**: TEMPO data download and preprocessing walkthrough
2. **`train_forecast.ipynb`**: Model training pipeline with hyperparameter tuning
3. **`evaluation_report.ipynb`**: Performance metrics and visualizations

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Backend tests
cd backend
pytest tests/ -v --cov=app

# E2E tests
npm run test:e2e
```

## 🚢 Production Deployment

### Environment Variables

```bash
# Frontend (.env)
VITE_API_BASE_URL=https://api.aerosight.io
VITE_MAPBOX_TOKEN=your_mapbox_token  # Optional for better basemaps

# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost/aerosight
REDIS_URL=redis://localhost:6379
NASA_EARTHDATA_USERNAME=xxx
NASA_EARTHDATA_PASSWORD=xxx
```

### Scaling Considerations

- **Caching**: Redis for forecast results (TTL: 1 hour)
- **Rate Limiting**: TEMPO ingestion throttled to hourly updates
- **Database**: TimescaleDB compression for historical data
- **CDN**: CloudFlare for frontend static assets

## 📚 Additional Resources

- [TEMPO Mission Overview](https://tempo.si.edu/)
- [NASA Earthdata Documentation](https://earthdata.nasa.gov/learn)
- [OpenAQ API Documentation](https://docs.openaq.org/)
- [WHO Air Quality Guidelines](https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA TEMPO Team**: For groundbreaking air quality observations from space
- **OpenAQ Foundation**: For democratizing global air quality data
- **NASA Space Apps Challenge**: For inspiring this project
- **Lovable Platform**: For rapid prototyping tools

## 📧 Contact

**Team AeroSight**
- Email: team@aerosight.io
- GitHub: [@aerosight](https://github.com/aerosight)
- Twitter: [@aerosight_aq](https://twitter.com/aerosight_aq)

---

**Built with ❤️ for NASA Space Apps Challenge 2025**

*Bringing space-based air quality monitoring down to Earth, one neighborhood at a time.*
