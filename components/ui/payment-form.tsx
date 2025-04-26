"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Input } from "./input";
import { Button } from "./button";
import { Label } from "./label";
import { toast } from "sonner";

interface PaymentFormProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === "cardNumber") {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, "");

      // Validate length
      if (digitsOnly.length > 16) {
        setErrors((prev) => ({
          ...prev,
          cardNumber: "Card number must be exactly 16 digits",
        }));
        return;
      }

      // Format with spaces
      formattedValue = digitsOnly
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19);

      // Clear error if valid
      if (digitsOnly.length === 16) {
        setErrors((prev) => ({ ...prev, cardNumber: "" }));
      }
    }

    // Format expiry date
    if (name === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .slice(0, 5);

      // Validate expiry date if it's complete (MM/YY format)
      if (formattedValue.length === 5) {
        const [month, year] = formattedValue.split("/");
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits of year
        const currentMonth = currentDate.getMonth() + 1; // Months are 0-based

        const expiryYear = parseInt(year);
        const expiryMonth = parseInt(month);

        if (
          expiryYear < currentYear ||
          (expiryYear === currentYear && expiryMonth < currentMonth)
        ) {
          setErrors((prev) => ({ ...prev, expiryDate: "Card has expired" }));
        } else {
          setErrors((prev) => ({ ...prev, expiryDate: "" }));
        }
      } else {
        setErrors((prev) => ({ ...prev, expiryDate: "" }));
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate card number length
    const cardNumberDigits = formData.cardNumber.replace(/\D/g, "");
    if (cardNumberDigits.length !== 16) {
      setErrors((prev) => ({
        ...prev,
        cardNumber: "Card number must be exactly 16 digits",
      }));
      toast.error("Please enter a valid 16-digit card number");
      return;
    }

    // Validate expiry date
    if (formData.expiryDate.length === 5) {
      const [month, year] = formData.expiryDate.split("/");
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      const expiryYear = parseInt(year);
      const expiryMonth = parseInt(month);

      if (
        expiryYear < currentYear ||
        (expiryYear === currentYear && expiryMonth < currentMonth)
      ) {
        setErrors((prev) => ({ ...prev, expiryDate: "Card has expired" }));
        toast.error("Please enter a valid expiry date");
        return;
      }
    }

    setLoading(true);

    try {
      // Get selected seats from localStorage
      const selectedSeats = JSON.parse(
        localStorage.getItem("selectedSeats") || "[]"
      );
      const eventId = localStorage.getItem("eventId");
      const token = localStorage.getItem("token");
      if (!selectedSeats.length || !eventId) {
        throw new Error("No seats selected or event ID missing");
      }

      // Book seats
      const bookingResponse = await fetch(
        "http://localhost:8080/api/booking/book-seats",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token || "",
          },
          body: JSON.stringify({
            eventId,
            seatIds: selectedSeats,
          }),
        }
      );

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingData.error || "Booking failed");
      }

      toast.success("Payment and booking processed successfully!");
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Enter your credit card information to complete the payment
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleInputChange}
              maxLength={19}
              required
              aria-invalid={!!errors.cardNumber}
            />
            {errors.cardNumber && (
              <p className="text-sm text-red-500">{errors.cardNumber}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              name="cardName"
              placeholder="John Doe"
              value={formData.cardName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleInputChange}
                maxLength={5}
                required
                aria-invalid={!!errors.expiryDate}
              />
              {errors.expiryDate && (
                <p className="text-sm text-red-500">{errors.expiryDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                name="cvv"
                placeholder="123"
                value={formData.cvv}
                onChange={handleInputChange}
                maxLength={3}
                required
              />
            </div>
          </div>
          <div className="pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount:</span>
              <span>${amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
