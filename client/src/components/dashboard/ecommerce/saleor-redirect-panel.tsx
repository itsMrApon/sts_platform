import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingBag } from "lucide-react";

export function SaleorRedirectPanel() {
  const handleRedirectToSaleor = () => {
    // Redirect to Saleor dashboard/orders page
    // You can customize this URL based on your Saleor setup
    window.open("http://localhost:8000/dashboard/orders", "_blank");
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Manage Orders in Saleor</h3>
              <p className="text-sm text-muted-foreground">
                Access your full order management system with advanced features
              </p>
            </div>
          </div>
          <Button 
            onClick={handleRedirectToSaleor}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Saleor Orders
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
