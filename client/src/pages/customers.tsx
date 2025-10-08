import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClients } from "@/lib/api-clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/hooks/use-tenant";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Users, ArrowRight } from "lucide-react";

export default function CustomersPage() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Saleor customers
  const { data: saleorData, isLoading: saleorLoading, error: saleorError, refetch: refetchSaleor } = useQuery({
    queryKey: ["saleorCustomers", currentTenant],
    queryFn: () => apiClients.getSaleorCustomers(currentTenant),
    refetchOnWindowFocus: false,
  });

  // Fetch ERPNext customers
  const { data: erpnextData, isLoading: erpnextLoading, error: erpnextError, refetch: refetchERPNext } = useQuery({
    queryKey: ["erpnextCustomers", currentTenant],
    queryFn: () => apiClients.getERPNextCustomers(currentTenant),
    refetchOnWindowFocus: false,
  });

  // Sync customers mutation
  const syncMutation = useMutation({
    mutationFn: () => apiClients.syncCustomers(currentTenant),
    onSuccess: (data) => {
      toast({
        title: "Sync Successful",
        description: `Synced ${data.summary?.synced || 0} customers, skipped ${data.summary?.skipped || 0}, errors: ${data.summary?.errors || 0}`,
      });
      queryClient.invalidateQueries({ queryKey: ["erpnextCustomers"] });
      queryClient.invalidateQueries({ queryKey: ["saleorCustomers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync customers",
        variant: "destructive",
      });
    },
  });

  const [sortField, setSortField] = useState<"name" | "email" | "created">("name");
  const [filterSource, setFilterSource] = useState<"all" | "saleor" | "erpnext">("all");

  useEffect(() => {
    void refetchSaleor();
    void refetchERPNext();
  }, [currentTenant, refetchSaleor, refetchERPNext]);

  const saleorCustomers = saleorData?.customers?.edges?.map((edge: any) => edge.node) || [];
  const erpnextCustomers = Array.isArray(erpnextData) ? erpnextData : [];

  const handleSync = () => {
    syncMutation.mutate();
  };

  const isCustomerInERPNext = (email: string) => {
    if (!Array.isArray(erpnextCustomers)) return false;
    return erpnextCustomers.some((customer: any) => customer.email_id === email);
  };

  const sortedSaleorCustomers = [...saleorCustomers].sort((a, b) => {
    if (sortField === "name") {
      const nameA = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase();
      const nameB = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    } else if (sortField === "email") {
      return (a.email || "").localeCompare(b.email || "");
    }
    return 0;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6" />
              <h1 className="text-2xl font-semibold">Customer Sync</h1>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortField} onValueChange={(v) => setSortField(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleSync} 
                disabled={syncMutation.isPending}
                className="flex items-center gap-2"
              >
                {syncMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Sync All Customers
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saleor Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{saleorCustomers.length}</div>
                <p className="text-xs text-muted-foreground">Total customers in Saleor</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ERPNext Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{erpnextCustomers.length}</div>
                <p className="text-xs text-muted-foreground">Total customers in ERPNext</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Not Synced</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {saleorCustomers.filter((customer: any) => !isCustomerInERPNext(customer.email)).length}
                </div>
                <p className="text-xs text-muted-foreground">Need to be synced</p>
              </CardContent>
            </Card>
          </div>

          {/* Saleor Customers */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Saleor Customers ({saleorCustomers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {saleorLoading && <div>Loading Saleor customers...</div>}
              {saleorError && <div className="text-red-600">Failed to load Saleor customers</div>}
              
              <div className="grid gap-3">
                {sortedSaleorCustomers.map((customer: any) => {
                  const isSynced = isCustomerInERPNext(customer.email);
                  const customerName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || customer.email;
                  
                  return (
                    <Card key={customer.id} className={`${isSynced ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <div className="font-medium">{customerName}</div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                            {customer.defaultBillingAddress && (
                              <div className="text-xs text-muted-foreground">
                                📍 {customer.defaultBillingAddress.city}, {customer.defaultBillingAddress.country?.country || customer.defaultBillingAddress.country?.code}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={isSynced ? "default" : "secondary"}>
                              {isSynced ? "✅ Synced" : "⏳ Not Synced"}
                            </Badge>
                            {!isSynced && (
                              <ArrowRight className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {!saleorLoading && saleorCustomers.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    No customers found in Saleor.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ERPNext Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                ERPNext Customers ({erpnextCustomers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {erpnextLoading && <div>Loading ERPNext customers...</div>}
              {erpnextError && <div className="text-red-600">Failed to load ERPNext customers</div>}
              
              <div className="grid gap-3">
                {erpnextCustomers.map((customer: any) => (
                  <Card key={customer.name} className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email_id || "No email"}</div>
                          <div className="text-sm text-muted-foreground">{customer.customer_name || "No customer name"}</div>
                        </div>
                        <Badge variant="default">✅ In ERPNext</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!erpnextLoading && erpnextCustomers.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    No customers found in ERPNext.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
