import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/hooks/use-tenant";
import { apiClients } from "@/lib/api-clients";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductsPage() {
  const { currentTenant } = useTenant();
  const [sortField, setSortField] = useState<"name" | "slug">("name");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['saleorProducts', currentTenant],
    queryFn: () => apiClients.getSaleorProducts(currentTenant),
    enabled: !!currentTenant,
    refetchInterval: 10000,
  });

  const edges = productsData?.products?.edges || [];

  const sortedEdges = useMemo(() => {
    const copy = edges.slice();
    copy.sort((a: any, b: any) => {
      const na = a.node;
      const nb = b.node;
      if (sortField === "name") {
        const sa = (na.name || "").toString();
        const sb = (nb.name || "").toString();
        return sa.localeCompare(sb);
      }
      // slug
      const sa = (na.slug || "").toString();
      const sb = (nb.slug || "").toString();
      return sa.localeCompare(sb);
    });
    return copy;
  }, [edges, sortField]);

  if (isLoading) return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div>Loading products...</div>
        </main>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="text-red-500">Error: {error.message}</div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Saleor Products ({currentTenant})</h1>
                <div className="flex items-center space-x-2">
                  <Select value={sortField} onValueChange={(v) => setSortField(v as any)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="slug">Slug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {sortedEdges.length === 0 ? (
                <p className="text-muted-foreground">No Saleor products found for this tenant.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEdges.map((product: any) => (
                      <TableRow key={product.node.id}>
                        <TableCell className="font-medium">{product.node.name}</TableCell>
                        <TableCell>{product.node.slug}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{product.node.id}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
