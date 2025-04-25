import axios from 'axios';

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

interface Event {
  id: string;
  name: string;
  url: string;
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  dates: {
    start: {
      localDate: string;
      localTime: string;
    };
  };
  priceRanges?: Array<{
    min: number;
    max: number;
    currency: string;
  }>;
  _embedded?: {
    venues?: Array<{
      name: string;
      city: {
        name: string;
      };
      state?: {
        name: string;
      };
    }>;
  };
}

interface EventsData {
  nba: Event[];
  mlb: Event[];
  nfl: Event[];
}

interface TicketmasterResponse {
  _embedded?: {
    events?: Event[];
  };
}

export async function getAllSportsEvents(): Promise<EventsData> {
  if (!TICKETMASTER_API_KEY) {
    throw new Error('Ticketmaster API key is not configured');
  }

  try {
    // Fetch NBA events
    const nbaResponse = await axios.get<TicketmasterResponse>(`${TICKETMASTER_BASE_URL}/events.json`, {
      params: {
        apikey: TICKETMASTER_API_KEY,
        keyword: 'NBA',
        size: 10,
        sort: 'date,asc',
        classificationName: 'Sports'
      }
    });

    // Fetch MLB events
    const mlbResponse = await axios.get<TicketmasterResponse>(`${TICKETMASTER_BASE_URL}/events.json`, {
      params: {
        apikey: TICKETMASTER_API_KEY,
        keyword: 'MLB',
        size: 10,
        sort: 'date,asc',
        classificationName: 'Sports'
      }
    });

    // Fetch NFL events
    const nflResponse = await axios.get<TicketmasterResponse>(`${TICKETMASTER_BASE_URL}/events.json`, {
      params: {
        apikey: TICKETMASTER_API_KEY,
        keyword: 'NFL',
        size: 10,
        sort: 'date,asc',
        classificationName: 'Sports'
      }
    });

    return {
      nba: nbaResponse.data._embedded?.events || [],
      mlb: mlbResponse.data._embedded?.events || [],
      nfl: nflResponse.data._embedded?.events || []
    };
  } catch (error) {
    console.error('Error fetching events from Ticketmaster:', error);
    throw new Error('Failed to fetch events from Ticketmaster');
  }
} 