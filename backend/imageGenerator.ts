import { BACKEND_PUBLIC_URL } from "../config.js";

interface GenerateResponse {
  image: string; // base64 encoded string
}

async function fetchGeneratorResponse(url: string): Promise<GenerateResponse> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GenerateResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function generateSummary(channel: string): Promise<GenerateResponse> {
  const url = `${BACKEND_PUBLIC_URL}/api/generator/summary/${encodeURIComponent(
    channel
  )}`;
  return fetchGeneratorResponse(url);
}

export async function generateJoin(channel: string): Promise<GenerateResponse> {
  const url = `${BACKEND_PUBLIC_URL}/api/generator/join/${encodeURIComponent(
    channel
  )}`;
  return fetchGeneratorResponse(url);
}

export async function generateAlreadySchedule(channel: string): Promise<GenerateResponse> {
  const url = `${BACKEND_PUBLIC_URL}/api/generator/already_scheduled/${encodeURIComponent(
    channel
  )}`;
  return fetchGeneratorResponse(url);
}

export async function generateError(message: string): Promise<GenerateResponse> {
  const url = `${BACKEND_PUBLIC_URL}/api/generator/error/${encodeURIComponent(
    message
  )}`;
  return fetchGeneratorResponse(url);
}

export async function generateSafeCreation(
  channel: string
): Promise<GenerateResponse> {
  const url = `${BACKEND_PUBLIC_URL}/api/generator/safe_creation/${encodeURIComponent(
    channel
  )}`;
  console.log('Try get image creation', url);
  return fetchGeneratorResponse(url);
}
