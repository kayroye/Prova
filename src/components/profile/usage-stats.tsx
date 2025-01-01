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
  free: 100,
  premium: 1000,
};

export default function UsageStats({ role = "free", usage }: UsageStatsProps) {
  const dailyUsage = usage.find(u => u.period === "daily")?.count || 0;
  const monthlyUsage = usage.find(u => u.period === "monthly")?.count || 0;
  const limit = RATE_LIMITS[role as keyof typeof RATE_LIMITS];

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
                <span>{dailyUsage} / {limit} calls</span>
              </div>
              <Progress value={(dailyUsage / limit) * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Usage</span>
                <span>{monthlyUsage} / {limit * 30} calls</span>
              </div>
              <Progress value={(monthlyUsage / (limit * 30)) * 100} />
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h4 className="text-sm font-semibold mb-2">Usage Limits</h4>
              <ul className="text-sm space-y-1">
                <li>• Daily limit: {limit} API calls</li>
                <li>• Monthly limit: {limit * 30} API calls</li>
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