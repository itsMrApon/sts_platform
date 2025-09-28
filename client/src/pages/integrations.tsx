import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClients } from "@/lib/api-clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/hooks/use-tenant";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  RefreshCw, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  Webhook,
  Database,
  ShoppingCart,
  Factory,
  Palette,
  Users,
  Package,
  ClipboardList,
  Truck,
  Ship,
  Headphones,
  CreditCard,
  Workflow,
  BarChart3
} from "lucide-react";

const businessIntegrations = {
  switchtoswag: {
    name: "SwitchToSwag (E-commerce)",
    description: "E-commerce & Design Studio",
    color: "bg-blue-500",
    integrations: [
      { name: "Customer Sync", from: "Saleor", to: "ERPNext", status: "active" },
      { name: "Order Processing", from: "Saleor", to: "ERPNext", status: "active" },
      { name: "Product Catalog", from: "Saleor", to: "ERPNext", status: "active" },
      { name: "Inventory Management", from: "ERPNext", to: "Saleor", status: "pending" },
      { name: "Design Workflow", from: "n8n", to: "ERPNext", status: "active" },
      { name: "Payment Processing", from: "Saleor", to: "ERPNext", status: "active" },
      { name: "Shipping Integration", from: "ERPNext", to: "n8n", status: "pending" },
      { name: "Customer Support", from: "n8n", to: "ERPNext", status: "active" }
    ]
  },
  strongtermstrategy: {
    name: "StrongTermStrategy (Manufacturing)",
    description: "Manufacturing & Procurement",
    color: "bg-green-500",
    integrations: [
      { name: "Supplier Management", from: "ERPNext", to: "n8n", status: "active" },
      { name: "Production Planning", from: "ERPNext", to: "n8n", status: "active" },
      { name: "Quality Control", from: "n8n", to: "ERPNext", status: "active" },
      { name: "Procurement Workflow", from: "ERPNext", to: "n8n", status: "active" },
      { name: "FOB Shipments", from: "ERPNext", to: "n8n", status: "active" },
      { name: "Inventory Tracking", from: "ERPNext", to: "n8n", status: "active" },
      { name: "Cost Management", from: "ERPNext", to: "n8n", status: "active" },
      { name: "Compliance Tracking", from: "n8n", to: "ERPNext", status: "pending" }
    ]
  },
  sudotechserve: {
    name: "SudoTechServe (Agency/SaaS)",
    description: "Agency & SaaS Services",
    color: "bg-purple-500",
    integrations: [
      { name: "Project Management", from: "n8n", to: "ERPNext", status: "active" },
      { name: "Client Onboarding", from: "ERPNext", to: "n8n", status: "active" },
      { name: "Subscription Management", from: "ERPNext", to: "n8n", status: "active" },
      { name: "Support Tickets", from: "n8n", to: "ERPNext", status: "active" },
      { name: "CRM Pipeline", from: "ERPNext", to: "n8n", status: "active" },
      { name: "Billing Automation", from: "ERPNext", to: "n8n", status: "active" },
      { name: "Reporting Dashboard", from: "ERPNext", to: "n8n", status: "pending" },
      { name: "API Management", from: "n8n", to: "ERPNext", status: "active" }
    ]
  }
};

const systemStatus = {
  saleor: { status: "connected", url: "http://localhost:8000", health: "healthy" },
  erpnext: { status: "connected", url: "http://localhost:8080", health: "healthy" },
  n8n: { status: "connected", url: "http://localhost:5678", health: "healthy" },
  backend: { status: "connected", url: "http://localhost:4000", health: "healthy" }
};

export default function IntegrationsPage() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");

  // Fetch system status
  const { data: syncStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ["syncStatus", currentTenant],
    queryFn: () => apiClients.getSyncStatus(currentTenant),
    refetchOnWindowFocus: false,
  });

  // Fetch integration logs
  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["integrationLogs", currentTenant],
    queryFn: () => apiClients.getIntegrationLogs(currentTenant),
    refetchOnWindowFocus: false,
  });

  const currentBusiness = businessIntegrations[currentTenant as keyof typeof businessIntegrations];
  const activeIntegrations = currentBusiness?.integrations.filter(i => i.status === "active").length || 0;
  const totalIntegrations = currentBusiness?.integrations.length || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSystemIcon = (system: string) => {
    switch (system) {
      case "Saleor": return <ShoppingCart className="h-4 w-4" />;
      case "ERPNext": return <Database className="h-4 w-4" />;
      case "n8n": return <Workflow className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6" />
              <h1 className="text-2xl font-semibold">Integration Bridge</h1>
              <Badge variant="outline" className={`${currentBusiness?.color} text-white`}>
                {currentBusiness?.name}
              </Badge>
            </div>
            <Button onClick={() => refetchStatus()} disabled={statusLoading} className="flex items-center gap-2">
              {statusLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Status
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="systems">Systems</TabsTrigger>
              <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Active Integrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{activeIntegrations}</div>
                    <p className="text-xs text-muted-foreground">of {totalIntegrations} total</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      Connected Systems
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <p className="text-xs text-muted-foreground">Saleor, ERPNext, n8n</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Webhook className="h-4 w-4 text-purple-500" />
                      Webhook Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">Active</div>
                    <p className="text-xs text-muted-foreground">Real-time sync</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-orange-500" />
                      Sync Success Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">98%</div>
                    <p className="text-xs text-muted-foreground">Last 24 hours</p>
                  </CardContent>
                </Card>
              </div>

              {/* Business Flow Diagram */}
              <Card>
                <CardHeader>
                  <CardTitle>Integration Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center space-x-8 p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ShoppingCart className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium">Saleor</p>
                      <p className="text-xs text-muted-foreground">E-commerce</p>
                    </div>
                    
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Database className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-sm font-medium">ERPNext</p>
                      <p className="text-xs text-muted-foreground">Business Logic</p>
                    </div>
                    
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Workflow className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium">n8n</p>
                      <p className="text-xs text-muted-foreground">Automation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Integrations - {currentBusiness?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {currentBusiness?.integrations.map((integration, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(integration.status)}
                          <div>
                            <p className="font-medium">{integration.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {integration.from} → {integration.to}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSystemIcon(integration.from)}
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          {getSystemIcon(integration.to)}
                          <Badge variant={integration.status === "active" ? "default" : "secondary"}>
                            {integration.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="systems" className="space-y-6">
              <div className="grid gap-4">
                {Object.entries(systemStatus).map(([system, status]) => (
                  <Card key={system}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 capitalize">
                        {getSystemIcon(system)}
                        {system} Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{status.url}</p>
                          <p className="text-sm text-muted-foreground">Health: {status.health}</p>
                        </div>
                        <Badge variant={status.status === "connected" ? "default" : "destructive"}>
                          {status.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Integration Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {logsLoading ? (
                    <div>Loading logs...</div>
                  ) : (
                    <div className="space-y-2">
                      {logs?.slice(0, 10).map((log: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(log.status)}
                            <div>
                              <p className="text-sm font-medium">{log.action}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={log.status === "success" ? "default" : "destructive"}>
                            {log.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
