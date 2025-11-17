import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export const MetricsCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down";
}) => (
  <Card className="bg-card/80 backdrop-blur-xl border-border/60">
    <CardContent className="flex items-center justify-between p-6">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {change && (
          <p
            className={`text-xs mt-1 ${
              trend === "up"
                ? "text-green-500"
                : trend === "down"
                ? "text-red-500"
                : "text-muted-foreground"
            }`}
          >
            {change}
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
    </CardContent>
  </Card>
);
