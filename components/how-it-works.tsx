import { CalendarDays, CreditCard, Scissors, CheckCircle } from "lucide-react"

export function HowItWorks() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Book your appointment in just a few simple steps.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Scissors className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Choose a Style</h3>
            <p className="text-muted-foreground">Browse our collection of hairstyles and select your favorite.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CalendarDays className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Pick a Date</h3>
            <p className="text-muted-foreground">Select an available date and time that works for you.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CreditCard className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Make Payment</h3>
            <p className="text-muted-foreground">Secure your appointment with a quick and easy payment.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Get Confirmation</h3>
            <p className="text-muted-foreground">Receive a confirmation email with all your appointment details.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

