import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface BookingSummaryProps {
  style: any
  date: Date | null
  customer?: any
}

export function BookingSummary({ style, date, customer }: BookingSummaryProps) {
  if (!style) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-md">
            <img src={style.image || "/placeholder.svg"} alt={style.name} className="h-full w-full object-cover" />
          </div>
          <div>
            <h3 className="font-medium">{style.name}</h3>
            <p className="text-sm text-muted-foreground">{style.duration}</p>
          </div>
        </div>

        {date && (
          <div className="space-y-1">
            <h3 className="font-medium">Appointment Time</h3>
            <p className="text-sm">
              {format(date, "EEEE, MMMM d, yyyy")} at {format(date, "h:mm a")}
            </p>
          </div>
        )}

        {customer && (
          <div className="space-y-1">
            <h3 className="font-medium">Customer Details</h3>
            <p className="text-sm">
              {customer.firstName} {customer.lastName}
            </p>
            <p className="text-sm">{customer.email}</p>
            <p className="text-sm">{customer.phone}</p>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="font-medium">Total</span>
            <span className="font-bold text-4xl text-primary">£{style.price}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Payment via PayPal</p>
        </div>
      </CardContent>
    </Card>
  )
}
