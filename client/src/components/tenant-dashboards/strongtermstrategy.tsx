import { ProductionOverview } from "@/components/dashboard/manufacturing/production-overview";
import { ManufacturingQuickActions } from "@/components/dashboard/manufacturing/quick-actions";
import { ManufacturingOrder } from "@/components/dashboard/manufacturing/manufacturing-order";
import { SourcingSupply } from "@/components/dashboard/manufacturing/sourcing-supply";

export function StrongTermStrategyDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Manufacturing Dashboard</h1>
        <p className="text-muted-foreground">Manage production, sourcing, and custom manufacturing orders</p>
      </div>

      <ProductionOverview />
      
      <ManufacturingQuickActions />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ManufacturingOrder />
        <SourcingSupply />
      </div>
    </div>
  );
}


