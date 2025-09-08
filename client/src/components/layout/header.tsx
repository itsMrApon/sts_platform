import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTenant } from "@/hooks/use-tenant";
import { Search, Bell, HelpCircle } from "lucide-react";

export function Header() {
  const { currentTenant, getTenantConfig } = useTenant();
  const tenantConfig = getTenantConfig(currentTenant);

  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome to your {tenantConfig.name} dashboard
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search or type a command (⌘ + K)"
              className="w-80 pl-10 pr-16"
              data-testid="global-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              ⌘K
            </kbd>
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative" data-testid="notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
          </Button>
          
          {/* Help */}
          <Button variant="ghost" size="sm" data-testid="help">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
