import { AgencySteps } from "@/components/dashboard/agency/steps";
import { AgencyUploadSources } from "@/components/dashboard/agency/upload-sources";
import { AgencyConversionsAndCustomers } from "@/components/dashboard/agency/conversions-and-customers";
import { AgencyQuickActions } from "@/components/dashboard/agency/quick-actions";
import { DeveloperServices } from "@/components/dashboard/agency/developer-services";

export function SudoTechServeDashboard() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-foreground">Get maximum Conversion from your agency</h1>
        <AgencySteps />
      </div>
      
      <DeveloperServices />
      
      <AgencyConversionsAndCustomers />
      <AgencyQuickActions />
      
      <AgencyUploadSources />
    </div>
  );
}


