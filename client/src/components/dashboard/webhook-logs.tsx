import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiClients } from "@/lib/api-clients";
import { useTenant } from "@/hooks/use-tenant";
import { Loader2, Webhook, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

export function WebhookLogs() {
  const { currentTenant } = useTenant();
  
  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/tenants', currentTenant, 'logs'],
    queryFn: () => apiClients.getLogs(currentTenant),
    refetchInterval: 2000, // Refresh every 2 seconds for more real-time updates
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache data
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'saleor':
        return <Webhook className="h-4 w-4 text-blue-500" />;
      case 'erpnext':
        return <Webhook className="h-4 w-4 text-orange-500" />;
      default:
        return <Webhook className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading webhook logs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            Failed to load webhook logs
          </div>
        </CardContent>
      </Card>
    );
  }

  const webhookLogs = logs?.filter(log => 
    log.source === 'saleor' && (log.action.includes('webhook') || log.action.startsWith('webhook_'))
  ) || [];

  // Debug logging
  console.log('WebhookLogs Debug:', {
    currentTenant,
    logsCount: logs?.length || 0,
    webhookLogsCount: webhookLogs.length,
    logs: logs,
    webhookLogs: webhookLogs
  });


  return (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Logs
            <Badge variant="outline">{webhookLogs.length} events</Badge>
            <div className="ml-auto flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => refetch()}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      <CardContent>
        {/* Debug Info */}
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
          <strong>Debug:</strong> Total logs: {logs?.length || 0}, Webhook logs: {webhookLogs.length}
        </div>

        {webhookLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No webhook events yet</p>
            <p className="text-sm">Create or update products in Saleor to see events here</p>
            {logs && logs.length > 0 && (
              <div className="mt-4 text-xs">
                <p>Total logs available: {logs.length}</p>
                <p>All actions: {logs.map(l => l.action).join(', ')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {webhookLogs.slice(0, 20).map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getSourceIcon(log.source)}
                  <div>
                    <div className="font-medium text-sm">
                      {log.action.replace('webhook_', '').replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(log.status)}
                  {getStatusBadge(log.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
