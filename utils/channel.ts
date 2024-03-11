import {NeynarAPIClient} from "@neynar/nodejs-sdk";

const neynarApiKey = process.env.NEYNAR_API_KEY || 'NEYNAR_FROG_FM';
const neynarClient = new NeynarAPIClient(neynarApiKey);

export  async function getChannelFromNeynar(channelName: string): Promise<{ channel: any, successChannel: boolean }> {
    try {
        const channel = await neynarClient.lookupChannel(channelName);
        return {
            channel: channel.channel,
            successChannel: true

        };
    } catch {
        return {
            channel: undefined,
            successChannel: false
        };
    }
}
