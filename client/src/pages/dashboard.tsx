import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useTenant } from "@/hooks/use-tenant";
import { SuperuserDashboard } from "../components/tenant-dashboards/superuser";
import { SudoTechServeDashboard } from "../components/tenant-dashboards/sudotechserve";
import { StrongTermStrategyDashboard } from "../components/tenant-dashboards/strongtermstrategy";
import { SwitchToSwagDashboard } from "../components/tenant-dashboards/switchtoswag";

export default function Dashboard() {
  const { currentTenant } = useTenant();

  const renderTenantDashboard = () => {
    if (currentTenant === 'superuser') {
      return <SuperuserDashboard />;
    }
    if (currentTenant === 'sudotechserve') {
      return <SudoTechServeDashboard />;
    }
    if (currentTenant === 'strongtermstrategy') {
      return <StrongTermStrategyDashboard />;
    }
    return <SwitchToSwagDashboard />;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6" key={currentTenant}>
          {renderTenantDashboard()}
        </main>
      </div>
    </div>
  );
}
