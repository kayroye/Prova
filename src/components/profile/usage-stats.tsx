"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UsageStatsProps {
  role?: string;
  usage: Array<{
    period: string;
    count: number;
  }>;
}

const RATE_LIMITS = {
  free: 15,
  premium: 300,
};

export default function UsageStats({ role = "free", usage }: UsageStatsProps) {
  const dailyUsage = usage.find(u => u.period === "daily")?.count || 0;
  const monthlyUsage = usage.find(u => u.period === "monthly")?.count || 0;
  const freeLimit = RATE_LIMITS.free;
  const premiumLimit = RATE_LIMITS.premium;


  const handleUpgrade = async () => {
    // TODO: Implement upgrade functionality
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Your current plan and subscription status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                {role === "premium" ? "Premium Plan" : "Free Plan"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {role === "premium" 
                  ? "You have access to all premium features" 
                  : "Upgrade to premium for unlimited API calls"}
              </p>
            </div>

            {role !== "premium" && (
              <Button onClick={handleUpgrade}>
                Upgrade to Premium
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription>
            Monitor your API usage and limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Usage</span>
                <span>{dailyUsage} / {freeLimit} calls</span>
              </div>
              <Progress value={(dailyUsage / freeLimit) * 100} />
            </div>


            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Usage</span>
                <span>{monthlyUsage} / {premiumLimit} calls</span>
              </div>
              <Progress value={(monthlyUsage / premiumLimit) * 100} />
            </div>



            <div className="rounded-lg bg-muted p-4">
              <h4 className="text-sm font-semibold mb-2">Usage Limits</h4>
              <ul className="text-sm space-y-1">
                <li>• Daily limit: {freeLimit} API calls</li>
                <li>• Monthly limit: {premiumLimit} API calls</li>

                {role !== "premium" && (
                  <li className="text-muted-foreground">
                    • Upgrade to Premium for increased limits
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 