import {getShortAddress} from "../utils/address";
import {chainIdToName} from "../utils/chains";

export function getSafeIndividualAddedAddressesJSX(title: string, addresses: Array<string>): any {
    const addressesJSX = [];
    if(addresses && addresses.length > 0){
        for (const address of addresses) {
            addressesJSX.push(
                <p key={address} style={{
                    color: 'black', fontSize: '32', backgroundColor: '#E3E2D5',
                    borderRadius: '4px', padding: '6px 12px', textAlign: 'center'
                }}>
                    {getShortAddress(address)}
                </p>
            )
        }
    }
    return (<div style={{ display: 'flex', backgroundColor:'black',
        alignItems: 'center', width: '100vw', height: '100vh',
        justifyContent: 'center', textAlign: 'center', flexDirection: 'column'
    }}>
        <p style={{color: 'white', fontSize: '40px', maxWidth:'70%'}}>{title}</p>
        <div style={{ display: 'flex', justifyContent: 'center',
        textAlign: 'center', flexDirection: 'column'}}>
            {addressesJSX}
        </div>
        <p style={{color: 'white', fontSize: '30px', maxWidth:'70%'}}>
             Click on "next" after you added all your signers
        </p>
    </div>)
}

export function getSafeIndividualSubmittedJSX(title: string, addresses: Array<string>, threshold: number): any {
    return (
        <div style={{ display: 'flex', backgroundColor:'black',
            alignItems: 'center', width: '100vw', height: '100vh',
            justifyContent: 'center', textAlign: 'center', flexDirection: 'column'
        }}>
            <p style={{color: 'white', fontSize: '40px', maxWidth:'70%'}}>{title}</p>
            <div style={{ display: 'flex', justifyContent: 'center',
                textAlign: 'center', flexDirection: 'column'}}>
                <p style={{color: 'white', fontSize: '32'}}>
                    Addresses added: {addresses.length}
                </p>
                <p style={{color: 'white', fontSize: '32'}}>
                    Signature threshold: {threshold}
                </p>
                <p style={{color: 'white', fontSize: '32'}}>
                    Click on "check" to see the status of the deployment
                </p>
            </div>
        </div>
    )
}

export function getSafeDataDetailsJSX(title: string, status: string, owners: number,
                                      addresses?: Array<{address: string, chainId:string}>): any {
    const addressesJSX = [];
    if(addresses && addresses.length > 0){
        for (const address of addresses) {
            addressesJSX.push(
                <p key={address?.address} style={{
                    color: 'black', fontSize: '28', backgroundColor: '#E3E2D5',
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
        <p style={{color: 'white', fontSize: '30px'}}>signers: {owners}</p>
        {
            status == 'deployed' ?
                (<div style={{ display: 'flex', justifyContent: 'center',
                    textAlign: 'center', flexDirection: 'column'}}>
                    {addressesJSX}
                </div>) :
                (<p style={{color: 'white', fontSize: '32px'}}>status: {status}</p>)
        }
        {
            status == 'deployed' ?
                <p style={{color: 'white', fontSize: '28px'}}>Click on "explore" to see your Safes</p> :
                <spam></spam>
        }
        {
            status == 'deploying' ?
                (<p style={{color: 'white', fontSize: '28px'}}>Deploying could take up to 3 min...</p>) :
                (<spam></spam>)
        }

    </div>)
}

