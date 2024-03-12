import { Button, Frog, TextInput } from 'frog'
import { handle } from 'frog/vercel'
import { type NeynarVariables, neynar } from 'frog/middlewares'
import {createSafeChannel, findSafeChannel, addOwnerToSafeChannel} from '../backend/channel';
import {createSafe, findSafe} from '../backend/individual';
import {getChannelFromNeynar} from "../utils/channel";
import {getAddress, getShortAddress} from "../utils/address";
import {DOCUMENTATION_URL} from '../config';
import {getSafeChannelDataDetailsJSX} from './channelDetails'
import {getSafeIndividualAddedAddressesJSX, getSafeIndividualSubmittedJSX,
    getSafeDataDetailsJSX} from './safeIndividualDetails'
import {getErrorJSX} from './error';
import * as dotenv from 'dotenv';

dotenv.config();

type State = {
    channel: string | undefined,
    addresses: Array<string>,
    threshold: number,
    initial_owner: string
}

export const app = new Frog<{ Variable:NeynarVariables, State: State }>({
    assetsPath: '/',
    basePath: '/api',
    initialState: {
        channel: undefined,
        addresses: [],
        initial_owner: undefined,
        threshold: 1
    }
})

app.use(
    neynar({
        apiKey: 'NEYNAR_FROG_FM',
        features: ['interactor', 'cast'],
    }),
)

app.frame('/', (c) => {
    // FLOW FOR CHANNEL
    if(process.env.API_KEY == 'channel'){
        return c.res({
            image: (
                <div style={{ display: 'flex'}}>
                    <img src="https://storage.googleapis.com/farcaster-keyper-dev/Palmera_Frame_HOME.jpg"/>
                </div>
            ),
            intents: [
                <Button action="/create"> Create </Button>,
                <Button action="/join"> Join </Button>,
                <Button action="/check"> Check </Button>
            ],
        })
    }
    // FLOW FOR INDIVIDUAL
    return c.res({
        image: (
            <div style={{ display: 'flex'}}>
                <img src="https://storage.googleapis.com/farcaster-keyper-dev/Palmera_Frame_new_create_safe.jpg" />
            </div>
        ),
        intents: [
            <Button action="/add_address"> Start </Button>,
            <Button action="/check_individual"> Check </Button>
        ],
    })
})

app.frame('/check', async (c) => {
    const { frameData, deriveState } = c;
    const state = deriveState(previousState => {
        if (frameData?.inputText) previousState.channel = frameData?.inputText;
    })
    const channelName = frameData?.inputText || state.channel;
    if(typeof channelName == 'string'){
        const {successChannel} = await getChannelFromNeynar(channelName)
        // Not a real channel
        if(!successChannel){
            return c.res({
                image: getErrorJSX(
                    `${channelName} is not a channel`
                ),
                intents: [
                    <TextInput placeholder={state.channel || "Enter your channel..."}/>,
                    <Button action="/check"> Check </Button>,
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
                ]
            })
        }
        const respCheck = await findSafeChannel(channelName)
        //if channel found
        if(respCheck?.success){
            return c.res({
                image: getSafeChannelDataDetailsJSX(
                    `Safe for ${respCheck.safeChannel.channel} channel`,
                    respCheck.safeChannel.scheduledFor,
                    respCheck.safeChannel.status,
                    respCheck.safeChannel.owners.length,
                    respCheck.safeChannel.addresses,
                    true
                ),
                intents:[
                    <TextInput placeholder={state.channel || "Enter your channel..."}/>,
                    <Button action="/check"> Check </Button>,
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>,
                    <Button.Link href={respCheck.safeChannel.dashboardLink}>
                        Explore
                    </Button.Link>
                ]
            })
        }
        else {
            return c.res({
                image: getErrorJSX( `Error finding status of Safe deployment for ${channelName} channel`),
                intents:[
                    <TextInput placeholder={state.channel || "Enter your channel..."}/>,
                    <Button action="/check"> Check </Button>,
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
                ]
            })
        }
    }
    return c.res({
        image: (
            <div style={{ display: 'flex'}}>
                <img src="https://storage.googleapis.com/farcaster-keyper-dev/Palmera_Frame_Check%20Status.jpg"/>
            </div>
        ),
        intents:[
            <TextInput placeholder={state.channel || "Enter your channel..."}/>,
            <Button> Check status </Button>
        ],
        title: 'Check status of the Safe for your channel'
    })
})

