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
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export async function getAllSportsEvents(): Promise<EventsData> {
  if (!TICKETMASTER_API_KEY) {
    throw new Error('Ticketmaster API key is not configured');
  }

  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Common parameters for all sports
    const commonParams = {
      apikey: TICKETMASTER_API_KEY,
      countryCode: 'US',
      size: 50,
      sort: 'date,asc',
      classificationName: 'Sports',
      startDateTime: `${today}T00:00:00Z`,
      includeFamily: 'no',
      includeTBA: 'no',
      includeTBD: 'no',
      radius: 1000 // Search within 1000 miles
    };

    console.log('Fetching NBA events...');
    // Fetch NBA events
    const nbaResponse = await axios.get<TicketmasterResponse>(`${TICKETMASTER_BASE_URL}/events.json`, {
      params: {
        ...commonParams,
        keyword: 'NBA',
        segmentId: 'KZFzniwnSyZfZ7v7nE' // Sports segment ID
      }
    });
    console.log('NBA Response:', {
      totalElements: nbaResponse.data.page?.totalElements || 0,
      events: nbaResponse.data._embedded?.events?.length || 0
    });

    console.log('Fetching MLB events...');
    // Fetch MLB events
    const mlbResponse = await axios.get<TicketmasterResponse>(`${TICKETMASTER_BASE_URL}/events.json`, {
      params: {
        ...commonParams,
        keyword: 'MLB',
        segmentId: 'KZFzniwnSyZfZ7v7nE' // Sports segment ID
      }
    });
    console.log('MLB Response:', {
      totalElements: mlbResponse.data.page?.totalElements || 0,
      events: mlbResponse.data._embedded?.events?.length || 0
    });

    console.log('Fetching NFL events...');
    // Fetch NFL events
    const nflResponse = await axios.get<TicketmasterResponse>(`${TICKETMASTER_BASE_URL}/events.json`, {
      params: {
        ...commonParams,
        keyword: 'NFL',
        segmentId: 'KZFzniwnSyZfZ7v7nE' // Sports segment ID
      }
    });
    console.log('NFL Response:', {
      totalElements: nflResponse.data.page?.totalElements || 0,
      events: nflResponse.data._embedded?.events?.length || 0
    });

    const result = {
      nba: nbaResponse.data._embedded?.events || [],
      mlb: mlbResponse.data._embedded?.events || [],
      nfl: nflResponse.data._embedded?.events || []
    };

    console.log('Final results:', {
      nbaCount: result.nba.length,
      mlbCount: result.mlb.length,
      nflCount: result.nfl.length
    });

    return result;
  } catch (error: any) {
    console.error('Error fetching events from Ticketmaster:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      params: error.config?.params
    });
    throw new Error('Failed to fetch events from Ticketmaster');
  }
} 