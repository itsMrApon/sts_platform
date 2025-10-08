import { Card, CardContent } from "@/components/ui/card";
import { Factory, Boxes, Truck, TrendingUp } from "lucide-react";

export function ProductionOverview() {
  const stats = [
    {
      icon: Factory,
      title: "Active Production",
      value: "12",
      subtitle: "Lines running",
      color: "text-blue-600"
    },
    {
      icon: Boxes,
      title: "Inventory Levels",
      value: "85%",
      subtitle: "Optimal capacity",
      color: "text-green-600"
    },
    {
      icon: Truck,
      title: "Shipments",
      value: "8",
      subtitle: "Ready for dispatch",
      color: "text-orange-600"
    },
    {
      icon: TrendingUp,
      title: "Efficiency",
      value: "92%",
      subtitle: "Production yield",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
