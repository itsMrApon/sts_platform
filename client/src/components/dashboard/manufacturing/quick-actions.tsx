import { Button } from "@/components/ui/button";
import { Users, ClipboardList, Receipt, Package, MapPin, Settings } from "lucide-react";

export function ManufacturingQuickActions() {
  const actions = [
    { icon: Users, title: 'Vendors', description: 'Manage suppliers' },
    { icon: ClipboardList, title: 'Purchase Orders', description: 'Track procurement' },
    { icon: Receipt, title: 'Invoices', description: 'Financial records' },
    { icon: Package, title: 'Materials', description: 'Inventory management' },
    { icon: MapPin, title: 'Locations', description: 'NYC, Sweden, Bangladesh' },
    { icon: Settings, title: 'Settings', description: 'Configuration' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <Button 
            key={index} 
            variant="outline" 
            className="h-20 flex flex-col items-start justify-start gap-2 p-4 hover:bg-muted/50"
          >
            <action.icon className="h-5 w-5 text-primary" />
            <div className="text-left">
              <div className="font-medium text-sm">{action.title}</div>
              <div className="text-xs text-muted-foreground">{action.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
