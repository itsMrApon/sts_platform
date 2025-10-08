import { Button } from "@/components/ui/button";
import { Users, Tag, Zap, Gauge } from "lucide-react";

export function AgencyQuickActions() {
  const actions = [
    { icon: Users, title: 'Create Client' },
    { icon: Tag, title: 'Add Offer' },
    { icon: Zap, title: 'Launch Campaign' },
    { icon: Gauge, title: 'View Analytics' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((a, i) => (
        <Button key={i} variant="outline" className="h-24 flex flex-col items-start justify-start gap-2">
          <a.icon className="h-6 w-6 text-primary" />
          <span className="text-sm">{a.title}</span>
        </Button>
      ))}
    </div>
  );
}


