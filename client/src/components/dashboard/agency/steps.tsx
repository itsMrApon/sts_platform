import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function AgencySteps() {
  const steps = [
    { step: 1, title: 'Connect Stripe', desc: 'Connect your Stripe to start accepting payments' },
    { step: 2, title: 'Create AI Agent', desc: 'Set up an AI agent to automate client interactions' },
    { step: 3, title: 'Create a campaign', desc: 'Set up your first campaign to start collecting leads' }
  ];

  return (
    <div className="space-y-3">
      {steps.map((s) => (
        <Button key={s.step} variant="secondary" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-muted text-xs">{s.step}</span>
            {s.title}
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}


