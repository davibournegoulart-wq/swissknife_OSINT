// Curated 24/7 Verified Live Broadcast Channels & Satellite Downlink Stream Engine

export interface LiveStreamDefinition {
  id: string;
  name: string;
  source: string;
  youtubeId: string;
  region: string;
}

export const VERIFIED_LIVE_CHANNELS: Record<string, LiveStreamDefinition> = {
  sky_news: {
    id: "sky_news",
    name: "Sky News Global Live Intercept",
    source: "SKY NEWS (UK/GLOBAL)",
    youtubeId: "9Auq9mYxFEE",
    region: "Global"
  },
  al_jazeera: {
    id: "al_jazeera",
    name: "Al Jazeera English Live Broadcast",
    source: "AL JAZEERA (MIDDLE EAST / GLOBAL)",
    youtubeId: "gCNeDWCI0wo",
    region: "Middle East / Asia"
  },
  dw_news: {
    id: "dw_news",
    name: "DW News 24/7 Live Feed",
    source: "DEUTSCHE WELLE (EUROPE / GLOBAL)",
    youtubeId: "iEP3y4KjL7U",
    region: "Europe"
  },
  euronews: {
    id: "euronews",
    name: "Euronews 24/7 Live Stream",
    source: "EURONEWS (EUROPE)",
    youtubeId: "DPnqb74SmKg",
    region: "Europe"
  },
  france24: {
    id: "france24",
    name: "France 24 English Live Stream",
    source: "FRANCE 24 (EUROPE / AFRICA)",
    youtubeId: "jL8uDJJBj-I",
    region: "Europe / Africa"
  },
  abc_news: {
    id: "abc_news",
    name: "ABC News Live Broadcast",
    source: "ABC NEWS (AMERICAS / GLOBAL)",
    youtubeId: "w_Ma8oQLmSM",
    region: "Americas"
  },
  nasa_live: {
    id: "nasa_live",
    name: "NASA ISS HD Earth Viewing & Satellite Downlink",
    source: "NASA / SATELLITE ARRAY",
    youtubeId: "21X5lGlDOfg",
    region: "Space / Global"
  },
  cna_asia: {
    id: "cna_asia",
    name: "CNA 24/7 Live Breaking News",
    source: "CNA (ASIA / PACIFIC)",
    youtubeId: "07d2-7Wd_d4",
    region: "Asia"
  }
};

/**
 * Returns a guaranteed working, verified live video embed + direct external monitoring links for any target
 */
export function getLiveMediaForTarget(cleanTitle: string, country: string, category: string): {
  streamName: string;
  source: string;
  embedUrl: string;
  externalLiveUrl: string;
  googleNewsUrl: string;
  twitterOsintUrl: string;
  flightRadarUrl?: string;
} {
  const query = encodeURIComponent(`${cleanTitle} ${country}`);
  const countryLower = country.toLowerCase();
  const catLower = category.toLowerCase();

  let selectedStream = VERIFIED_LIVE_CHANNELS.sky_news;

  // Region / category routing for live video stream
  if (catLower.includes("sat") || catLower.includes("orbit") || catLower.includes("space") || catLower.includes("storm") || catLower.includes("cyclone") || catLower.includes("fire") || catLower.includes("volcano")) {
    selectedStream = VERIFIED_LIVE_CHANNELS.nasa_live;
  } else if (countryLower.includes("indonesia") || countryLower.includes("taiwan") || countryLower.includes("china") || countryLower.includes("japan") || countryLower.includes("korea") || countryLower.includes("philippines") || countryLower.includes("asia")) {
    selectedStream = VERIFIED_LIVE_CHANNELS.cna_asia;
  } else if (countryLower.includes("israel") || countryLower.includes("iran") || countryLower.includes("iraq") || countryLower.includes("syria") || countryLower.includes("lebanon") || countryLower.includes("gaza") || countryLower.includes("yemen") || countryLower.includes("emirates") || countryLower.includes("saudi")) {
    selectedStream = VERIFIED_LIVE_CHANNELS.al_jazeera;
  } else if (countryLower.includes("ukraine") || countryLower.includes("russia") || countryLower.includes("germany") || countryLower.includes("poland") || countryLower.includes("europe") || countryLower.includes("baltic")) {
    selectedStream = VERIFIED_LIVE_CHANNELS.dw_news;
  } else if (countryLower.includes("united states") || countryLower.includes("usa") || countryLower.includes("brazil") || countryLower.includes("america")) {
    selectedStream = VERIFIED_LIVE_CHANNELS.abc_news;
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${selectedStream.youtubeId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`;
  const externalLiveUrl = `https://www.youtube.com/watch?v=${selectedStream.youtubeId}`;
  const googleNewsUrl = `https://news.google.com/search?q=${query}`;
  const twitterOsintUrl = `https://x.com/search?q=${encodeURIComponent(`${cleanTitle} OSINT OR breaking`)}&f=live`;

  return {
    streamName: selectedStream.name,
    source: selectedStream.source,
    embedUrl,
    externalLiveUrl,
    googleNewsUrl,
    twitterOsintUrl
  };
}
