import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClients } from "@/lib/api-clients";
import { Card, CardContent } from "@/components/ui/card";
import { useTenant } from "@/hooks/use-tenant";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OrdersPage() {
  const { currentTenant } = useTenant();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["saleorOrders", currentTenant],
    queryFn: () => apiClients.getSaleorOrders(currentTenant),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    void refetch();
  }, [currentTenant, refetch]);

  const edges = data?.orders?.edges ?? [];

  const [sortField, setSortField] = useState<"created" | "status">("created");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const sortedEdges = useMemo(() => {
    const filtered = statusFilter === "all"
      ? edges
      : edges.filter((e: any) => (e.node.status || "").toString() === statusFilter);
    const copy = filtered.slice();
    copy.sort((a: any, b: any) => {
      const na = a.node;
      const nb = b.node;
      if (sortField === "created") {
        const da = na.created ? new Date(na.created).getTime() : 0;
        const db = nb.created ? new Date(nb.created).getTime() : 0;
        return db - da; // Always desc for created
      }
      // status
      const sa = (na.status || "").toString();
      const sb = (nb.status || "").toString();
      if (sa === sb) return 0;
      return sa < sb ? -1 : 1;
    });
    return copy;
  }, [edges, sortField, statusFilter]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h1 className="text-xl font-semibold">Orders ({edges.length})</h1>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="UNFULFILLED">UNFULFILLED</SelectItem>
                  <SelectItem value="PARTIALLY_FULFILLED">PARTIALLY_FULFILLED</SelectItem>
                  <SelectItem value="FULFILLED">FULFILLED</SelectItem>
                  <SelectItem value="CANCELED">CANCELED</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortField} onValueChange={(v) => setSortField(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Created time</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && <div>Loading orders…</div>}
          {error && <div className="text-red-600">Failed to load orders</div>}

          <div className="grid gap-3">
            {sortedEdges.map((edge: any) => {
              const node = edge.node;
              return (
                <Card key={node.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="font-medium">Order #{node.number ?? node.id}</div>
                      <div className="text-muted-foreground">Status: {node.status ?? "UNKNOWN"}</div>
                      <div className="text-muted-foreground">Created: {node.created ? new Date(node.created).toLocaleString() : "-"}</div>
                      <div className="text-muted-foreground">Email: {node.user?.email ?? node.userEmail ?? "-"}</div>
                      {node.total?.gross && (
                        <div className="text-muted-foreground">Total: {node.total.gross.amount} {node.total.gross.currency}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {!isLoading && edges.length === 0 && (
              <div className="text-sm text-muted-foreground">No orders found for this tenant.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}


