import {getTimeUntilEvent} from "../utils/time.js";
import {getShortAddress} from "../utils/address.js";

export function getSafeChannelDataDetailsJSX(title: string, scheduledFor: Date, status: string, owners: number,
                                             address?:string, showOwners: boolean = false): any {
    return (<div style={{ display: 'flex', backgroundColor:'black',
        alignItems: 'center', width: '100vw', height: '100vh',
        justifyContent: 'center', textAlign: 'center', flexDirection: 'column'
    }}>
        <p style={{color: 'white', fontSize: '40px', maxWidth:'70%'}}>{title}</p>
        { showOwners ? (<p style={{color: 'white', fontSize: '32px'}}>owner: {owners}</p>) : (<p></p>)}
        <p style={{color: 'white', fontSize: '32px'}}>status: {status}</p>
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
                    <p style={{color: 'white', fontSize: '32'}}>
                        Deployed at: {scheduledFor} UTC
                    </p>
                    <p style={{color: 'black', fontSize: '32', backgroundColor: '#E3E2D5',
                        borderRadius:'4px', padding:'6px 12px', textAlign:'center'}}>
                        Address: {address ? getShortAddress(address) : 'unknown'}
                    </p>
                </div>)
        }
    </div>)
}

