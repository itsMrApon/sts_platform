import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, ShoppingBag, Workflow } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClients } from "@/lib/api-clients";
import { useTenant } from "@/hooks/use-tenant";
import { Skeleton } from "@/components/ui/skeleton";

export function IntegrationStatus() {
  const { currentTenant } = useTenant();
  
  const { data: syncStatus, isLoading } = useQuery({
    queryKey: ['/api/tenants', currentTenant, 'sync-status'],
    queryFn: () => apiClients.getSyncStatus(currentTenant),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* ERP Integration */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-card-foreground flex items-center">
              <Database className="h-5 w-5 text-primary mr-2" />
              ERP Integration
            </h3>
            <Badge 
              variant={syncStatus?.erpnext?.isActive ? "default" : "secondary"}
              className={syncStatus?.erpnext?.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
              data-testid="erpnext-status"
            >
              <div className={`w-2 h-2 rounded-full mr-1 ${
                syncStatus?.erpnext?.isActive ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              {syncStatus?.erpnext?.isActive ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Sync</span>
              <span className="text-sm font-medium text-card-foreground" data-testid="erpnext-last-sync">
                {formatTimeAgo(syncStatus?.erpnext?.lastSyncAt)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Records Synced</span>
              <span className="text-sm font-medium text-card-foreground" data-testid="erpnext-record-count">
                {syncStatus?.erpnext?.recordCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Webhook Status</span>
              <span className={`text-sm font-medium ${
                syncStatus?.erpnext?.isActive ? 'text-green-600' : 'text-gray-600'
              }`} data-testid="erpnext-webhook-status">
                {syncStatus?.erpnext?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ecommerce Integration */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-card-foreground flex items-center">
              <ShoppingBag className="h-5 w-5 text-primary mr-2" />
              Ecommerce Integration
            </h3>
            <Badge 
              variant={syncStatus?.saleor?.isActive ? "default" : "secondary"}
              className={syncStatus?.saleor?.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
              data-testid="saleor-status"
            >
              <div className={`w-2 h-2 rounded-full mr-1 ${
                syncStatus?.saleor?.isActive ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              {syncStatus?.saleor?.isActive ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Sync</span>
              <span className="text-sm font-medium text-card-foreground" data-testid="saleor-last-sync">
                {formatTimeAgo(syncStatus?.saleor?.lastSyncAt)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Products Synced</span>
              <span className="text-sm font-medium text-card-foreground" data-testid="saleor-record-count">
                {syncStatus?.saleor?.recordCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">GraphQL Status</span>
              <span className={`text-sm font-medium ${
                syncStatus?.saleor?.isActive ? 'text-green-600' : 'text-gray-600'
              }`} data-testid="saleor-graphql-status">
                {syncStatus?.saleor?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation (n8n) Integration */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-card-foreground flex items-center">
              <Workflow className="h-5 w-5 text-primary mr-2" />
              Automation (n8n)
            </h3>
            <Badge 
              variant={syncStatus?.n8n?.isActive ? "default" : "secondary"}
              className={syncStatus?.n8n?.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
              data-testid="n8n-status"
            >
              <div className={`w-2 h-2 rounded-full mr-1 ${
                syncStatus?.n8n?.isActive ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              {syncStatus?.n8n?.isActive ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Run</span>
              <span className="text-sm font-medium text-card-foreground" data-testid="n8n-last-sync">
                {formatTimeAgo(syncStatus?.n8n?.lastSyncAt)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Workflows Executed</span>
              <span className="text-sm font-medium text-card-foreground" data-testid="n8n-record-count">
                {syncStatus?.n8n?.recordCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={`text-sm font-medium ${
                syncStatus?.n8n?.isActive ? 'text-green-600' : 'text-gray-600'
              }`} data-testid="n8n-activity-status">
                {syncStatus?.n8n?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
