import { BACKEND_PUBLIC_URL } from '../config.js';

export async function findSafeChannel(channelName: string): Promise<FindChannelResponse> {
    const baseUrl = `${BACKEND_PUBLIC_URL}`;
    const url = `${baseUrl}/api/channel/${encodeURIComponent(channelName)}`;

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


export async function createSafeChannel(channel: string, owner: string, deadlineInMin: number): Promise<CreateChannelResponse> {
  const url = `${BACKEND_PUBLIC_URL}/api/channel/create/safe`;
  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              channel,
              owner,
              deadlineInMin,
          }),
      });

      if (!response.ok) {
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

export async function findChannelDeadline() {
  const response = await fetch(
    `${BACKEND_PUBLIC_URL}/api/channel/frames/deadline`
  );
  const data = await response.json();
  console.log(data);
}

interface FindChannelResponse {
  message: string;
  success: boolean;
}

export async function addOwnerToSafeChannel(owner: string, channel: string) : Promise<AddOwnerResponse>{
  const response = await fetch(`${BACKEND_PUBLIC_URL}/api/channel/addOwner`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      owner,
      channel,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: AddOwnerResponse = await response.json();
  return data;
}

interface SafeChannel {
  _id: string;
  channel: string;
  initialOwner: string;
  owners: string[];
  createdAt: Date;
  scheduledFor: Date;
  status: string;
  address: string;
  deployedAt: Date;
}

interface FindChannelResponse {
  safeChannel: SafeChannel;
  message: string;
  success: boolean;
}

interface AddOwnerResponse {
  message: string;
  success: boolean;
}

interface CreateChannelResponse {
  message: string;
  success: boolean;
}
