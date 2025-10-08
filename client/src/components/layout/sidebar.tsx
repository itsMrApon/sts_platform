import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTenant } from "@/hooks/use-tenant";
import { type TenantType } from "@shared/schema";
import { 
  Home, 
  Users, 
  ClipboardList, 
  CreditCard, 
  Headphones,
  Package,
  ShoppingCart,
  Warehouse,
  Palette,
  Factory,
  Truck,
  ClipboardCheck,
  Ship,
  BarChart3,
  Settings,
  Plug,
  User,
  MoreVertical,
  Box,
  Workflow,
  Zap
} from "lucide-react";

const moduleIcons = {
  'Customers': Users,
  'Projects': ClipboardList,
  'Subscriptions': CreditCard,
  'Support': Headphones,
  'Products': Package,
  'Orders': ShoppingCart,
  'Inventory': Warehouse,
  'Design Studio': Palette,
  'Manufacturing': Factory,
  'Procurement': Truck,
  'Quality Control': ClipboardCheck,
  'FOB Shipments': Ship,
  'n8n': Workflow
};

export function Sidebar() {
  const { currentTenant, setCurrentTenant, getTenantConfig } = useTenant();
  const tenantConfig = getTenantConfig(currentTenant);
  const [, navigate] = useLocation();

  const handleTenantChange = (value: TenantType) => {
    setCurrentTenant(value);
  };

  return (
    <div className="w-64 bg-card border-r border-border shadow-sm flex flex-col">
      {/* Logo and Tenant Switcher */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Box className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="text-lg font-semibold text-foreground">STS Platform</div>
        </div>
        
        {/* Tenant Switcher */}
        <Select value={currentTenant} onValueChange={handleTenantChange}>
          <SelectTrigger className="w-full" data-testid="tenant-selector">
            <SelectValue placeholder="Select tenant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="superuser">Superuser (Admin)</SelectItem>
            <SelectItem value="sudotechserve">SudoTechServe (Agency/SaaS)</SelectItem>
            <SelectItem value="switchtoswag">SwitchToSwag (E-commerce)</SelectItem>
            <SelectItem value="strongtermstrategy">StrongTermStrategy (Manufacturing)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {/* Dashboard */}
          <div className="p-2">
            <Button 
              variant="secondary" 
              className="w-full justify-start space-x-3 bg-primary/10 text-primary hover:bg-primary/20"
              data-testid="nav-dashboard"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </div>

          {/* Tenant-specific modules */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {tenantConfig.description}
            </div>
            {tenantConfig.modules.map((module) => {
              const IconComponent = moduleIcons[module as keyof typeof moduleIcons];
              return (
                <Button
                  key={module}
                  variant="ghost"
                  className="w-full justify-start space-x-3 px-5 text-muted-foreground hover:text-foreground hover:bg-muted"
                  data-testid={`nav-${module.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    if (module === 'Orders') {
                      navigate('/orders');
                      return;
                    }
                    if (module === 'Products') {
                      navigate('/products');
                      return;
                    }
                    if (module === 'Projects') {
                      navigate('/projects');
                      return;
                    }
                    if (module === 'Customers') {
                      navigate('/customers');
                      return;
                    }
                    // Removed special-case mapping of 'Subscriptions' to /n8n
                    if (module === 'n8n') {
                      navigate('/n8n');
                      return;
                    }
                  }}
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <span>{module}</span>
                </Button>
              );
            })}
          </div>

          {/* Common modules */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Common
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 px-5 text-muted-foreground hover:text-foreground hover:bg-muted"
              data-testid="nav-reports"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Reports</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 px-5 text-muted-foreground hover:text-foreground hover:bg-muted"
              data-testid="nav-settings"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 px-5 text-muted-foreground hover:text-foreground hover:bg-muted"
              data-testid="nav-integrations"
              onClick={() => navigate('/integrations')}
            >
              <Zap className="h-4 w-4" />
              <span>Integration Bridge</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">Admin User</div>
            <div className="text-xs text-muted-foreground truncate">System Administrator</div>
          </div>
          <Button variant="ghost" size="sm" className="p-1">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
