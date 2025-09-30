import { motion } from 'framer-motion';
import { getAQILevel } from '@/lib/aqi';
import { cn } from '@/lib/utils';

interface AQIBadgeProps {
  aqi: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

export function AQIBadge({ aqi, size = 'md', showLabel = true, animate = true }: AQIBadgeProps) {
  const level = getAQILevel(aqi);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  };
  
  const gradientClasses: Record<string, string> = {
    good: 'bg-aqi-gradient-good',
    moderate: 'bg-aqi-gradient-moderate',
    'unhealthy-sensitive': 'bg-aqi-gradient-unhealthy',
    unhealthy: 'bg-aqi-gradient-unhealthy',
    'very-unhealthy': 'bg-aqi-gradient-hazardous',
    hazardous: 'bg-aqi-gradient-hazardous',
  };

  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3 },
  } : {};

  return (
    <Component
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-semibold text-white shadow-lg',
        gradientClasses[level.level],
        sizeClasses[size]
      )}
      {...animationProps}
    >
      <span className="tabular-nums">{aqi}</span>
      {showLabel && <span>{level.label}</span>}
    </Component>
  );
}
