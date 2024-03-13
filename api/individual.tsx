import { Button, Frog, TextInput } from 'frog'
import { handle } from 'frog/vercel'
import { isAddress } from "ethers";
import { type NeynarVariables, neynar } from 'frog/middlewares'
import {createSafe, findSafe} from '../backend/individual';
import {getAddress, getShortAddress} from "../utils/address";
import {DOCUMENTATION_INDIVIDUAL_URL} from '../config';
import {getSafeIndividualAddedAddressesJSX, getSafeIndividualSubmittedJSX,
    getSafeDataDetailsJSX} from '../components/safeIndividualDetails'
import {getErrorJSX} from '../components/error';
import * as dotenv from 'dotenv';

dotenv.config();

type State = {
    addresses: Array<string>,
    threshold: number,
    initial_owner: string | undefined,
}

export const app = new Frog<{ Variable:NeynarVariables, State: State }>({
    assetsPath: '/',
    basePath: '/',
    initialState: {
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

app.frame('/add_address', async (c) => {
    const {
        frameData,
        deriveState,
        previousState
    } = c;
    const {successAddress, address} = await getAddress(frameData?.fid || 0)
    // if no valid address
    if(!successAddress){
        return c.res({
            image: getErrorJSX(
                `You need a verified address in your profile`
            ),
            intents: [
                <Button.Reset> Home </Button.Reset>,
                <Button.Link href={DOCUMENTATION_INDIVIDUAL_URL}> Docs </Button.Link>
            ]
        })
    }
    const inputText = frameData?.inputText?.replace(/\s/g, '')
    const correctAddress = isAddress(inputText)
    if(inputText && !correctAddress){
        console.log('here')
        return c.res({
            image: getErrorJSX(
                `Wrongly formatted address: ${inputText}`
            ),
            intents: [
                <Button action="/add_address"> Back </Button>,
                <Button.Reset> Restart </Button.Reset>,
                <Button.Link href={DOCUMENTATION_INDIVIDUAL_URL}> Docs </Button.Link>
            ]
        })

    }
    if(inputText && previousState?.addresses.indexOf(inputText) != -1){
        return c.res({
            image: getErrorJSX(
                `Address: ${getShortAddress(inputText)} has already been added`
            ),
            intents: [
                <Button action="/add_address"> Back </Button>,
                <Button.Reset> Restart </Button.Reset>,
                <Button.Link href={DOCUMENTATION_INDIVIDUAL_URL}> Docs </Button.Link>
            ]
        })
    }
    const state = deriveState(previousState => {
        if(inputText && correctAddress){
            if(previousState.addresses.indexOf(inputText) == -1){
                previousState.addresses = [inputText, ...previousState.addresses]
            }
        }
        previousState.initial_owner = address
    })


    if(state?.addresses?.length>0){
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
            <TextInput placeholder={"Enter your address..."} />,
            <Button action="/add_address"> Add </Button>,
            <Button.Reset> Restart </Button.Reset>,
            <Button.Link href={DOCUMENTATION_INDIVIDUAL_URL}> Docs </Button.Link>
        ],
        title: 'Create the Safe for your channel'
    })
})

app.frame('/add_threshold', async (c) => {
    const {
        frameData,
        deriveState
    } = c;
    if(frameData?.inputText && !isNaN(parseInt(frameData.inputText))){
        const state = deriveState(previousState => {
            if (frameData?.inputText) {
                previousState.threshold = parseInt(frameData.inputText) || previousState.threshold
            }
        })
        const threshold = state.threshold
        const validToSubmit = threshold && typeof threshold == 'number'
            && threshold <= state.addresses.length;
        if(validToSubmit){
            console.log(state)
            const respCreate = await createSafe(state.initial_owner!, state.addresses, state.threshold)
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
    const { frameData} = c;
    const {successAddress, address} = await getAddress(frameData?.fid || 0)
    if(!successAddress){
        return c.res({
            image: getErrorJSX(
                `You have no validated address`
            ),
            intents: [
                <Button.Reset> Home </Button.Reset>,
                <Button.Link href={DOCUMENTATION_INDIVIDUAL_URL}> Docs </Button.Link>
            ]
        })
    }
    const respCheck = await findSafe(address || '')
    //if safe found
    const intents = [
        <Button action="/check_individual"> Recheck </Button>,
        <Button.Reset> Home </Button.Reset>,
        <Button.Link href={DOCUMENTATION_INDIVIDUAL_URL}> Docs </Button.Link>
    ]
    if(respCheck?.success){
        if (respCheck.safeChannel.status == 'deployed'){
            console.log('adding button')
            intents.push(<Button.Link href={respCheck.safeChannel.dashboardLink}>Explore</Button.Link>)
        }
        return c.res({
            image: getSafeDataDetailsJSX(
                `Safe for validated address: ${getShortAddress(respCheck.safeChannel.initialOwner)}`,
                respCheck.safeChannel.status,
                respCheck.safeChannel.owners.length,
                respCheck.safeChannel.addresses
            ),
            intents:intents
        })
    }
    else {
        return c.res({
            image: getErrorJSX( `Error finding status of Safe deployment for owner: ${getShortAddress(address!)}`),
            intents:[
                <Button.Reset> Home </Button.Reset>,
                <Button.Link href={DOCUMENTATION_INDIVIDUAL_URL}> Docs </Button.Link>
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
