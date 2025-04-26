"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter, useSearchParams } from "next/navigation";

interface SeatConfig {
  rows: number;
  seatsPerRow: number;
}

interface StadiumConfig {
  top: SeatConfig;
  bottom: SeatConfig;
  left: SeatConfig;
  right: SeatConfig;
}

interface Seat {
  _id: string;
  number: string;
  available: boolean;
  label: string;
  section: string;
  row: number;
  price: number;
}

interface MockSeat {
  _id: string;
  seatMap: string;
  section: string;
  row: number;
  number: number;
  label: string;
  isAvailable: boolean;
  price: number;
}

interface MockSeatMap {
  _id: string;
  name: string;
  layoutConfig: StadiumConfig;
}

interface MockData {
  seatMap: MockSeatMap;
  seats: MockSeat[];
}

type SeatData = {
  [K in keyof StadiumConfig]: Seat[][];
} & {
  seats: MockSeat[];
};

const SeatSelectionUI = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [seatData, setSeatData] = useState<SeatData | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventId = params.get("eventId") as string;
  useEffect(() => {
    const fetchSeatMap = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8080/api/stadiums/seat-map/${eventId}`,
          {
            headers: {
              "x-access-token": token || "",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch seat map");
        }
        const data: MockData = await response.json();

        // Transform the API response into our seat data structure
        const transformedData: Partial<SeatData> = {};
        const config = data.seatMap.layoutConfig;

        // Initialize empty arrays for each section
        Object.entries(config).forEach(([side, { rows, seatsPerRow }]) => {
          const sideKey = side as keyof StadiumConfig;
          transformedData[sideKey] = Array.from({ length: rows }, () =>
            Array.from({ length: seatsPerRow }, () => ({
              _id: "",
              number: "",
              available: false,
              label: "",
              section: "",
              row: 0,
              price: 0,
            }))
          );
        });

        // Populate with actual seat data
        data.seats.forEach((seat) => {
          const section = seat.section as keyof StadiumConfig;
          if (
            transformedData[section] &&
            transformedData[section]![seat.row - 1]
          ) {
            transformedData[section]![seat.row - 1][seat.number - 1] = {
              _id: seat._id,
              number: seat.label,
              available: seat.isAvailable,
              label: seat.label,
              section: seat.section,
              row: seat.row,
              price: seat.price,
            };
          }
        });

        // Add the seats array to the transformed data
        const finalData: SeatData = {
          ...(transformedData as SeatData),
          seats: data.seats,
        };

        setSeatData(finalData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };
    if (!eventId) {
      router.push(`/dashboard`);
    }
    fetchSeatMap();
  }, [eventId]);

  const toggleSeat = (seat: Seat) => {
    if (!seat.available) return;
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      next.has(seat._id) ? next.delete(seat._id) : next.add(seat._id);
      return next;
    });
  };

  // Render seats for one section
  const renderSection = (side: keyof StadiumConfig) => {
    if (!seatData) return null;

    return (
      <div className="flex flex-col gap-1">
        {seatData[side].map((rowSeats, r) => (
          <div key={`${side}-row-${r + 1}`} className="flex gap-1">
            {rowSeats.map((seat, seatIndex) => {
              const isSelected = selectedSeats.has(seat._id);
              const baseColor = !seat.available
                ? "bg-red-300 cursor-not-allowed"
                : isSelected
                ? "bg-blue-600 text-white"
                : "bg-gray-300 hover:bg-gray-400 cursor-pointer";

              return (
                <button
                  suppressHydrationWarning
                  key={`${side}-row-${r + 1}-seat-${seatIndex + 1}`}
                  onClick={() => toggleSeat(seat)}
                  disabled={!seat.available}
                  className={`w-9 h-9 rounded flex items-center justify-center text-xs font-semibold text-black ${baseColor} transition`}
                  title={`Seat ${seat.label} (${
                    seat.available ? "Available" : "Sold"
                  }) - $${seat.price}`}
                >
                  {seat.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-semibold">Loading seat map...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Error: {error}</h1>
      </div>
    );
  }

  if (!seatData) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-semibold">No seat data available</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Stadium Seat Selection
        </h1>
        <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Select your seats from the available sections. Click on available
          seats to select them.
        </p>
      </div>

      {/* Stadium Layout */}
      <div className="relative mx-auto bg-gray-100 p-8 max-w-4xl aspect-square rounded-xl shadow-lg overflow-visible mb-16">
        {/* Gates */}
        {/* North Gate */}
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-t-lg shadow-md flex items-center gap-2">
              <ArrowUp className="w-4 h-4" />
              <span className="font-semibold">NORTH GATE</span>
            </div>
            <div className="h-4 w-px bg-blue-600"></div>
          </div>
        </div>

        {/* South Gate */}
        <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center">
            <div className="h-4 w-px bg-blue-600"></div>
            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-b-lg shadow-md flex items-center gap-2">
              <ArrowDown className="w-4 h-4" />
              <span className="font-semibold">SOUTH GATE</span>
            </div>
          </div>
        </div>

        {/* West Gate */}
        <div className="absolute -left-30 top-1/2 transform -translate-y-1/2">
          <div className="flex flex-row items-center gap-0">
            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-md flex items-center gap-2 rotate-270">
              <ArrowLeft className="w-4 h-4 -rotate-270" />
              <span className="font-semibold">WEST GATE</span>
            </div>
          </div>
        </div>

        {/* East Gate */}
        <div className="absolute -right-30 top-1/2 transform -translate-y-1/2">
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-md flex items-center gap-2 rotate-90">
              <ArrowRight className="w-4 h-4 -rotate-90" />
              <span className="font-semibold">EAST GATE</span>
            </div>
          </div>
        </div>

        {/* Center field */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/3 h-1/4 bg-green-500 rounded-lg border-4 border-white shadow-inner flex items-center justify-center">
            <span className="text-white text-lg font-bold uppercase">
              Play Field
            </span>
          </div>
        </div>

        {/* Seats sections */}
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
          {renderSection("top")}
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          {renderSection("bottom")}
        </div>
        <div className="absolute left-10 top-1/2 transform -translate-y-1/2">
          {renderSection("left")}
        </div>
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          {renderSection("right")}
        </div>

        {/* Entry point indicators */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-blue-600"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-blue-600"></div>
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-16 w-1 bg-blue-600"></div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-16 w-1 bg-blue-600"></div>
      </div>

      {/* Selected Seats Summary */}
      <div className="mt-16 max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Selected Seats
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-300"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600"></div>
              <span className="text-sm text-gray-600">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-300"></div>
              <span className="text-sm text-gray-600">Unavailable</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from(selectedSeats).map((seatId) => {
            // Find the seat details from the mock data
            const seat = seatData.seats.find((s) => s._id === seatId);
            if (!seat) return null;

            return (
              <div
                key={seatId}
                className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {seat.section.toUpperCase()} Gate • Row {seat.row} • Seat{" "}
                {seat.number} • ${seat.price}
              </div>
            );
          })}
          {selectedSeats.size === 0 && (
            <p className="text-gray-500 text-sm">No seats selected yet</p>
          )}
        </div>

        {selectedSeats.size > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-lg font-semibold">
              Total: $
              {Array.from(selectedSeats).reduce((total, seatId) => {
                const seat = seatData.seats.find((s) => s._id === seatId);
                return total + (seat?.price || 0);
              }, 0)}
            </div>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                const totalAmount = Array.from(selectedSeats).reduce(
                  (total, seatId) => {
                    const seat = seatData.seats.find((s) => s._id === seatId);
                    return total + (seat?.price || 0);
                  },
                  0
                );
                // Save amount to local storage
                localStorage.setItem("paymentAmount", totalAmount.toString());
                // save selected seat ids as an array in local storage
                localStorage.setItem(
                  "selectedSeats",
                  JSON.stringify(Array.from(selectedSeats))
                );
                // save event id to local storage
                localStorage.setItem("eventId", eventId);
                router.push("/payment");
              }}
            >
              Continue to Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelectionUI;
