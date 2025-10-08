import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Globe, 
  ShoppingCart, 
  Palette, 
  Megaphone, 
  Users, 
  Clock, 
  DollarSign,
  Plus,
  Eye,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Monitor,
  Database,
  Cloud
} from "lucide-react";
import { useState } from "react";

export function DeveloperServices() {
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceData, setServiceData] = useState({
    serviceType: '',
    stack: '',
    teamSize: '',
    timeline: '',
    budget: '',
    requirements: ''
  });

  const services = [
    {
      id: 1,
      title: "Software Development",
      icon: Code,
      description: "Custom applications and software solutions",
      category: "Development"
    },
    {
      id: 2,
      title: "Website Development",
      icon: Globe,
      description: "Responsive websites and web applications",
      category: "Development"
    },
    {
      id: 3,
      title: "E-commerce Platform",
      icon: ShoppingCart,
      description: "Online stores and marketplace solutions",
      category: "E-commerce"
    },
    {
      id: 4,
      title: "Brand Identity",
      icon: Palette,
      description: "Logo, branding, and visual identity",
      category: "Design"
    },
    {
      id: 5,
      title: "Digital Marketing",
      icon: Megaphone,
      description: "SEO, SEM, social media marketing",
      category: "Marketing"
    }
  ];

  const techStacks = {
    frontend: [
      { name: "React", description: "Modern UI library", complexity: "Medium" },
      { name: "Vue.js", description: "Progressive framework", complexity: "Easy" },
      { name: "Angular", description: "Enterprise framework", complexity: "Hard" },
      { name: "Next.js", description: "React with SSR", complexity: "Medium" },
      { name: "Nuxt.js", description: "Vue with SSR", complexity: "Medium" }
    ],
    backend: [
      { name: "Node.js", description: "JavaScript runtime", complexity: "Medium" },
      { name: "Python (Django)", description: "Rapid development", complexity: "Easy" },
      { name: "Python (FastAPI)", description: "High performance", complexity: "Medium" },
      { name: "Java (Spring)", description: "Enterprise grade", complexity: "Hard" },
      { name: "PHP (Laravel)", description: "Web development", complexity: "Medium" }
    ],
    mobile: [
      { name: "React Native", description: "Cross-platform", complexity: "Medium" },
      { name: "Flutter", description: "Google's framework", complexity: "Medium" },
      { name: "Swift (iOS)", description: "Native iOS", complexity: "Hard" },
      { name: "Kotlin (Android)", description: "Native Android", complexity: "Hard" }
    ],
    database: [
      { name: "PostgreSQL", description: "Relational database", complexity: "Medium" },
      { name: "MongoDB", description: "NoSQL database", complexity: "Medium" },
      { name: "MySQL", description: "Popular relational", complexity: "Easy" },
      { name: "Redis", description: "In-memory cache", complexity: "Medium" }
    ]
  };

  const teamSizes = [
    { size: "Solo Developer", duration: "2-4 weeks", price: "$2,000-5,000" },
    { size: "Small Team (2-3)", duration: "1-2 months", price: "$5,000-15,000" },
    { size: "Medium Team (4-6)", duration: "2-4 months", price: "$15,000-40,000" },
    { size: "Large Team (7+)", duration: "3-6 months", price: "$40,000-100,000+" }
  ];

  const steps = [
    { id: 1, title: "Service Selection", icon: Code, description: "Choose your digital service type" },
    { id: 2, title: "Tech Stack", icon: Database, description: "Select technology stack and frameworks" },
    { id: 3, title: "Team Size", icon: Users, description: "Determine team requirements" },
    { id: 4, title: "Timeline", icon: Clock, description: "Set project timeline and milestones" },
    { id: 5, title: "Budget", icon: DollarSign, description: "Define budget and pricing model" },
    { id: 6, title: "Requirements", icon: CheckCircle, description: "Detailed project requirements" }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => {
                const ServiceIcon = service.icon;
                return (
                  <Card 
                    key={service.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setServiceData({...serviceData, serviceType: service.title})}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <ServiceIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{service.title}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <Badge variant="outline" className="mt-1">{service.category}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      case 2:
        return (
          <Tabs defaultValue="frontend" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="frontend">Frontend</TabsTrigger>
              <TabsTrigger value="backend">Backend</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
            </TabsList>
            
            {Object.entries(techStacks).map(([category, stacks]) => (
              <TabsContent key={category} value={category} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stacks.map((stack) => (
                    <Card key={stack.name} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{stack.name}</h4>
                            <p className="text-sm text-muted-foreground">{stack.description}</p>
                          </div>
                          <Badge 
                            variant={stack.complexity === 'Easy' ? 'default' : stack.complexity === 'Medium' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {stack.complexity}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="grid gap-4">
              {teamSizes.map((team, index) => (
                <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{team.size}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Duration: {team.duration}</span>
                          <span>Price: {team.price}</span>
                        </div>
                      </div>
                      <Badge variant="outline">Recommended</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeline">Project Timeline</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rush">Rush (2-4 weeks)</SelectItem>
                    <SelectItem value="standard">Standard (1-3 months)</SelectItem>
                    <SelectItem value="extended">Extended (3-6 months)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (6+ months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="milestones">Key Milestones</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select milestones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly Reviews</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly Reviews</SelectItem>
                    <SelectItem value="monthly">Monthly Reviews</SelectItem>
                    <SelectItem value="custom">Custom Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="start-date">Preferred Start Date</Label>
              <Input type="date" />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget-range">Budget Range</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup ($2K-10K)</SelectItem>
                    <SelectItem value="small">Small Business ($10K-50K)</SelectItem>
                    <SelectItem value="medium">Medium Business ($50K-200K)</SelectItem>
                    <SelectItem value="enterprise">Enterprise ($200K+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pricing-model">Pricing Model</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                    <SelectItem value="milestone">Milestone Based</SelectItem>
                    <SelectItem value="retainer">Monthly Retainer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="payment-terms">Payment Terms</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upfront">100% Upfront</SelectItem>
                  <SelectItem value="milestone">50% Upfront, 50% on Completion</SelectItem>
                  <SelectItem value="monthly">Monthly Payments</SelectItem>
                  <SelectItem value="net30">Net 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-description">Project Description</Label>
              <Textarea 
                placeholder="Describe your project requirements in detail..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target-audience">Target Audience</Label>
                <Input placeholder="e.g., B2B professionals, consumers, etc." />
              </div>
              <div>
                <Label htmlFor="key-features">Key Features Required</Label>
                <Input placeholder="e.g., user authentication, payment processing" />
              </div>
            </div>
            <div>
              <Label htmlFor="additional-notes">Additional Notes</Label>
              <Textarea 
                placeholder="Any specific requirements, constraints, or preferences..."
                rows={3}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Configure this step based on your requirements</p>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Developer Agency Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Service Request</TabsTrigger>
            <TabsTrigger value="portfolio">Our Portfolio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="space-y-6">
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
                  Preview Quote
                </Button>
                <Button 
                  onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
                  disabled={currentStep === 6}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "E-commerce Platform", tech: "React, Node.js, MongoDB", category: "E-commerce", status: "Completed" },
                { title: "Mobile Banking App", tech: "React Native, Python, PostgreSQL", category: "Fintech", status: "Completed" },
                { title: "Healthcare Dashboard", tech: "Vue.js, Laravel, MySQL", category: "Healthcare", status: "In Progress" },
                { title: "Real Estate Platform", tech: "Next.js, Node.js, MongoDB", category: "Real Estate", status: "Completed" },
                { title: "Learning Management System", tech: "Angular, Java, PostgreSQL", category: "Education", status: "Completed" },
                { title: "IoT Dashboard", tech: "React, Python, InfluxDB", category: "IoT", status: "In Development" }
              ].map((project, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">{project.tech}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">{project.category}</Badge>
                        <Badge 
                          variant={project.status === 'Completed' ? 'default' : project.status === 'In Progress' ? 'secondary' : 'destructive'}
                        >
                          {project.status}
                        </Badge>
                      </div>
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
