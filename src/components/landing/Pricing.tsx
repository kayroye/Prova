"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { useState } from "react";

interface PricingFeature {
  name: string;
  free: boolean;
  pro: boolean;
}

interface PricingCategory {
  title: string;
  features: PricingFeature[];
}

const pricingCategories: PricingCategory[] = [
  {
    title: "Chat Sessions",
    features: [
      { name: "Unlimited messages per chat", free: false, pro: true },
      { name: "Unlimited active chat sessions", free: false, pro: true },
      { name: "Indefinite chat history", free: false, pro: true },
      { name: "Priority in OpenAI queue", free: false, pro: true },
      { name: "50 messages per chat session", free: true, pro: true },
      { name: "7-day chat history", free: true, pro: true },
    ],
  },
  {
    title: "API Capabilities",
    features: [
      { name: "500 API calls per day", free: false, pro: true },
      { name: "Unlimited concurrent API endpoints", free: false, pro: true },
      { name: "Advanced rate limiting controls", free: false, pro: true },
      { name: "Custom rate limit settings", free: false, pro: true },
      { name: "50 API calls per day", free: true, pro: true },
      { name: "2 concurrent API endpoints", free: true, pro: true },
      { name: "Basic rate limiting", free: true, pro: true },
    ],
  },
  {
    title: "Advanced Features",
    features: [
      { name: "Custom headers & authentication", free: false, pro: true },
      { name: "Environment variables", free: false, pro: true },
      { name: "Team collaboration", free: false, pro: true },
      { name: "API endpoint sharing", free: false, pro: true },
      { name: "Detailed API analytics", free: false, pro: true },
      { name: "Advanced error handling", free: false, pro: true },
      { name: "Full API logs history", free: false, pro: true },
      { name: "Unit test generation", free: false, pro: true },
      { name: "API documentation generation", free: false, pro: true },
      { name: "Custom AI prompts", free: false, pro: true },
      { name: "Basic API response explanations", free: true, pro: true },
      { name: "Standard error messages", free: true, pro: true },
      { name: "24-hour API logs", free: true, pro: true },
      { name: "Public API endpoints", free: true, pro: true },
    ],
  },
  {
    title: "Security & Management",
    features: [
      { name: "Private API endpoints", free: false, pro: true },
      { name: "IP whitelisting", free: false, pro: true },
      { name: "Custom security rules", free: false, pro: true },
      { name: "Role-based access control", free: false, pro: true },
      { name: "Audit logs", free: false, pro: true },
    ],
  },
  {
    title: "Support",
    features: [
      { name: "Priority support", free: false, pro: true },
      { name: "Custom onboarding", free: false, pro: true },
      { name: "API integration consulting", free: false, pro: true },
      { name: "Community support", free: true, pro: true },
    ],
  },
];

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const monthlyPrice = 15;
  const annualPrice = 150;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center space-y-8">
          <div className="text-center space-y-4 max-w-3xl">
            <h2 className="text-4xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that best fits your needs
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Label htmlFor="annual-pricing">Monthly</Label>
              <Switch
                id="annual-pricing"
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
              />
              <Label htmlFor="annual-pricing">Annual (Save 17%)</Label>
            </div>
          </div>

          <div className="w-full max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$0</div>
                  <p className="text-muted-foreground">Forever free</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    Get Started
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro Plan */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${isAnnual ? annualPrice / 12 : monthlyPrice}
                    <span className="text-lg font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {isAnnual
                      ? `Billed annually ($${annualPrice}/year)`
                      : "Billed monthly"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Upgrade Now</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-16 space-y-8">
              {/* Table Header - Only visible on larger screens */}
              <div className="hidden md:grid md:grid-cols-3 text-sm font-medium text-muted-foreground mb-4">
                <div className="col-span-1">Feature</div>
                <div className="col-span-1 text-center">Free</div>
                <div className="col-span-1 text-center">Pro</div>
              </div>

              {pricingCategories.map((category) => (
                <div key={category.title}>
                  <h3 className="text-lg font-semibold mb-4">{category.title}</h3>
                  <div className="border rounded-lg divide-y">
                    {category.features.map((feature) => (
                      <div
                        key={feature.name}
                        className="grid grid-cols-2 md:grid-cols-3 p-4 gap-4 items-center"
                      >
                        <div className="col-span-2 md:col-span-1">{feature.name}</div>
                        <div className="text-center">
                          <span className="md:hidden text-sm text-muted-foreground mr-2">Free:</span>
                          {feature.free ? (
                            <Check className="inline h-5 w-5 text-primary" />
                          ) : (
                            <X className="inline h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="text-center">
                          <span className="md:hidden text-sm text-muted-foreground mr-2">Pro:</span>
                          {feature.pro ? (
                            <Check className="inline h-5 w-5 text-primary" />
                          ) : (
                            <X className="inline h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 