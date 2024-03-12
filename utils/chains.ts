export function chainIdToName(chain_id: string): string {
    const chainIdToNameDict: { [key: string]: string}   = {
        '11155111': 'Sepolia',
        '137': 'Polygon',
        '42161': 'Arbitrum',
        '10': 'Optimism'
    }
    return chainIdToNameDict[chain_id]
}
