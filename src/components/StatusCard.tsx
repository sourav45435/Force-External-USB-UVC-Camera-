import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  status?: "active" | "warning" | "error" | "inactive";
}

const statusStyles = {
  active: "border-glow glow-primary",
  warning: "border-warning/30",
  error: "border-destructive/30",
  inactive: "border-border",
};

const statusDot = {
  active: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
  inactive: "bg-muted-foreground",
};

export const StatusCard = forwardRef<HTMLDivElement, StatusCardProps>(
  ({ title, value, subtitle, icon: Icon, status = "inactive" }, ref) => {
    return (
      <div ref={ref} className={cn("rounded-lg border bg-card p-5 transition-all", statusStyles[status])}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">{title}</span>
          <div className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", statusDot[status])} />
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <p className="text-2xl font-mono font-bold text-foreground">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    );
  }
);

StatusCard.displayName = "StatusCard";
