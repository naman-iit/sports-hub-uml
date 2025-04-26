export interface Event {
  id: string;
  name: string;
  url: string;
  sportsHubId: string;
  images: {
    url: string;
    width: number;
    height: number;
  }[];
  dates: {
    start: {
      localDate: string;
      localTime: string;
    };
  };
  priceRanges?: {
    min: number;
    max: number;
    currency: string;
  }[];
  _embedded?: {
    venues?: {
      name: string;
      city: {
        name: string;
      };
      state?: {
        name: string;
      };
      country: {
        name: string;
      };
    }[];
  };
}
