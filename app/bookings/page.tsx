"use client";

import { useEffect, useState } from "react";
import { BookingCard } from "@/components/ui/booking-card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Ticket, DollarSign, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:8080/api/booking", {
        headers: {
          "x-access-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data);
    } catch (error) {
      toast.error("Failed to load bookings");
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [router]);

  const handleBookingCancel = () => {
    fetchBookings(); // Refresh the bookings list after cancellation
  };

  // Calculate summary statistics
  const totalBookings = bookings.length;
  const totalSeats = bookings.reduce(
    (sum, booking) => sum + booking.seats.length,
    0
  );
  const totalSpent = bookings.reduce(
    (sum, booking) => sum + booking.totalAmount,
    0
  );

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4">
        {/* Header Section */}
        <div className="mb-12">
          <Button
            variant="ghost"
            className="mb-6 text-gray-600 hover:text-gray-900"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              My Bookings
            </h1>
            <p className="text-gray-600 text-lg">
              View and manage your event bookings
            </p>
          </div>
        </div>

        {/* Bookings List */}
        <div className="max-w-4xl mx-auto">
          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500 text-lg">No bookings found</p>
              <p className="text-gray-400 mt-2">
                Start by booking your first event!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onCancel={handleBookingCancel}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
