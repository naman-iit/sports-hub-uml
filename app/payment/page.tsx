"use client";

import { useState, useEffect } from "react";
import { PaymentForm } from "@/components/ui/payment-form";
import { PaymentSuccess } from "@/components/ui/payment-success";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function PaymentPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const selectedSeats = JSON.parse(
    localStorage.getItem("selectedSeats") || "[]"
  );
  const eventId = localStorage.getItem("eventId");
  // Get amount from local storage
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    const storedAmount = localStorage.getItem("paymentAmount");
    if (storedAmount) {
      setAmount(parseFloat(storedAmount));
      // Show loader for 3 seconds
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      toast.error("No payment amount found");
      router.push("/dashboard");
    }
  }, [router]);

  // Redirect if no amount is provided
  useEffect(() => {
    if (!amount) {
      return; // Will redirect in useEffect above
    }
  }, [amount]);

  const handlePaymentSuccess = () => {
    setShowSuccess(true);
  };

  const handlePaymentError = (error: string) => {
    // Error is already shown via toast in the PaymentForm component
    console.error("Payment error:", error);
  };

  const handleClose = () => {
    // Redirect to dashboard or home page
    router.push("/dashboard");
  };

  if (!amount) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">
              Loading Payment Details...
            </h2>
            <p className="text-gray-500 mt-2">
              Please wait while we prepare your payment
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Complete Your Payment
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              Review your order details before payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="text-xl font-bold">${amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {showSuccess ? (
          <PaymentSuccess amount={amount} onClose={handleClose} />
        ) : (
          <PaymentForm
            amount={amount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}
      </div>
    </div>
  );
}
