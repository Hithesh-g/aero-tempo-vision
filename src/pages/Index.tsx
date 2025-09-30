import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Satellite, Activity, Info, Github, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapView } from '@/components/MapView';
import { ForecastSlider } from '@/components/ForecastSlider';
import { HealthCard } from '@/components/HealthCard';
import { ExplainModal } from '@/components/ExplainModal';
import { AQIBadge } from '@/components/AQIBadge';
import { MOCK_STATIONS, generateForecast, getExplainability, Station } from '@/lib/mockData';

const Index = () => {
  const [selectedStation, setSelectedStation] = useState<Station>(MOCK_STATIONS[0]);
  const [forecastIndex, setForecastIndex] = useState(0);
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  
  const forecast = useMemo(() => generateForecast(selectedStation), [selectedStation]);
  const currentForecast = forecast[forecastIndex];
  const explainData = useMemo(() => getExplainability(currentForecast), [currentForecast]);
  
  return (
    <div className="min-h-screen bg-space-gradient">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative overflow-hidden border-b border-border/30"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 py-16 relative">
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center max-w-4xl mx-auto space-y-6"
          >
            {/* Logo and Title */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                className="relative"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Satellite className="h-12 w-12 text-primary animate-glow" />
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                AeroSight
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-foreground/90 font-light">
              TEMPO-Powered Hyperlocal Air Quality Forecasts
            </p>
            
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Leveraging NASA's TEMPO satellite observations combined with ground-based monitoring and 
              machine learning to deliver unprecedented hourly air quality forecasts at neighborhood scale.
            </p>
            
            {/* Key Features */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-6 pt-8"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Satellite className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">TEMPO Satellite Integration</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                <Activity className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">48-Hour Forecasts</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <Info className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">ML Explainability</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Current Station Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedStation.name}</CardTitle>
                  <CardDescription>Real-time air quality monitoring</CardDescription>
                </div>
                <AQIBadge aqi={selectedStation.currentAQI} size="lg" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <p className="text-sm text-muted-foreground mb-1">Current AQI</p>
                  <p className="text-3xl font-bold text-primary">{selectedStation.currentAQI}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/5">
                  <p className="text-sm text-muted-foreground mb-1">NO₂</p>
                  <p className="text-3xl font-bold text-secondary">{selectedStation.pollutants.no2}</p>
                  <p className="text-xs text-muted-foreground">ppb</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/5">
                  <p className="text-sm text-muted-foreground mb-1">O₃</p>
                  <p className="text-3xl font-bold text-accent">{selectedStation.pollutants.o3}</p>
                  <p className="text-xs text-muted-foreground">ppb</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">PM2.5</p>
                  <p className="text-3xl font-bold">{selectedStation.pollutants.pm25}</p>
                  <p className="text-xs text-muted-foreground">µg/m³</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <MapView
            stations={MOCK_STATIONS}
            onStationSelect={setSelectedStation}
            selectedStationId={selectedStation.id}
          />
        </motion.div>
        
        {/* Forecast and Health Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <ForecastSlider
            forecast={forecast}
            onTimeChange={setForecastIndex}
          />
          
          <HealthCard aqi={currentForecast.aqi} />
        </div>
        
        {/* Model Explainability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Model Transparency</CardTitle>
                  <CardDescription>
                    Understanding the science behind your forecast
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setExplainModalOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <Info className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">TEMPO Contribution</p>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentForecast.contributions.tempo * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary/70 to-primary"
                    />
                  </div>
                  <p className="text-2xl font-bold text-primary mt-2">
                    {Math.round(currentForecast.contributions.tempo * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Weather Data</p>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentForecast.contributions.weather * 100}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className="h-full bg-gradient-to-r from-secondary/70 to-secondary"
                    />
                  </div>
                  <p className="text-2xl font-bold text-secondary mt-2">
                    {Math.round(currentForecast.contributions.weather * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Historical Patterns</p>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentForecast.contributions.historical * 100}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-full bg-gradient-to-r from-accent/70 to-accent"
                    />
                  </div>
                  <p className="text-2xl font-bold text-accent mt-2">
                    {Math.round(currentForecast.contributions.historical * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center space-y-4 py-8 border-t border-border/30"
        >
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
            <a
              href="https://tempo.si.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              About TEMPO
            </a>
          </div>
          
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            Built for NASA Space Apps Challenge 2025. This demo uses simulated TEMPO satellite data 
            and mock forecasts. Real implementation would integrate with NASA Earthdata APIs and 
            production-grade ML models trained on historical air quality patterns.
          </p>
        </motion.div>
      </div>
      
      {/* Explainability Modal */}
      <ExplainModal
        open={explainModalOpen}
        onOpenChange={setExplainModalOpen}
        data={explainData}
      />
    </div>
  );
};

export default Index;
