import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Database, Satellite, Cloud } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ExplainabilityData } from '@/lib/mockData';

interface ExplainModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ExplainabilityData;
}

export function ExplainModal({ open, onOpenChange, data }: ExplainModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Model Explainability
          </DialogTitle>
          <DialogDescription>
            Understanding how TEMPO satellite data and ML predictions work together
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Model Confidence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Model Confidence</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(data.modelConfidence * 100)}%
              </span>
            </div>
            <Progress value={data.modelConfidence * 100} className="h-2" />
          </motion.div>
          
          {/* Feature Contributions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Feature Contributions (SHAP-style)</h3>
            <p className="text-xs text-muted-foreground">
              How each input affects the air quality prediction
            </p>
            
            <div className="space-y-2">
              {data.features.map((feature, idx) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {feature.impact > 0 ? (
                        <TrendingUp className="h-4 w-4 text-destructive" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-aqi-good" />
                      )}
                      <span>{feature.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {feature.value.toFixed(1)}
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.abs(feature.impact) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.3 + idx * 0.05 }}
                      className={cn(
                        'h-full',
                        feature.impact > 0 
                          ? 'bg-gradient-to-r from-destructive/70 to-destructive'
                          : 'bg-gradient-to-r from-aqi-good/70 to-aqi-good'
                      )}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Data Quality */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="space-y-3 pt-4 border-t border-border"
          >
            <h3 className="text-sm font-semibold">Data Source Quality</h3>
            
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Satellite className="h-4 w-4 text-primary" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>TEMPO Satellite</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(data.dataQuality.tempo * 100)}%
                    </span>
                  </div>
                  <Progress value={data.dataQuality.tempo * 100} className="h-1.5" />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-secondary" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>OpenAQ Ground Stations</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(data.dataQuality.openaq * 100)}%
                    </span>
                  </div>
                  <Progress value={data.dataQuality.openaq * 100} className="h-1.5" />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Cloud className="h-4 w-4 text-accent" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Weather Data</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(data.dataQuality.weather * 100)}%
                    </span>
                  </div>
                  <Progress value={data.dataQuality.weather * 100} className="h-1.5" />
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Info Footer */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <strong>TEMPO</strong> (Tropospheric Emissions: Monitoring of Pollution) is NASA's first 
              space-based instrument to continuously measure air quality over North America with unprecedented 
              spatial and temporal resolution.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
