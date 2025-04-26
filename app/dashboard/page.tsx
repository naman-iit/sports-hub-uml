"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Event } from "./models/Event";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  MapPinIcon,
  TicketIcon,
  SparklesIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EventsData {
  nba: Event[];
  mlb: Event[];
  nfl: Event[];
}

interface EventSummary {
  title: string;
  summary: string;
  keyPlayers: string[];
  interestingFacts: string[];
}

function EventCard({ event }: { event: Event }) {
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [summary, setSummary] = useState<EventSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventDate = new Date(event.dates.start.localDate);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = event.dates.start.localTime
    ? new Date(`2000-01-01T${event.dates.start.localTime}`).toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      )
    : null;

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8080/api/openai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeTeam: event.name.split(" vs ")[0],
          awayTeam: event.name.split(" vs ")[1],
          date: event.dates.start.localDate,
          venue: event._embedded?.venues?.[0]?.name,
          sportType: event.name.includes("NBA")
            ? "NBA"
            : event.name.includes("MLB")
            ? "MLB"
            : "NFL",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setSummary(data);
      setShowSummaryDialog(true);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate summary"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-lg border-2 hover:border-primary/50">
        <div className="relative h-48 w-full">
          <Image
            src={event.images[0]?.url || "/placeholder-event.jpg"}
            alt={event.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <Badge className="absolute top-3 right-3 bg-primary/90 hover:bg-primary text-white font-medium">
            {event.priceRanges?.[0]
              ? `From $${event.priceRanges[0].min}`
              : "Tickets Available"}
          </Badge>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold line-clamp-2">
            {event.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CalendarIcon className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="text-sm font-medium">{formattedDate}</p>
                {formattedTime && (
                  <p className="text-xs text-muted-foreground">
                    {formattedTime}
                  </p>
                )}
              </div>
            </div>

            {event._embedded?.venues?.[0] && (
              <div className="flex items-start gap-2">
                <MapPinIcon className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {event._embedded.venues[0].name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event._embedded.venues[0].city.name}
                    {event._embedded.venues[0].state?.name &&
                      `, ${event._embedded.venues[0].state.name}`}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm border border-destructive/20">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
            onClick={() => fetchSummary()}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2Icon className="h-4 w-4 mr-1 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4 mr-1" />
                Quick Summary
              </>
            )}
          </Button>
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              variant="default"
            >
              <TicketIcon className="h-4 w-4 mr-1" />
              Get Tickets
            </Button>
          </a>
        </CardFooter>
      </Card>

      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <SparklesIcon className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold">
                {event.name}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
              {formattedTime && (
                <>
                  <span>•</span>
                  <span>{formattedTime}</span>
                </>
              )}
              {event._embedded?.venues?.[0] && (
                <>
                  <span>•</span>
                  <MapPinIcon className="h-3.5 w-3.5" />
                  <span>{event._embedded.venues[0].name}</span>
                </>
              )}
            </div>
          </DialogHeader>

          {summary && (
            <div className="space-y-6 py-4">
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-muted/50">
                <h3 className="text-lg font-semibold text-primary">
                  {summary.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {summary.summary}
                </p>
              </div>

              {summary.keyPlayers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    Key Players
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.keyPlayers.map((player, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1"
                      >
                        {player}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {summary.interestingFacts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    Interesting Facts
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {summary.interestingFacts.map((fact, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 p-2 bg-muted/20 rounded-md"
                      >
                        <span className="text-primary mt-1">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSummaryDialog(false)}
              className="border-primary/20 hover:bg-primary/5 hover:text-primary"
            >
              Close
            </Button>
            <a href={event.url} target="_blank" rel="noopener noreferrer">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <TicketIcon className="h-4 w-4 mr-1" />
                Get Tickets
              </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-0">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

function EventsGrid({ events }: { events: Event[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9; // 3x3 grid

  // Filter out past events
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.dates.start.localDate);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= currentDate;
  });

  // Calculate pagination
  const totalPages = Math.ceil(upcomingEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const paginatedEvents = upcomingEvents.slice(startIndex, startIndex + eventsPerPage);

  if (upcomingEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <TicketIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No upcoming events found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Check back later for new events
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [eventsData, setEventsData] = useState<EventsData>({
    nba: [],
    mlb: [],
    nfl: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('nba');

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:8080/api/events", {
          headers: {
            "x-access-token": token || "",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received events data:', data);
        
        // Validate the data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format received');
        }

        // Ensure each sport has an array, even if empty
        const formattedData = {
          nba: Array.isArray(data.nba) ? data.nba : [],
          mlb: Array.isArray(data.mlb) ? data.mlb : [],
          nfl: Array.isArray(data.nfl) ? data.nfl : []
        };
        console.log('Formatted events data:', formattedData);
        setEventsData(formattedData);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch events"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Sports Events</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>

            <Skeleton className="h-10 w-full" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <EventCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Sports Events</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center p-6">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <TicketIcon className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-medium">Error Loading Events</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md text-center">
              {error}
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Sports Events</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Sports Events Dashboard
            </h1>
            <p className="text-muted-foreground">
              Browse upcoming NBA, MLB, and NFL events
            </p>
          </div>
          
          <Tabs defaultValue="nba" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger
                value="nba"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                NBA
              </TabsTrigger>
              <TabsTrigger
                value="mlb"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                MLB
              </TabsTrigger>
              <TabsTrigger
                value="nfl"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                NFL
              </TabsTrigger>
            </TabsList>
            <TabsContent value="nba" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <EventCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <EventsGrid events={eventsData.nba} />
              )}
            </TabsContent>
            <TabsContent value="mlb" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <EventCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <EventsGrid events={eventsData.mlb} />
              )}
            </TabsContent>
            <TabsContent value="nfl" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <EventCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <EventsGrid events={eventsData.nfl} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
