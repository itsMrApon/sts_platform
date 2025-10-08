import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Calendar, DollarSign, ShoppingCart } from "lucide-react";

export function OrderHistory() {
  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      total: "$299.99",
      date: "2024-01-15",
      status: "completed"
    },
    {
      id: "ORD-002",
      customer: "Jane Smith", 
      total: "$89.99",
      date: "2024-01-14",
      status: "completed"
    },
    {
      id: "ORD-003",
      customer: "Bob Johnson",
      total: "$149.99", 
      date: "2024-01-13",
      status: "completed"
    },
    {
      id: "ORD-004",
      customer: "Alice Brown",
      total: "$399.99",
      date: "2024-01-12", 
      status: "completed"
    },
    {
      id: "ORD-005",
      customer: "Charlie Wilson",
      total: "$199.99",
      date: "2024-01-11",
      status: "completed"
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-card-foreground flex items-center">
            <History className="h-5 w-5 text-primary mr-2" />
            Order History
          </h3>
          <Button variant="outline" size="sm">
            View All History
          </Button>
        </div>
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{order.id}</div>
                  <div className="text-xs text-muted-foreground">{order.customer}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {order.total}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {order.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
