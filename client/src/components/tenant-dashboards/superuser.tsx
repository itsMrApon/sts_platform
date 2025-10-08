import { OnboardingCard } from "@/components/dashboard/superuser/onboarding-card";
import { IntegrationStatus } from "@/components/dashboard/superuser/integration-status";
import { ShortcutsGrid } from "@/components/dashboard/superuser/shortcuts-grid";
import { ReportsGrid } from "@/components/dashboard/superuser/reports-grid";

export function SuperuserDashboard() {
  return (
    <>
      <OnboardingCard />
      <IntegrationStatus />
      <ShortcutsGrid />
      <ReportsGrid />
    </>
  );
}