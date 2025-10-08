import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Package, Handshake, ArrowRight } from "lucide-react";

const reportSections = [
  {
    title: "Accounting",
    icon: Calculator,
    items: [
      "Chart of Accounts",
      "Company", 
      "Customer",
      "Supplier"
    ]
  },
  {
    title: "Stock",
    icon: Package,
    items: [
      "Item",
      "Warehouse",
      "Brand",
      "Unit of Measure (UOM)"
    ]
  },
  {
    title: "CRM",
    icon: Handshake,
    items: [
      "Lead",
      "Customer Group",
      "Territory"
    ]
  }
];

export function ReportsGrid() {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">Reports & Masters</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportSections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="font-medium text-card-foreground mb-4 flex items-center">
                  <IconComponent className="h-5 w-5 text-primary mr-2" />
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <Button
                      key={itemIndex}
                      variant="ghost"
                      className="w-full justify-between text-sm text-muted-foreground hover:text-foreground py-1 h-auto"
                      data-testid={`report-${item.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}
                    >
                      <span>{item}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