app.frame('/join', async (c) => {
    const { frameData, deriveState } = c;
    const state = deriveState(previousState => {
        if (frameData?.inputText) previousState.channel = frameData?.inputText;
    })
    const channelName = frameData?.inputText || state.channel;
    let respJoin = undefined;
    if(typeof channelName == 'string'){
        const {successAddress,address} = await getAddress(frameData?.fid || 0)
        const {successChannel} = await getChannelFromNeynar(channelName)
        // If not a real channel
        if(!successChannel){
            return c.res({
                image: getErrorJSX(
                    `${channelName} is not a channel`
                ),
                intents: [
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
                ]
            })
        }
        // if no validated address
        if(!successAddress){
            return c.res({
                image: getErrorJSX(
                    `You need a verified address in your profile`
                ),
                intents: [
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
                ]
            })
        }
        respJoin = await addOwnerToSafeChannel(address || '', channelName)
        const respChannel = await findSafeChannel(channelName)
        // if add owner was successful
        if(respJoin.success){
            return c.res({
                image: getSafeChannelDataDetailsJSX(
                    `You have joined the Safe for ${respChannel.safeChannel.channel} channel`,
                    respChannel.safeChannel.scheduledFor,
                    respChannel.safeChannel.status,
                    respChannel.safeChannel.owners.length,
                    respChannel.safeChannel.addresses,
                    true
                ),
                intents:[
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
                ]
            })
        }
        //if it wasn't successful
        else {
            // if the address was already in the safe
            if(respChannel.success){
                return c.res({
                    image: getSafeChannelDataDetailsJSX(
                        `You are already in the Safe for ${state.channel} channel`,
                        respChannel.safeChannel.scheduledFor,
                        respChannel.safeChannel.status,
                        respChannel.safeChannel.owners.length,
                        respChannel.safeChannel.addresses,
                        true
                    ),
                    intents:[
                        <TextInput placeholder={state.channel || "Enter your channel..."}/>,
                        <Button action="/join"> Join </Button>,
                        <Button.Reset> Home </Button.Reset>,
                        <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
                    ],
                    title: 'Join Safe for channel'
                })
            }
            // default is that the channel doesn't have a safe creation procees
            return c.res({
                image: getErrorJSX(
                    `The Safe creation process for ${channelName} channel hasn't been started`
                ),
                intents: [
                    <Button action="/create"> Create </Button>,
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
                ]
            })

        }
    }
    return c.res({
        image: (
            <div style={{ display: 'flex'}}>
                <img src="https://storage.googleapis.com/farcaster-keyper-dev/Palmera_Frame_Join%20Safe.jpg"/>
            </div>
        ),
        intents:[
            <TextInput placeholder={state.channel || "Enter your channel..."}/>,
            <Button> Join </Button>
        ]
    })
})

app.frame('/create', async (c) => {
    const { buttonValue,
        frameData,
        deriveState
    } = c;
    const state = deriveState(previousState => {
        if (frameData?.inputText) previousState.channel = frameData?.inputText;
    })
    const channelName = frameData?.inputText || state.channel;
    let respCreate = undefined;
    if(buttonValue && typeof channelName == 'string'){
        const {successAddress, address} = await getAddress(frameData?.fid || 0)
        const {successChannel} = await getChannelFromNeynar(channelName)
        // if not a real channel
        if(!successChannel){
            return c.res({
                image: getErrorJSX(
                    `${channelName} is not a channel`
                ),
                intents: [
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
                ]
            })
        }
        // if no valid addresss
        if(!successAddress){
            return c.res({
                image: getErrorJSX(
                    `You need a verified address in your profile`
                ),
                intents: [
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
                ]
            })
        }
        let deadline = parseInt(buttonValue) * 60;
        if(deadline == 720)
            deadline = 1
        respCreate = await createSafeChannel(channelName, address || '', deadline)
        const respChannel = await findSafeChannel(channelName)
        //if creation was successful
        if(respCreate.success){
            return c.res({
                image: getSafeChannelDataDetailsJSX(
                    `You  started the deployment process for ${state.channel} channel`,
                    respChannel.safeChannel.scheduledFor,
                    respChannel.safeChannel.status,
                    respChannel.safeChannel.owners.length,
                    respChannel.safeChannel.addresses,
                ),
                intents:[
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
                ]
            })
        }
        //if creation was NOT successful
        else {
            return c.res({
                image: getSafeChannelDataDetailsJSX(
                    `Safe for ${state.channel} channel is already scheduled for deployment`,
                    respChannel.safeChannel.scheduledFor,
                    respChannel.safeChannel.status,
                    respChannel.safeChannel.owners.length,
                    respChannel.safeChannel.addresses,
                    true
                ),
                intents:[
                    <Button action="/create"> Create </Button>,
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
                ]
            })
        }
    }
    return c.res({
        image: (
            <div style={{ display: 'flex'}}>
                <img src="https://storage.googleapis.com/farcaster-keyper-dev/Palmera_Frame_Create%20Safe.jpg"/>
            </div>
        ),
        intents:[
            <TextInput placeholder={state.channel || "Enter your channel..."} />,
            <Button value="12"> 1 min </Button>,
            <Button value="24"> 24 hours </Button>,
            <Button value="48"> 48 hours </Button>,
            <Button value="72"> 72 hours </Button>
        ],
        title: 'Create the Safe for your channel'
    })
})

