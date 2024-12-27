import { MessageSquare, TestTubes, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    title: "Chat with APIs",
    description: "Interactive conversations powered by LLM",
    icon: MessageSquare,
  },
  {
    title: "Automated Testing",
    description: "Run tests on your API endpoints seamlessly",
    icon: TestTubes,
  },
  {
    title: "Error Handling",
    description: "Receive user-friendly error messages with actionable insights",
    icon: AlertCircle,
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Features that Empower You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <feature.icon className="w-12 h-12 mb-4 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 