"use client"

import { useState } from "react"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { Card } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getPaypalOptions } from "@/lib/paypal"
import { useToast } from "@/hooks/use-toast"

interface PaymentFormProps {
  amount: number
  onSuccess: (paymentDetails: any) => void
}

export function PaymentForm({ amount, onSuccess }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [savePaymentMethod, setSavePaymentMethod] = useState(false)
  const { toast } = useToast()

  // Format amount for PayPal (needs to be a string with 2 decimal places)
  const formattedAmount = amount.toFixed(2)

  const handleApprove = async (data: any, actions: any) => {
    setIsProcessing(true)

    try {
      if (actions.order) {
        const orderDetails = await actions.order.capture()

        // Process the successful payment
        const paymentDetails = {
          id: orderDetails.id,
          status: orderDetails.status,
          amount: orderDetails.purchase_units[0].amount.value,
          currency: orderDetails.purchase_units[0].amount.currency_code,
          create_time: orderDetails.create_time,
          payer: orderDetails.payer,
        }

        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        })

        // Send admin notification about the payment
        try {
          // This would typically be done server-side, but for demo purposes we'll call it here
          // In a real implementation, this would be part of the server action that processes the appointment
          fetch("/api/notify-admin-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payment: paymentDetails,
              amount: amount,
            }),
          })
        } catch (error) {
          console.error("Error sending admin payment notification:", error)
          // Don't block the main flow
        }

        onSuccess(paymentDetails)
      }
    } catch (error) {
      console.error("Payment failed:", error)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <PayPalScriptProvider options={getPaypalOptions()}>
        <div className={`transition-opacity ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}>
          <PayPalButtons
            style={{ layout: "vertical", shape: "rect" }}
            disabled={isProcessing}
            forceReRender={[amount]}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: formattedAmount,
                      currency_code: "GBP",
                    },
                    description: "Hairstyle Appointment Booking",
                  },
                ],
              })
            }}
            onApprove={handleApprove}
            onError={(err) => {
              console.error("PayPal error:", err)
              toast({
                title: "Payment Error",
                description: "There was an error with PayPal. Please try again.",
                variant: "destructive",
              })
            }}
            onCancel={() => {
              toast({
                title: "Payment Cancelled",
                description: "You've cancelled the payment process.",
              })
            }}
          />
        </div>
      </PayPalScriptProvider>

      <Card className="p-4 bg-muted/30">
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="savePaymentMethod"
            checked={savePaymentMethod}
            onCheckedChange={(checked) => setSavePaymentMethod(!!checked)}
          />
          <Label htmlFor="savePaymentMethod">Save payment method for future bookings</Label>
        </div>

        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <Lock className="mr-1 h-4 w-4" />
          <span>Payments are secure and processed by PayPal</span>
        </div>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        By clicking "Pay now", you agree to our{" "}
        <a href="/terms" className="underline underline-offset-2">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
