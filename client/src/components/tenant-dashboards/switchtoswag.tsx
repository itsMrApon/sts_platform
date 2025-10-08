import { OrderStatus } from "@/components/dashboard/ecommerce/order-status";
import { OrderHistory } from "@/components/dashboard/ecommerce/order-history";
import { SaleorRedirectPanel } from "@/components/dashboard/ecommerce/saleor-redirect-panel";
import { OnDemandProduction } from "@/components/dashboard/ecommerce/on-demand-production";

export function SwitchToSwagDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Your Store Dashboard</h1>
        <p className="text-muted-foreground">Track your orders and product updates</p>
      </div>
      
      <SaleorRedirectPanel />
      
      <OnDemandProduction />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderStatus />
        <OrderHistory />
      </div>
    </div>
  );
}


