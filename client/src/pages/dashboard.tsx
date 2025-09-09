import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { OnboardingCard } from "@/components/dashboard/onboarding-card";
import { ShortcutsGrid } from "@/components/dashboard/shortcuts-grid";
import { ReportsGrid } from "@/components/dashboard/reports-grid";
import { IntegrationStatus } from "@/components/dashboard/integration-status";
import { WebhookLogs } from "@/components/dashboard/webhook-logs";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <OnboardingCard />
          <ShortcutsGrid />
          <ReportsGrid />
          <IntegrationStatus />
          <WebhookLogs />
        </main>
      </div>
    </div>
  );
}
