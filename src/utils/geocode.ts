import axios from 'axios';

export interface GeocodeResult {
  displayName: string;
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(
  streetAddress1: string,
  streetAddress2: string | null | undefined,
  city: string | null | undefined,
  state: string | null | undefined,
  postalCode: string | null | undefined,
): Promise<GeocodeResult[]> {
  try {
    const addressParts = [
      streetAddress1,
      streetAddress2 || '',
      city || '',
      state || '',
      postalCode || '',
    ]
      .filter((part) => part)
      .join(', ');

    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: addressParts,
          format: 'json',
          addressDetails: 1,
          countrycodes: 'us',
        },
        headers: { 'User-Agent': 'PortraitsForPatriots/1.0' },
      },
    );

    return response.data.map((item: any) => ({
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));
  } catch (error) {
    console.error('Geocoding failed:', error);
    return [];
  }
}
