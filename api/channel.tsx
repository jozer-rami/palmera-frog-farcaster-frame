import { Button, Frog, TextInput } from 'frog'
import { handle } from 'frog/vercel'
import { type NeynarVariables, neynar } from 'frog/middlewares'
import {createSafeChannel, findSafeChannel, addOwnerToSafeChannel} from '../backend/channel';
import {getChannelFromNeynar} from "../utils/channel";
import {getAddress} from "../utils/address";
import {DOCUMENTATION_URL} from '../config';
import {getSafeChannelDataDetailsJSX} from '../components/channelDetails'
import {getErrorJSX} from '../components/error';
import * as dotenv from 'dotenv';

dotenv.config();

type State = {
    channel: string | undefined
}

export const app = new Frog<{ Variable:NeynarVariables, State: State }>({
    assetsPath: '/',
    basePath: '/',
    initialState: {
        channel: undefined
    }
})

app.use(
    neynar({
        apiKey: 'NEYNAR_FROG_FM',
        features: ['interactor', 'cast'],
    }),
)

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
        let intents = [
            <TextInput placeholder={state.channel || "Enter your channel..."}/>,
            <Button action="/check"> Check </Button>,
            <Button.Reset> Home </Button.Reset>,
            <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>,
        ]
        if(respCheck?.success){
            if (respCheck.safeChannel.status == 'deployed'){
                console.log('adding button')
                intents.push(<Button.Link href={respCheck.safeChannel.dashboardLink}>Explore</Button.Link>)
            }
            return c.res({
                image: getSafeChannelDataDetailsJSX(
                    `Safe for ${respCheck.safeChannel.channel} channel`,
                    respCheck.safeChannel.scheduledFor,
                    respCheck.safeChannel.status,
                    respCheck.safeChannel.owners.length,
                    respCheck.safeChannel.addresses,
                    true
                ),
                intents:intents
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
    let { buttonValue,
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
        if (deadline == 720){
            deadline = 1
        }
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
                    <Button action="/check"> Recheck </Button>,
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


export const GET = handle(app)
export const POST = handle(app)


