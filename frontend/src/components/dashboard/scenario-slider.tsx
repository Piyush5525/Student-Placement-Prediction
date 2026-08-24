import { cn } from "@/lib/cn";

interface ScenarioSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  className?: string;
}

/**
 * ScenarioSlider — DESIGN_SYSTEM §08: track line-soft 4px, filled portion
 * accent-gradient, handle scales 1.15× while dragging. Drives the What-If
 * Simulator's mutable inputs (CGPA, internships, coding score, etc.).
 */
export function ScenarioSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue = (v) => `${v}`,
  className,
}: ScenarioSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="font-mono text-xs font-semibold tabular-nums text-accent-ink">{formatValue(value)}</span>
      </div>
      <div className="relative flex h-5 items-center">
        <div className="absolute inset-x-0 h-1 rounded-full bg-bg-elevated-2" />
        <div
          className="absolute h-1 rounded-full bg-gradient-to-r from-accent-from to-accent-to transition-[width] duration-100"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className={cn(
            "relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent",
            "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent-solid [&::-webkit-slider-thumb]:bg-bg-elevated",
            "[&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(124,108,255,0.15)]",
            "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150",
            "active:[&::-webkit-slider-thumb]:scale-[1.15]",
            "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent-solid [&::-moz-range-thumb]:bg-bg-elevated",
          )}
        />
      </div>
    </div>
  );
}
