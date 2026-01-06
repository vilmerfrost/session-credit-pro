import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // The webhook handles the actual verification and credit addition
    // This page just shows confirmation
    if (sessionId) {
      setVerified(true);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            {verified ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {verified ? "Payment Successful!" : "Processing..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {verified
              ? "Your credits have been added to your account. Thank you for your purchase!"
              : "Please wait while we confirm your payment..."}
          </p>
          <Button asChild className="w-full">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
