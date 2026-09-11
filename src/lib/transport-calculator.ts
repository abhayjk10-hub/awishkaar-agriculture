import { Language, t } from './translations/index';

/**
 * Geographic coordinates (latitude and longitude).
 */
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

/**
 * Cost bounds per user requirements (50 to 85 ₹ per kilometer).
 */
export const MIN_TRANSPORT_RATE = 50;
export const MAX_TRANSPORT_RATE = 85;
export const DEFAULT_TRANSPORT_RATE = 65;

export interface TransportCostOptions {
  /**
   * Configurable transportation rate in ₹/km.
   * Clamped between MIN_TRANSPORT_RATE (50) and MAX_TRANSPORT_RATE (85).
   * Defaults to 65 ₹/km.
   */
  ratePerKm?: number;

  /**
   * Target UI display language.
   * Supports 'en' | 'hi' | 'mr' | 'gu' | 'pa'.
   * Defaults to 'en'.
   */
  language?: Language;

  /**
   * Number of decimal places to round the final rupee cost.
   * Defaults to 2.
   */
  roundDecimals?: number;
}

export interface TransportCostResult {
  /** Distance in kilometers (accurate Haversine calculation) */
  distanceKm: number;
  /** Effective rate applied in ₹/km (between 50 and 85) */
  ratePerKm: number;
  /** Total calculated cost in Indian Rupees */
  totalCost: number;
  /** Formatted cost string with ₹ symbol (e.g., "₹387.50") */
  formattedCost: string;
  /** Formatted distance string (e.g., "25.0 km") */
  formattedDistance: string;
  /** Formatted rate string (e.g., "₹15.5/km") */
  formattedRate: string;
  /** Estimated transit duration in minutes (based on 30 km/h agri-transport) */
  estimatedTransitMinutes: number;
  /** Localized human-readable duration (e.g., "50 mins" or "1h 15m") */
  formattedTransitTime: string;
  /** Localized full summary message */
  summary: string;
  /** Multilingual UI labels localized in the requested language */
  labels: {
    title: string;
    distance: string;
    rate: string;
    totalCost: string;
    perKm: string;
    transitTime: string;
    transitNote: string;
  };
  farmerLocation: GeoLocation;
  mandiLocation: GeoLocation;
}

/**
 * Calculates the great-circle distance between two GPS coordinates using the Haversine formula.
 *
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in kilometers rounded to two decimal places.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

/**
 * Retrieves the farmer's current GPS location from the device browser using navigator.geolocation.
 *
 * @param options GeolocationPositionOptions (high accuracy, timeout, etc.)
 * @returns Promise resolving to { latitude, longitude }
 */
export function getFarmerCurrentLocation(
  options: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser or environment.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission was denied by the user.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is currently unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Request to get user location timed out.';
            break;
        }
        reject(new Error(message));
      },
      options
    );
  });
}

/**
 * Calculates the transportation cost from the farmer's location to a mandi location.
 *
 * Distance is computed using the Haversine formula and multiplied by a rate
 * between 50 and 85 ₹/km (default: 65 ₹/km). All labels and summaries are
 * returned in the requested language (English, Hindi, Marathi, Gujarati, Punjabi).
 *
 * @param farmerLocation Farmer's GPS coordinate
 * @param mandiLocation Mandi's GPS coordinate
 * @param options Configuration options (ratePerKm, language, roundDecimals)
 * @returns Comprehensive, multilingual TransportCostResult
 */
export function calculateTransportationCost(
  farmerLocation: GeoLocation,
  mandiLocation: GeoLocation,
  options: TransportCostOptions = {}
): TransportCostResult {
  const {
    ratePerKm = DEFAULT_TRANSPORT_RATE,
    language = 'en',
    roundDecimals = 2,
  } = options;

  // Ensure rate stays within the defined 50-85 ₹/km range
  const validRate = Math.min(Math.max(ratePerKm, MIN_TRANSPORT_RATE), MAX_TRANSPORT_RATE);

  // Compute distance via Haversine
  const distanceKm = calculateHaversineDistanceKm(
    farmerLocation.latitude,
    farmerLocation.longitude,
    mandiLocation.latitude,
    mandiLocation.longitude
  );

  // Total cost calculation
  const rawCost = distanceKm * validRate;
  const factor = Math.pow(10, roundDecimals);
  const totalCost = Math.round(rawCost * factor) / factor;

  // Transit time estimation (~30 km/h average speed for rural agri-cargo / tractor)
  const estimatedTransitMinutes = Math.max(10, Math.round((distanceKm / 30) * 60));
  const hours = Math.floor(estimatedTransitMinutes / 60);
  const mins = estimatedTransitMinutes % 60;

  const formattedTransitTime =
    hours > 0
      ? t('transport.hoursMin', language, { hours, mins })
      : t('transport.minsOnly', language, { mins });

  const formattedCost = `₹${totalCost.toLocaleString('en-IN', {
    minimumFractionDigits: roundDecimals,
    maximumFractionDigits: roundDecimals,
  })}`;

  const formattedDistance = `${distanceKm.toFixed(1)} km`;
  const formattedRate = `₹${validRate}${t('transport.perKm', language)}`;

  const summary = t('transport.summary', language, {
    cost: totalCost.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }),
    distance: distanceKm.toFixed(1),
    rate: validRate,
  });

  return {
    distanceKm,
    ratePerKm: validRate,
    totalCost,
    formattedCost,
    formattedDistance,
    formattedRate,
    estimatedTransitMinutes,
    formattedTransitTime,
    summary,
    labels: {
      title: t('transport.title', language),
      distance: t('transport.distance', language),
      rate: t('transport.ratePerKm', language),
      totalCost: t('transport.totalCost', language),
      perKm: t('transport.perKm', language),
      transitTime: t('transport.estTransitTime', language),
      transitNote: t('transport.transitNote', language),
    },
    farmerLocation,
    mandiLocation,
  };
}

/**
 * End-to-end convenience function:
 * Automatically retrieves the user's current GPS location from their device,
 * then computes the transportation cost to the target mandi.
 *
 * @param mandiLocation Target mandi coordinates
 * @param options Calculation options
 * @returns Promise resolving to TransportCostResult
 */
export async function calculateTransportCostFromDevice(
  mandiLocation: GeoLocation,
  options?: TransportCostOptions
): Promise<TransportCostResult> {
  const farmerLocation = await getFarmerCurrentLocation();
  return calculateTransportationCost(farmerLocation, mandiLocation, options);
}
