import { BACKEND_PUBLIC_URL } from '../config';

export async function findSafe(initialOwner: string): Promise<FindChannelResponse> {
    const baseUrl = `${BACKEND_PUBLIC_URL}`;
    const url = `${baseUrl}/api/individual/safe/${encodeURIComponent(initialOwner)}`;
    try {
        const response = await fetch(url, {
            method: 'GET', // This is optional for GET requests
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: FindChannelResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching channel data:', error);
        throw error;
    }
}


export async function createSafe(initialOwner: string, addresses: string[], threshold: number): Promise<CreateChannelResponse> {
  const url = `${BACKEND_PUBLIC_URL}/api/individual/create/safe`;
  let addressesStr = addresses.join(',');
  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              initialOwner,
              'addresses': addressesStr,
              threshold,
          }),
      });

      if (!response.ok) {
          console.log(response)
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CreateChannelResponse = await response.json();
      console.log('createSafeChannel Response:', data.message);
      return data;
  } catch (error) {
      console.error('Error creating safe channel:', error);
      throw error;
  }
}

interface FindChannelResponse {
  message: string;
  success: boolean;
}

interface SafeChannel {
  _id: string;
  channel: string;
  initialOwner: string;
  owners: string[];
  createdAt: Date;
  scheduledFor: Date;
  status: string;
  addresses: Array<{address: string, chainId: string}>;
  deployedAt: Date;
  dashboardLink: string;
}

interface FindChannelResponse {
  safeChannel: SafeChannel;
  message: string;
  success: boolean;
}

interface CreateChannelResponse {
  message: string;
  success: boolean;
}
