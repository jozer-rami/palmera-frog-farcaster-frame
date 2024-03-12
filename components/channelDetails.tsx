import {getTimeUntilEvent} from "../utils/time";
import {getShortAddress} from "../utils/address";
import {chainIdToName} from "../utils/chains";


export function getSafeChannelDataDetailsJSX(title: string, scheduledFor: Date, status: string, owners: number,
                                             addresses?: Array<{address: string, chainId:string}>,
                                             showOwners: boolean = false): any {
    const addressesJSX = [];
    if(addresses && addresses.length > 0){
        for (const address of addresses) {
            addressesJSX.push(
                <p key={address?.address} style={{
                    color: 'black', fontSize: '32', backgroundColor: '#E3E2D5',
                    borderRadius: '4px', padding: '6px 12px', textAlign: 'center'
                }}>
                    {chainIdToName(address?.chainId)}: {address ? getShortAddress(address?.address) : '...'}
                </p>
            )
        }
    }
    return (<div style={{ display: 'flex', backgroundColor:'black',
        alignItems: 'center', width: '100vw', height: '100vh',
        justifyContent: 'center', textAlign: 'center', flexDirection: 'column'
    }}>
        <p style={{color: 'white', fontSize: '40px', maxWidth:'70%'}}>{title}</p>
        { showOwners ? (<p style={{color: 'white', fontSize: '32px'}}>owner: {owners}</p>) : (<p></p>)}
        {status != 'deployed' ? <p style={{color: 'white', fontSize: '32px'}}>status: {status}</p> : <span></span>}
        {
            status == 'scheduled' ?
                (<div style={{ display: 'flex', justifyContent: 'center',
                    textAlign: 'center', flexDirection: 'column'}}>
                    <p style={{color: 'white', fontSize: '32', textAlign: 'center', width:'100%'}}>
                        Joining periods ends in:
                    </p>
                    <p style={{color: 'black', fontSize: '32', backgroundColor: '#E3E2D5',
                        borderRadius:'4px', padding:'6px 12px'}}>
                        {getTimeUntilEvent(scheduledFor)}
                    </p>
                </div>) :
                (<div style={{ display: 'flex', justifyContent: 'center',
                    textAlign: 'center', flexDirection: 'column'}}>
                    <p style={{color: 'white', fontSize: '20'}}>
                        Deployed at: {scheduledFor} UTC
                    </p>
                    {addressesJSX}

                </div>)
        }
    </div>)
}

