import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function OrderStatus() {
  const orders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      status: "shipped",
      items: 3,
      total: "$299.99",
      date: "2024-01-15"
    },
    {
      id: "ORD-002", 
      customer: "Jane Smith",
      status: "processing",
      items: 1,
      total: "$89.99",
      date: "2024-01-14"
    },
    {
      id: "ORD-003",
      customer: "Bob Johnson", 
      status: "delivered",
      items: 2,
      total: "$149.99",
      date: "2024-01-13"
    },
    {
      id: "ORD-004",
      customer: "Alice Brown",
      status: "pending",
      items: 4,
      total: "$399.99",
      date: "2024-01-12"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="default" className="bg-green-500">Delivered</Badge>;
      case 'shipped':
        return <Badge variant="default" className="bg-blue-500">Shipped</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-card-foreground flex items-center">
            <Package className="h-5 w-5 text-primary mr-2" />
            Current Orders
          </h3>
          <Button variant="outline" size="sm">
            View All Orders
          </Button>
        </div>
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <div>
                  <div className="font-medium text-sm">{order.id}</div>
                  <div className="text-xs text-muted-foreground">{order.customer}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{order.total}</div>
                <div className="text-xs text-muted-foreground">{order.items} items</div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(order.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
