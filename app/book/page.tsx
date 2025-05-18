"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingCalendar } from "@/components/booking-calendar"
import { BookingForm } from "@/components/booking-form"
import { PaymentForm } from "@/components/payment-form"
import { BookingSummary } from "@/components/booking-summary"
import { getHairstyles, getHairstyleById } from "@/app/actions/hairstyles"
import { createAppointment } from "@/app/actions/appointments"
import { createCustomer, getCustomerByEmail } from "@/app/actions/customers"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function BookingPage() {
  const searchParams = useSearchParams()
  const styleId = searchParams.get("style")
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("style")
  const [selectedStyle, setSelectedStyle] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [customerInfo, setCustomerInfo] = useState<any>(null)
  const [hairstyles, setHairstyles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const styles = await getHairstyles()
        setHairstyles(styles)

        if (styleId) {
          const style = await getHairstyleById(styleId)
          setSelectedStyle(style)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load hairstyles. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [styleId, toast])

  const handleStyleSelect = (style: any) => {
    setSelectedStyle(style)
    setActiveTab("date")
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setActiveTab("info")
  }

  const handleInfoSubmit = async (info: any) => {
    setCustomerInfo(info)
    setActiveTab("payment")

    // We no longer force account creation here - it's optional in the BookingForm
  }

  const handlePaymentSuccess = async (paymentDetails: any) => {
    try {
      // First, create or get the customer
      let customer = await getCustomerByEmail(customerInfo.email)

      if (!customer) {
        customer = await createCustomer({
          email: customerInfo.email,
          first_name: customerInfo.firstName,
          last_name: customerInfo.lastName,
          phone: customerInfo.phone,
        })
      }

      // Then create the appointment
      const appointment = await createAppointment({
        customer_id: customer.id,
        hairstyle_id: selectedStyle.id,
        appointment_date: selectedDate?.toISOString(),
        payment_id: paymentDetails.id,
        payment_status: paymentDetails.status,
        payment_amount: selectedStyle.price,
        hairstyle_name: selectedStyle.name,
        duration: selectedStyle.duration,
        customer: {
          email: customerInfo.email,
          first_name: customerInfo.firstName,
          last_name: customerInfo.lastName,
          phone: customerInfo.phone,
        },
        // Flag to indicate if this is a guest booking
        is_guest_booking: !customerInfo.createAccount,
      })

      // Redirect to confirmation page
      router.push(`/booking-confirmation?id=${appointment.id}`)
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav />
          {/* <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
          </nav> */}
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Book Your Appointment</h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Select your preferred hairstyle, date, and time to book your appointment.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl py-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="date" disabled={!selectedStyle}>
                    Date
                  </TabsTrigger>
                  <TabsTrigger value="info" disabled={!selectedDate}>
                    Info
                  </TabsTrigger>
                  <TabsTrigger value="payment" disabled={!customerInfo}>
                    Payment
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="style" className="mt-6">
                  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {hairstyles.map((style) => (
                      <Card
                        key={style.id}
                        className={`overflow-hidden cursor-pointer transition-all ${
                          selectedStyle?.id === style.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => handleStyleSelect(style)}
                      >
                        <CardHeader className="p-0">
                          <img
                            src={style.image_urls && style.image_urls.length > 0 ? style.image_urls[0] : "/placeholder.svg"}
                            alt={style.name}
                            width={300}
                            height={200}
                            className="object-cover w-full h-48"
                          />
                        </CardHeader>
                        <CardContent className="p-6">
                          <CardTitle className="text-xl">{style.name}</CardTitle>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-medium">£{style.price}</span>
                            <span className="text-sm text-muted-foreground">{style.duration} min</span>
                          </div>
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-muted">
                              {style.category}
                            </span>
                          </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-0">
                          <Button className="w-full" onClick={() => handleStyleSelect(style)}>
                            Select This Style
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="date" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Date & Time</CardTitle>
                      <CardDescription>
                        Choose an available slot for your {selectedStyle?.name} appointment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BookingCalendar onDateTimeSelect={handleDateSelect} hairstyleId={selectedStyle?.id} />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab("style")}>
                        Back
                      </Button>
                      <Button onClick={() => setActiveTab("info")} disabled={!selectedDate}>
                        Continue
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="info" className="mt-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Information</CardTitle>
                        <CardDescription>Please provide your contact details</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <BookingForm onSubmit={handleInfoSubmit} />
                      </CardContent>
                    </Card>
                    <BookingSummary style={selectedStyle} date={selectedDate} />
                  </div>
                </TabsContent>
                <TabsContent value="payment" className="mt-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment</CardTitle>
                        <CardDescription>Secure payment via PayPal</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PaymentForm amount={selectedStyle?.price} onSuccess={handlePaymentSuccess} />
                      </CardContent>
                    </Card>
                    <BookingSummary style={selectedStyle} date={selectedDate} customer={customerInfo} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
