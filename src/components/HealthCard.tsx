import { motion } from 'framer-motion';
import { Heart, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAQILevel } from '@/lib/aqi';

interface HealthCardProps {
  aqi: number;
}

export function HealthCard({ aqi }: HealthCardProps) {
  const level = getAQILevel(aqi);
  
  const iconMap = {
    good: ShieldCheck,
    moderate: ShieldCheck,
    'unhealthy-sensitive': AlertTriangle,
    unhealthy: AlertTriangle,
    'very-unhealthy': ShieldAlert,
    hazardous: ShieldAlert,
  };
  
  const Icon = iconMap[level.level];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              'rounded-full p-2',
              level.level === 'good' || level.level === 'moderate' 
                ? 'bg-aqi-good/20 text-aqi-good'
                : 'bg-destructive/20 text-destructive'
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Health Advisory</CardTitle>
              <CardDescription>{level.label} Air Quality</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2">
            <Heart className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{level.healthMessage}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Recommendations:</p>
            <ul className="space-y-1">
              {level.recommendations.map((rec, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-primary">•</span>
                  <span>{rec}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
