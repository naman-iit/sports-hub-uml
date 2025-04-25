"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import { CheckCircle2 } from "lucide-react"

interface PaymentSuccessProps {
  amount: number
  onClose?: () => void
}

export function PaymentSuccess({ amount, onClose }: PaymentSuccessProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-center">Payment Successful!</CardTitle>
        <CardDescription className="text-center">
          Your payment has been processed successfully
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Amount Paid</p>
          <p className="text-2xl font-bold">${amount.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={onClose}
        >
          Close
        </Button>
      </CardFooter>
    </Card>
  )
} 