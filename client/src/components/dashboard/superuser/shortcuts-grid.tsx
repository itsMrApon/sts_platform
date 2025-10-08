import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus, FileText, BarChart3 } from "lucide-react";

const shortcuts = [
  {
    icon: PlusCircle,
    title: "Create Item",
    description: "Add new product or service",
    action: "createItem"
  },
  {
    icon: UserPlus,
    title: "Add Customer", 
    description: "Create new customer record",
    action: "addCustomer"
  },
  {
    icon: FileText,
    title: "Sales Invoice",
    description: "Generate new invoice",
    action: "salesInvoice"
  },
  {
    icon: BarChart3,
    title: "Dashboard",
    description: "View analytics and reports",
    action: "dashboard"
  }
];

export function ShortcutsGrid() {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">Your Shortcuts</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {shortcuts.map((shortcut, index) => {
          const IconComponent = shortcut.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-3 hover:shadow-md transition-shadow group"
              data-testid={`shortcut-${shortcut.action}`}
            >
              <IconComponent className="h-8 w-8 text-primary group-hover:text-primary/80" />
              <div className="text-left">
                <h3 className="font-medium text-card-foreground mb-1">{shortcut.title}</h3>
                <p className="text-sm text-muted-foreground">{shortcut.description}</p>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
