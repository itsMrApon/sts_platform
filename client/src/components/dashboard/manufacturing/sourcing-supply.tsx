import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign,
  Package,
  Truck,
  CheckCircle
} from "lucide-react";

export function SourcingSupply() {
  const suppliers = [
    {
      id: 1,
      name: "Premium Textiles Ltd",
      location: "Bangladesh",
      rating: 4.8,
      specialties: ["Cotton", "Denim", "Knit"],
      leadTime: "15-20 days",
      minOrder: "1000 pieces",
      status: "verified"
    },
    {
      id: 2,
      name: "Nordic Fabrics AB",
      location: "Sweden",
      rating: 4.9,
      specialties: ["Sustainable", "Organic", "Wool"],
      leadTime: "10-15 days",
      minOrder: "500 pieces",
      status: "preferred"
    },
    {
      id: 3,
      name: "Metro Materials Inc",
      location: "New York",
      rating: 4.6,
      specialties: ["Premium", "Designer", "Silk"],
      leadTime: "5-10 days",
      minOrder: "200 pieces",
      status: "verified"
    }
  ];

  const materials = [
    {
      id: 1,
      name: "Organic Cotton Jersey",
      supplier: "Nordic Fabrics AB",
      price: "$8.50/yard",
      stock: "Available",
      location: "Sweden"
    },
    {
      id: 2,
      name: "Premium Denim",
      supplier: "Premium Textiles Ltd",
      price: "$12.00/yard",
      stock: "Low Stock",
      location: "Bangladesh"
    },
    {
      id: 3,
      name: "Silk Chiffon",
      supplier: "Metro Materials Inc",
      price: "$25.00/yard",
      stock: "Available",
      location: "New York"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500 hover:bg-green-500">Verified</Badge>;
      case 'preferred':
        return <Badge className="bg-blue-500 hover:bg-blue-500">Preferred</Badge>;
      case 'Available':
        return <Badge className="bg-green-500 hover:bg-green-500">Available</Badge>;
      case 'Low Stock':
        return <Badge className="bg-yellow-500 hover:bg-yellow-500">Low Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Sourcing & Supply Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="suppliers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="requests">RFQ Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="suppliers" className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Search suppliers..." />
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="bangladesh">Bangladesh</SelectItem>
                  <SelectItem value="sweden">Sweden</SelectItem>
                  <SelectItem value="nyc">New York</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </div>

            <div className="grid gap-4">
              {suppliers.map((supplier) => (
                <Card key={supplier.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{supplier.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {supplier.location}
                            <Star className="h-4 w-4 text-yellow-500" />
                            {supplier.rating}
                          </div>
                          <div className="flex gap-2 mt-1">
                            {supplier.specialties.map((specialty, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(supplier.status)}
                        <div className="text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {supplier.leadTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {supplier.minOrder}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Search materials..." />
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="denim">Denim</SelectItem>
                  <SelectItem value="silk">Silk</SelectItem>
                  <SelectItem value="wool">Wool</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </div>

            <div className="grid gap-4">
              {materials.map((material) => (
                <Card key={material.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{material.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Supplier: {material.supplier}</span>
                            <MapPin className="h-4 w-4" />
                            {material.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(material.stock)}
                        <div className="text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {material.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Request for Quotation (RFQ)</h3>
              <p className="text-muted-foreground mb-4">
                Send RFQ requests to suppliers for custom materials and pricing
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create RFQ Request
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
