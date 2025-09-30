import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { AQIBadge } from './AQIBadge';
import { ForecastPoint } from '@/lib/mockData';

interface ForecastSliderProps {
  forecast: ForecastPoint[];
  onTimeChange?: (index: number) => void;
}

export function ForecastSlider({ forecast, onTimeChange }: ForecastSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const currentForecast = forecast[currentIndex];
  
  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= forecast.length) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 1000); // Advance every second
    
    return () => clearInterval(interval);
  }, [isPlaying, forecast.length]);
  
  // Notify parent of time changes
  useEffect(() => {
    onTimeChange?.(currentIndex);
  }, [currentIndex, onTimeChange]);
  
  const handleSliderChange = (value: number[]) => {
    setCurrentIndex(value[0]);
    setIsPlaying(false);
  };
  
  const togglePlay = () => {
    if (currentIndex >= forecast.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };
  
  const stepForward = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, forecast.length - 1));
    setIsPlaying(false);
  };
  
  const stepBack = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setIsPlaying(false);
  };
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>48-Hour Forecast</span>
          <AQIBadge aqi={currentForecast.aqi} size="sm" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="text-center">
              <p className="text-2xl font-bold">
                {format(currentForecast.timestamp, 'EEE, MMM d')}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(currentForecast.timestamp, 'h:mm a')}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">NO₂</p>
                <p className="text-lg font-semibold">{currentForecast.pollutants.no2}</p>
                <p className="text-xs text-muted-foreground">ppb</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">O₃</p>
                <p className="text-lg font-semibold">{currentForecast.pollutants.o3}</p>
                <p className="text-xs text-muted-foreground">ppb</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">PM2.5</p>
                <p className="text-lg font-semibold">{currentForecast.pollutants.pm25}</p>
                <p className="text-xs text-muted-foreground">µg/m³</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="space-y-4">
          <Slider
            value={[currentIndex]}
            onValueChange={handleSliderChange}
            max={forecast.length - 1}
            step={1}
            className="w-full"
          />
          
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={stepBack}
              disabled={currentIndex === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              className="h-12 w-12"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={stepForward}
              disabled={currentIndex === forecast.length - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Now</span>
            <span>+48h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
