import { Card, CardContent } from "@/components/ui/card";

export function AgencyConversionsAndCustomers() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="font-medium mb-4">Conversions</div>
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="font-medium">John Doe</div>
                <div className="text-xs text-muted-foreground">johndoe@gmail.com</div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="px-2 py-0.5 bg-muted rounded">New</span>
                  <span className="px-2 py-0.5 bg-muted rounded">Hot Lead</span>
                  <span className="px-2 py-0.5 bg-muted rounded">Tag 2</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="font-medium mb-4">See the list of your current customers</div>
          <div className="h-40 rounded-lg border" />
        </CardContent>
      </Card>
    </div>
  );
}


