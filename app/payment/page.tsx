"use client"

import { useState, useEffect } from "react"
import { PaymentForm } from "@/components/ui/payment-form"
import { PaymentSuccess } from "@/components/ui/payment-success"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function PaymentPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get amount from URL parameters
  const amount = searchParams.get("amount") ? parseFloat(searchParams.get("amount")!) : 0

  // Redirect if no amount is provided
  useEffect(() => {
    if (!amount) {
      toast.error("No payment amount provided")
      router.push("/dashboard")
    }
  }, [amount, router])

  const handlePaymentSuccess = () => {
    setShowSuccess(true)
  }

  const handlePaymentError = (error: string) => {
    // Error is already shown via toast in the PaymentForm component
    console.error("Payment error:", error)
  }

  const handleClose = () => {
    // Redirect to dashboard or home page
    router.push("/dashboard")
  }

  if (!amount) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Payment</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review your order details before payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="text-xl font-bold">${amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        {showSuccess ? (
          <PaymentSuccess
            amount={amount}
            onClose={handleClose}
          />
        ) : (
          <PaymentForm
            amount={amount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}
      </div>
    </div>
  )
} 