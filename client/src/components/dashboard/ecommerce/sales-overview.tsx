import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";

export function SalesOverview() {
  const stats = [
    {
      title: "Total Sales",
      value: "$12,450",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Orders",
      value: "1,234",
      change: "+8.2%", 
      icon: ShoppingCart,
      color: "text-blue-600"
    },
    {
      title: "Customers",
      value: "456",
      change: "+15.3%",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Growth",
      value: "23.1%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-xs ${stat.color}`}>{stat.change}</p>
                </div>
                <div className={`p-2 rounded-full bg-muted ${stat.color}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