app.frame('/add_address', async (c) => {
    console.log('add addresss')
    const {
        frameData,
        deriveState
    } = c;
    const {successAddress, address} = await getAddress(frameData?.fid || 0)
    // if no valid addresss
    if(!successAddress){
        return c.res({
            image: getErrorJSX(
                `You need a verified address in your profile`
            ),
            intents: [
                <Button.Reset> Home </Button.Reset>,
                <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
            ]
        })
    }
    const state = deriveState(previousState => {
        if (frameData?.inputText) {
            const inputText = frameData?.inputText.replace(/\s/g, '')
            previousState.addresses = [inputText, ...previousState.addresses]
            previousState.initial_owner = address
        }
    })
    if(state.addresses?.length>0){
        return c.res({
            image: getSafeIndividualAddedAddressesJSX(
                'You have added the following addresses',
                state.addresses
            ),
            intents: [
                <TextInput placeholder={"Enter your address..."} />,
                <Button action="/add_address"> Add </Button>,
                <Button action="/add_threshold"> Next </Button>,
                <Button.Reset> Restart </Button.Reset>,
            ]
        })
    }
    return c.res({
        image: (
            <div style={{ display: 'flex'}}>
                <img src="https://storage.googleapis.com/farcaster-keyper-dev/Palmera_Frame_new_create_safe_details.jpg"/>
            </div>
        ),
        intents:[
            <TextInput placeholder={state.address || "Enter your address..."} />,
            <Button action="/add_address"> Add </Button>,
            <Button.Reset> Restart </Button.Reset>,
        ],
        title: 'Create the Safe for your channel'
    })
})

app.frame('/add_threshold', async (c) => {
    const {
        frameData,
        deriveState
    } = c;
    const state = deriveState(previousState => {
        if (frameData?.inputText) {
            previousState.threshold = frameData?.inputText || previousState.threshold
        }
    })
    if(frameData?.inputText && !isNaN(frameData?.inputText)){
        const threshold = parseInt(state.threshold)
        const validToSubmit = threshold && typeof threshold == 'number'
            && threshold <= state.addresses.length;
        if(validToSubmit){
            console.log(state)
            const respCreate = await createSafe(state.initial_owner, state.addresses, state.threshold)
            if(respCreate.success){
                return c.res({
                    image: getSafeIndividualSubmittedJSX(
                        'You have started the deployment process! :)',
                        state.addresses,
                        state.threshold
                    ),
                    intents: [
                        <Button action="/check_individual"> Check </Button>,
                        <Button.Reset> Restart </Button.Reset>,
                    ]
                })
            } else {
                return c.res({
                    image: getErrorJSX(
                        respCreate.message
                    ),
                    intents: [
                        <Button.Reset> Restart </Button.Reset>,
                    ]
                })

            }

        } else {
            return c.res({
                image: getErrorJSX(
                    'The provided threshold is incorrect. It must an int below the number of signers.'
                ),
                intents: [
                    <TextInput placeholder={"Enter your threshold..."} />,
                    <Button action="/add_threshold"> Add </Button>,
                    <Button.Reset> Restart </Button.Reset>,
                ]
            })
        }
    }
    return c.res({
        image: (
            <div style={{ display: 'flex'}}>
                <img src="https://storage.googleapis.com/farcaster-keyper-dev/Palmera_Frame_new_config_threshold.jpg"/>
            </div>
        ),
        intents:[
            <TextInput placeholder={"Enter your threshold (e.g. 1)..."} />,
            <Button action="/add_threshold"> Submit </Button>,
            <Button.Reset> Restart </Button.Reset>,
        ],
        title: 'Add threshold for your Safe'
    })
})

app.frame('/check_individual', async (c) => {
    const { frameData, state} = c;
    const {successAddress, address} = await getAddress(frameData?.fid || 0)
    if(!successAddress){
        return c.res({
            image: getErrorJSX(
                `You have no validated address`
            ),
            intents: [
                <Button.Reset> Home </Button.Reset>,
                <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
            ]
        })
    }
    const respCheck = await findSafe(address || '')
    //if safe found
    if(respCheck?.success){
        return c.res({
            image: getSafeDataDetailsJSX(
                `Safe for validated address: ${getShortAddress(respCheck.safeChannel.initialOwner)}`,
                respCheck.safeChannel.status,
                respCheck.safeChannel.owners.length,
                respCheck.safeChannel.addresses
            ),
            intents:[
                <Button action="/check_individual"> Recheck </Button>,
                <Button.Reset> Home </Button.Reset>,
                <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>,
                <Button.Link href={respCheck.safeChannel.dashboardLink}>
                    Explore
                </Button.Link>
            ]
        })
    }
    else {
        return c.res({
            image: getErrorJSX( `Error finding status of Safe deployment for owner: ${getShortAddress(address)}`),
            intents:[
                <Button.Reset> Home </Button.Reset>,
                <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
            ]
        })
    }
    return c.res({
        image: (
            <div style={{ display: 'flex'}}>
                <img src="https://storage.googleapis.com/farcaster-keyper-dev/Palmera_Frame_Check%20Status.jpg"/>
            </div>
        ),
        intents:[
            <Button> Check </Button>
        ],
        title: 'Check status of your Safe'
    })
})

export const GET = handle(app)
export const POST = handle(app)


