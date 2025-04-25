import { Event } from '../dashboard/models/Event';

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

// Sport-specific segment IDs
const SPORT_SEGMENTS = ['nba', 'mlb', 'nfl'];

export async function getEventsBySport(sport: 'nba' | 'mlb' | 'nfl', city?: string): Promise<Event[]> {
  if (!TICKETMASTER_API_KEY) {
    console.error('Ticketmaster API key is not configured');
    return [];
  }

  if (!SPORT_SEGMENTS.includes(sport)) {
    console.error(`Invalid sport: ${sport}`);
    return [];
  }

  try {
    const params = new URLSearchParams({
      apikey: TICKETMASTER_API_KEY,
      size: '20',
      segmentId: 'KZFzniwnSyZfZ7v7nE',
      classificationName: sport,
      sort: 'date,asc',
      countryCode: 'US',
      ...(city && { city }),
    });

    const response = await fetch(`${TICKETMASTER_BASE_URL}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Ticketmaster API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to fetch ${sport} events: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data._embedded?.events) {
      console.warn(`No ${sport} events found in the response`);
      return [];
    }

    return data._embedded.events;
  } catch (error) {
    console.error(`Error fetching ${sport} events:`, error);
    return [];
  }
}

// Function to get all sports events
export async function getAllSportsEvents(city?: string): Promise<{
  nba: Event[];
  mlb: Event[];
  nfl: Event[];
}> {
  const [nbaEvents, mlbEvents, nflEvents] = await Promise.all([
    getEventsBySport('nba', city),
    getEventsBySport('mlb', city),
    getEventsBySport('nfl', city)
  ]);

  return {
    nba: nbaEvents,
    mlb: mlbEvents,
    nfl: nflEvents
  };
} 