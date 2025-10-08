import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  MapPin, 
  Scissors, 
  Layout, 
  Printer, 
  Tag, 
  CheckCircle, 
  Ship, 
  Calculator,
  Plus,
  Eye
} from "lucide-react";
import { useState } from "react";

export function ManufacturingOrder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState({
    fabric: { source: '', composition: '', gsm: '', dyeing: '' },
    pattern: { basePattern: '', sizeSet: '' },
    layout: { sizeRatio: '', fabricWidth: '' },
    accessories: { threads: '', trims: '', labels: '', packaging: '' },
    finishing: { wash: '', press: '', qc: '', packing: '' },
    fob: { incoterms: '', port: '', shipmentPlan: '' }
  });

  const steps = [
    { id: 1, title: "Fabric Selection", icon: Package, description: "Source, composition, GSM, dyeing/finishing" },
    { id: 2, title: "Pattern Selection", icon: Scissors, description: "Base pattern by size set" },
    { id: 3, title: "Pattern Editing", icon: Layout, description: "Fit, allowances, grading" },
    { id: 4, title: "Layout/Marker", icon: Layout, description: "Size ratio, fabric width" },
    { id: 5, title: "Layout Editing", icon: Layout, description: "Marker efficiency, waste optimization" },
    { id: 6, title: "Print/AMBO", icon: Printer, description: "Marker print or automated marking/bundling" },
    { id: 7, title: "Accessories", icon: Tag, description: "Threads, trims, labels, packaging" },
    { id: 8, title: "Finishing", icon: CheckCircle, description: "Wash/press, QC, packing" },
    { id: 9, title: "FOB", icon: Ship, description: "Incoterms, port, shipment plan" },
    { id: 10, title: "Final Rate", icon: Calculator, description: "Material + labor + overhead + margin" }
  ];

  const locations = [
    { id: 'nyc', name: 'New York City', description: 'Premium manufacturing' },
    { id: 'sweden', name: 'Sweden', description: 'Sustainable production' },
    { id: 'bangladesh', name: 'Bangladesh', description: 'Cost-effective bulk' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fabric-source">Fabric Source</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fabric source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cotton">100% Cotton</SelectItem>
                    <SelectItem value="polyester">Polyester Blend</SelectItem>
                    <SelectItem value="wool">Wool</SelectItem>
                    <SelectItem value="silk">Silk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="composition">Composition</Label>
                <Input placeholder="e.g., 60% Cotton, 40% Polyester" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gsm">GSM (Grams per Square Meter)</Label>
                <Input placeholder="e.g., 180 GSM" />
              </div>
              <div>
                <Label htmlFor="dyeing">Dyeing/Finishing</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select finishing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-washed">Pre-washed</SelectItem>
                    <SelectItem value="stone-washed">Stone-washed</SelectItem>
                    <SelectItem value="enzyme-washed">Enzyme-washed</SelectItem>
                    <SelectItem value="garment-dyed">Garment-dyed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="base-pattern">Base Pattern</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select base pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="t-shirt">T-Shirt</SelectItem>
                  <SelectItem value="polo">Polo Shirt</SelectItem>
                  <SelectItem value="hoodie">Hoodie</SelectItem>
                  <SelectItem value="dress">Dress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="size-set">Size Set</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select size set" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xs-xl">XS, S, M, L, XL</SelectItem>
                  <SelectItem value="xxs-xxl">XXS, XS, S, M, L, XL, XXL</SelectItem>
                  <SelectItem value="numeric">2, 4, 6, 8, 10, 12, 14</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="incoterms">Incoterms</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select incoterms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fob">FOB (Free on Board)</SelectItem>
                    <SelectItem value="cif">CIF (Cost, Insurance, Freight)</SelectItem>
                    <SelectItem value="exw">EXW (Ex Works)</SelectItem>
                    <SelectItem value="ddp">DDP (Delivered Duty Paid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="port">Port of Shipment</Label>
                <Input placeholder="e.g., Port of Chittagong" />
              </div>
            </div>
            <div>
              <Label htmlFor="shipment-plan">Shipment Plan</Label>
              <Textarea placeholder="Describe shipment schedule and logistics..." />
            </div>
          </div>
        );
      case 10:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="material-cost">Material Cost</Label>
                <Input placeholder="$0.00" />
              </div>
              <div>
                <Label htmlFor="labor-cost">Labor Cost</Label>
                <Input placeholder="$0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="overhead">Overhead</Label>
                <Input placeholder="$0.00" />
              </div>
              <div>
                <Label htmlFor="margin">Margin (%)</Label>
                <Input placeholder="20%" />
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Cost:</span>
                <span className="text-2xl font-bold text-primary">$0.00</span>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Configure this step based on your requirements</p>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Configuration
            </Button>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Custom Manufacturing Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="workflow" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workflow">10-Step Workflow</TabsTrigger>
            <TabsTrigger value="locations">Production Locations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflow" className="space-y-6">
            {/* Step Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {steps.map((step) => (
                <Button
                  key={step.id}
                  variant={currentStep === step.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentStep(step.id)}
                  className="flex-shrink-0"
                >
                  <step.icon className="h-4 w-4 mr-2" />
                  {step.id}
                </Button>
              ))}
            </div>

            {/* Current Step Content */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                {steps[currentStep - 1] && (() => {
                  const StepIcon = steps[currentStep - 1].icon;
                  return (
                    <>
                      <StepIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">{steps[currentStep - 1].title}</h3>
                        <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  onClick={() => setCurrentStep(Math.min(10, currentStep + 1))}
                  disabled={currentStep === 10}
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <div className="grid gap-4">
              {locations.map((location) => (
                <Card key={location.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-semibold">{location.name}</h3>
                          <p className="text-sm text-muted-foreground">{location.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
