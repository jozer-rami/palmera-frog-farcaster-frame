import { Button, Frog, TextInput } from 'frog'
import { handle } from 'frog/vercel'
import { type NeynarVariables, neynar } from 'frog/middlewares'
import {createSafeChannel, findSafeChannel, addOwnerToSafeChannel} from '../backend/safeScheduler.js';
import {getChannelFromNeynar} from "../utils/channel.js";
import {getAddress} from "../utils/address.js";
import {DOCUMENTATION_URL} from '../config.js';
import {getSafeChannelDataDetailsJSX} from './channelDetails.js'
import {getErrorJSX} from './error.js';


type State = {
    channel: string | undefined
}

export const app = new Frog<{ Variable:NeynarVariables, State: State }>({
    assetsPath: '/',
    basePath: '/api',
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

app.frame('/', (c) => {
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
                    respCheck.safeChannel.address,
                    true
                ),
                intents:[
                    <TextInput placeholder={state.channel || "Enter your channel..."}/>,
                    <Button action="/check"> Check </Button>,
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>,
                    <Button.Link href={`https://sepolia.etherscan.io/address/${respCheck.safeChannel.address}#code`}>
                        Explorer
                    </Button.Link>
                ]
            })
        }
        else {
            return c.res({
                image: getErrorJSX( `Error finding status of Safe deployment for ${respCheck.safeChannel.channel} channel`),
                intents:[
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
        // Not a real channel
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
        if(respJoin.success){
            return c.res({
                image: getSafeChannelDataDetailsJSX(
                    `You have joined the Safe for ${respChannel.safeChannel.channel} channel`,
                    respChannel.safeChannel.scheduledFor,
                    respChannel.safeChannel.status,
                    respChannel.safeChannel.owners.length,
                    respChannel.safeChannel.address,
                    true
                ),
                intents:[
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
                ]
            })
        }
        else {
            if(respChannel.success){
                return c.res({
                    image: getSafeChannelDataDetailsJSX(
                        `You are already in the Safe for ${state.channel} channel`,
                        respChannel.safeChannel.scheduledFor,
                        respChannel.safeChannel.status,
                        respChannel.safeChannel.owners.length,
                        respChannel.safeChannel.address,
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
        // Not a real channel
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
        if(respCreate.success){
            return c.res({
                image: getSafeChannelDataDetailsJSX(
                    `You  started the deployment process for ${state.channel} channel`,
                    respChannel.safeChannel.scheduledFor,
                    respChannel.safeChannel.status,
                    respChannel.safeChannel.owners.length,
                    respChannel.safeChannel.address,
                ),
                intents:[
                    <Button.Reset> Home </Button.Reset>,
                    <Button.Link href={DOCUMENTATION_URL}> Docs </Button.Link>
                ]
            })
        }
        else {
            return c.res({
                image: getSafeChannelDataDetailsJSX(
                    `Safe for ${state.channel} channel is already scheduled for deployment`,
                    respChannel.safeChannel.scheduledFor,
                    respChannel.safeChannel.status,
                    respChannel.safeChannel.owners.length,
                    respChannel.safeChannel.address,
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


