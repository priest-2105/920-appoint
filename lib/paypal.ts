// PayPal client configuration
export const getPaypalOptions = () => {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  if (!clientId) {
    throw new Error("Missing PayPal client ID")
  }

  return {
    "client-id": clientId,
    currency: "GBP",
    intent: "capture",
  }
}

