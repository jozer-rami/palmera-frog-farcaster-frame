import { Button, Frog } from 'frog'
import { handle } from 'frog/vercel'
import { app as channelApp } from './channel.js';
import { app as individualApp } from './individual.js';
import * as dotenv from 'dotenv';

dotenv.config();

export const app = new Frog({
    assetsPath: '/',
    basePath: '/api'
})

app.frame('/', (c) => {
    // FLOW FOR CHANNEL
    if(process.env.APP_TYPE == 'channel'){
        return c.res({
            image: (
                <div style={{ display: 'flex'}}>
                    <img src="https://storage.googleapis.com/farcaster-keyper-dev/Palmera_Frame_HOME.jpg"/>
                </div>
            ),
            intents: [
                <Button action="/channel/create"> Create </Button>,
                <Button action="/channel/join"> Join </Button>,
                <Button action="/channel/check"> Check </Button>
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
            <Button action="/individual/add_address"> Start </Button>,
            <Button action="/individual/check_individual"> Check </Button>
        ],
    })
})

app.route('/channel', channelApp)

app.route('/individual', individualApp)

export const GET = handle(app)
export const POST = handle(app)


