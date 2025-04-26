"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Badge } from "./badge";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Ticket,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Booking {
  _id: string;
  seatMap: {
    layoutConfig: {
      top: { rows: number; seatsPerRow: number };
      bottom: { rows: number; seatsPerRow: number };
      left: { rows: number; seatsPerRow: number };
      right: { rows: number; seatsPerRow: number };
    };
    _id: string;
    name: string;
  };
  seats: Array<{
    _id: string;
    section: string;
    row: number;
    number: number;
    label: string;
    price: number;
  }>;
  user: {
    name: string;
    email: string;
  };
  totalAmount: number;
  bookedAt: string;
  status: string;
}

interface BookingCardProps {
  booking: Booking;
  onCancel?: () => void;
}

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const handleCancelBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to cancel booking");
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/booking/cancel-booking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({
            bookingId: booking._id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      toast.success("Booking cancelled successfully");
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      toast.error("Failed to cancel booking");
      console.error("Error cancelling booking:", error);
    }
  };

  return (
    <Card className="w-full overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold mb-2">
              {booking.seatMap.name}
            </CardTitle>
            <CardDescription className="text-blue-100">
              Booking ID: {booking._id}
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="bg-white/10 text-white border-0"
          >
            {format(new Date(booking.bookedAt), "MMM dd, yyyy")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Details */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Booked By</p>
                <p className="font-medium text-gray-900">{booking.user.name}</p>
                <p className="text-sm text-gray-500">{booking.user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Booking Date</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(booking.bookedAt), "MMMM dd, yyyy")}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(booking.bookedAt), "hh:mm a")}
                </p>
              </div>
            </div>
          </div>

          {/* Seat Details */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Ticket className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Selected Seats</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {booking.seats.map((seat) => (
                    <Badge
                      key={seat._id}
                      variant="outline"
                      className="bg-white border-blue-100 text-gray-700"
                    >
                      {seat.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Venue</p>
                <p className="font-medium text-gray-900">
                  {booking.seatMap.name}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.seats.length} seats booked
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                Total Amount
              </span>
              <Badge
                variant="outline"
                className="bg-blue-50 border-blue-100 text-blue-600"
              >
                Paid
              </Badge>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              ${booking.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div
              className={`w-2 h-2 rounded-full ${
                booking.status === "cancelled" ? "bg-red-500" : "bg-green-500"
              }`}
            ></div>
            <span>
              {booking.status === "cancelled"
                ? "Booking cancelled"
                : "Booking confirmed"}
            </span>
          </div>
          {booking.status !== "cancelled" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Cancel Booking
                  <X className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to cancel this booking?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will cancel your booking
                    for {booking.seatMap.name}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelBooking}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, cancel booking
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
