import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Circle } from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  completed: boolean;
  action: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Setup ERPNext Connection",
    description: "Connect to your ERPNext instance at localhost:8080",
    completed: true,
    action: "Configure"
  },
  {
    title: "Setup Saleor Connection", 
    description: "Connect to your Saleor GraphQL API at localhost:9001",
    completed: false,
    action: "Configure"
  },
  {
    title: "Configure Webhooks",
    description: "Setup real-time data synchronization",
    completed: false,
    action: "Configure"
  }
];

export function OnboardingCard() {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">
            Let's begin your journey with STS Platform
          </h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Dismiss
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          ERPNext, Saleor, and custom business operations integration
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                step.completed 
                  ? 'bg-primary' 
                  : 'bg-secondary border-2 border-border'
              }`}>
                {step.completed ? (
                  <Check className="h-3 w-3 text-primary-foreground" />
                ) : (
                  <Circle className="h-2 w-2 fill-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-card-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-primary hover:text-primary/80 mt-1"
                  data-testid={`setup-${step.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {step.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
