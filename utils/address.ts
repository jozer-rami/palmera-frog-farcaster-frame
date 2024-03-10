import {NeynarAPIClient} from "@neynar/nodejs-sdk";
const neynarApiKey = process.env.NEYNAR_API_KEY || 'NEYNAR_FROG_FM';
const neynarClient = new NeynarAPIClient(neynarApiKey);

export function getShortAddress(address: string): string {
    const firstCharacters = address.substring(0, 7);
    const lastCharacters = address.slice(-7);
    return `${firstCharacters}...${lastCharacters}`;
}

export async function getAddress(fid: number): Promise<{ address: string | undefined, successAddress: boolean }> {
    const user = await neynarClient.lookupUserByFid(fid);
    const userVerifiedAddresses = user.result.user.verifications;
    // TODO add user verified_addresses
    const ownerAddresses: string[] = userVerifiedAddresses.map(address => address);
    if (ownerAddresses.length == 0 ) {
        return {
            address: undefined,
            successAddress: false
        };
    }
     return {
        address: ownerAddresses[0],
        successAddress: true
    };
}
