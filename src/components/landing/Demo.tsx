import { Card } from "@/components/ui/card"

export function Demo() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
          See It in Action
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Experience the simplicity of API interactions through natural conversations
        </p>
        <Card className="overflow-hidden border-2 shadow-lg">
          <div className="relative aspect-video">
            {/* Placeholder for the demo animation/image */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Demo animation coming soon</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
} 