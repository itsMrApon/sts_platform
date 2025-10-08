import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, Video } from "lucide-react";

export function AgencyUploadSources() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-card-foreground mb-2">
            <UploadCloud className="h-5 w-5" />
            <span>Browse or drag a pre-recorded asset</span>
          </div>
          <div className="h-24 rounded-md border border-dashed" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-card-foreground mb-2">
            <Video className="h-5 w-5" />
            <span>Connect a live source</span>
          </div>
          <div className="h-24 rounded-md border border-dashed" />
        </CardContent>
      </Card>
    </div>
  );
}


