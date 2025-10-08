import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Circle, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClients } from "@/lib/api-clients";
import { useTenant } from "@/hooks/use-tenant";
import { useToast } from "@/hooks/use-toast";

interface OnboardingStep {
  title: string;
  description: string;
  completed: boolean;
  action: string;
  testConnection?: () => Promise<boolean>;
}

export function OnboardingCard() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const qc = useQueryClient();
  
  // Fetch sync status to determine connection state
  const { data: syncStatus, isLoading } = useQuery({
    queryKey: ['/api/tenants', currentTenant, 'sync-status'],
    queryFn: () => apiClients.getSyncStatus(currentTenant),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch integration logs to check webhook activity
  const { data: logs } = useQuery({
    queryKey: ['/api/tenants', currentTenant, 'logs'],
    queryFn: () => apiClients.getIntegrationLogs(currentTenant),
    refetchInterval: 10000, // Refresh every 10 seconds for webhook activity
  });

  // Test ERPNext connection
  const testERPNextConnection = async (): Promise<boolean> => {
    try {
      await apiClients.getERPNextItems(currentTenant);
      return true;
    } catch {
      return false;
    }
  };

  // Test Saleor connection
  const testSaleorConnection = async (): Promise<boolean> => {
    try {
      await apiClients.getSaleorProducts(currentTenant);
      return true;
    } catch {
      return false;
    }
  };

  // Check n8n health
  const { data: n8nStatus } = useQuery({
    queryKey: ['/api/n8n/status', currentTenant],
    queryFn: () => apiClients.getN8nStatus(currentTenant),
    refetchInterval: 15000,
  });

  // Dynamic steps based on actual connection status
  const steps: OnboardingStep[] = [
    {
      title: "Setup ERPNext Connection",
      description: "Connect to your ERPNext instance at localhost:8080",
      completed: syncStatus?.erpnext?.isActive || false,
      action: syncStatus?.erpnext?.isActive ? "Connected" : "Configure",
      testConnection: testERPNextConnection
    },
    {
      title: "Setup Saleor Connection", 
      description: "Connect to your Saleor GraphQL API at localhost:8000",
      completed: syncStatus?.saleor?.isActive || false,
      action: syncStatus?.saleor?.isActive ? "Connected" : "Configure",
      testConnection: testSaleorConnection
    },
    {
      title: "Setup n8n Connection",
      description: n8nStatus?.n8n?.baseUrl || "Connect to your n8n instance",
      completed: !!n8nStatus?.n8n?.available,
      action: n8nStatus?.n8n?.available ? "Connected" : "Not connected"
    }
  ];

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading connection status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">
            Let's begin your journey with STS Platform
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            onClick={async () => {
              try {
                await apiClients.refreshSync(currentTenant);
                await qc.invalidateQueries({ queryKey: ['/api/tenants', currentTenant, 'sync-status'] });
                await qc.invalidateQueries({ queryKey: ['/api/n8n/status', currentTenant] });
                toast({ title: 'Sync executed', description: 'Connectivity checked and status updated.' });
              } catch (e: any) {
                toast({ title: 'Sync failed', description: String(e?.message || e), variant: 'destructive' });
              }
            }}
          >
            Sync
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          ERPNext, Saleor, and custom business operations integration
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                step.completed 
                  ? 'bg-green-500' 
                  : 'bg-secondary border-2 border-border'
              }`}>
                {step.completed ? (
                  <Check className="h-3 w-3 text-white" />
                ) : (
                  <Circle className="h-2 w-2 fill-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-card-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-primary hover:text-primary/80 mt-1"
                  data-testid={`setup-${step.title.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={step.testConnection ? async () => {
                    const isConnected = await step.testConnection!();
                    toast({ title: step.title, description: isConnected ? 'Connected' : 'Not reachable', variant: isConnected ? undefined : 'destructive' });
                  } : undefined}
                >
                  {step.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
