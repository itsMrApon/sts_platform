import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  Eye,
  Plus,
  Settings,
  Zap,
  Printer,
  Smartphone,
  Watch,
  Headphones
} from "lucide-react";

export function OnDemandProduction() {
  const productionStatus = [
    {
      id: "PROD-001",
      product: "Custom 3D Printed Phone Case",
      customer: "John Smith",
      status: "in-production",
      progress: 75,
      estimatedCompletion: "2 days",
      category: "3D Printed",
      priority: "high",
      icon: Smartphone
    },
    {
      id: "PROD-002", 
      product: "Leather Wallet with Engraving",
      customer: "Sarah Johnson",
      status: "queued",
      progress: 0,
      estimatedCompletion: "5 days",
      category: "Leather Goods",
      priority: "medium",
      icon: Package
    },
    {
      id: "PROD-003",
      product: "Custom Smart Watch Band",
      customer: "Mike Chen",
      status: "qa",
      progress: 90,
      estimatedCompletion: "1 day",
      category: "Electronics",
      priority: "high",
      icon: Watch
    },
    {
      id: "PROD-004",
      product: "3D Printed Headphone Stand",
      customer: "Emma Davis",
      status: "shipped",
      progress: 100,
      estimatedCompletion: "Completed",
      category: "3D Printed",
      priority: "low",
      icon: Headphones
    }
  ];

  const waitingList = [
    {
      id: "WAIT-001",
      product: "Custom Gaming Controller",
      customer: "Alex Rodriguez",
      queuePosition: 1,
      estimatedStart: "Tomorrow",
      category: "Electronics",
      icon: Smartphone
    },
    {
      id: "WAIT-002",
      product: "3D Printed Desk Organizer",
      customer: "Lisa Wang",
      queuePosition: 2,
      estimatedStart: "3 days",
      category: "3D Printed",
      icon: Printer
    },
    {
      id: "WAIT-003",
      product: "Leather Laptop Sleeve",
      customer: "David Brown",
      queuePosition: 3,
      estimatedStart: "1 week",
      category: "Leather Goods",
      icon: Package
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'queued':
        return <Badge className="bg-yellow-500 hover:bg-yellow-500">Queued</Badge>;
      case 'in-production':
        return <Badge className="bg-blue-500 hover:bg-blue-500">In Production</Badge>;
      case 'qa':
        return <Badge className="bg-purple-500 hover:bg-purple-500">Quality Check</Badge>;
      case 'shipped':
        return <Badge className="bg-green-500 hover:bg-green-500">Shipped</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in-production':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'qa':
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case 'shipped':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          On-Demand Production
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="production" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="production">Production Status</TabsTrigger>
            <TabsTrigger value="waiting">Waiting List</TabsTrigger>
          </TabsList>

          <TabsContent value="production" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Active Production Orders</h3>
                <p className="text-sm text-muted-foreground">Track your custom orders in real-time</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Order
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {productionStatus.map((order) => {
                const ProductIcon = order.icon;
                return (
                  <Card key={order.id} className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <ProductIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{order.product}</h4>
                            <p className="text-sm text-muted-foreground">Order #{order.id} • {order.customer}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          {getPriorityBadge(order.priority)}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <span className="font-medium">{order.status.replace('-', ' ').toUpperCase()}</span>
                          </div>
                          <span className="text-muted-foreground">ETA: {order.estimatedCompletion}</span>
                        </div>
                        
                        {order.status !== 'shipped' && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>{order.progress}%</span>
                            </div>
                            <Progress value={order.progress} className="h-2" />
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {order.category}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="waiting" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Production Queue</h3>
                <p className="text-sm text-muted-foreground">Orders waiting to start production</p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Queue Settings
              </Button>
            </div>

            <div className="space-y-4">
              {waitingList.map((order) => {
                const ProductIcon = order.icon;
                return (
                  <Card key={order.id} className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <ProductIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{order.product}</h4>
                            <p className="text-sm text-muted-foreground">Order #{order.id} • {order.customer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            Position #{order.queuePosition}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            Est. Start: {order.estimatedStart}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <Badge variant="outline" className="text-xs">
                          {order.category}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Play className="h-3 w-3 mr-1" />
                            Start Early
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Total orders in queue: {waitingList.length}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
