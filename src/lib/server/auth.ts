import { Lucia } from 'lucia'
import { dev } from '$app/environment'

import {DrizzleSQLiteAdapter} from '@lucia-auth/adapter-drizzle'
import { db } from './db'

import { Twitch } from 'arctic'
import { TWITCH_CLIENT, TWITCH_SECRET } from '$env/static/private'
import { sessions, users } from './schema'

const adapter = new DrizzleSQLiteAdapter(db, sessions, users)

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: !dev
        }
    },
    getUserAttributes: (attributes) => {
        return {
            twitchId: attributes.twitch_id,
            twitchUsername: attributes.twitch_username
        }

    }
})

export const twitch = new Twitch(
    TWITCH_CLIENT,
    TWITCH_SECRET,
    "http://localhost:5173/login/twitch/callback"
)

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes
    }
}

interface DatabaseUserAttributes {
    twitch_id: number;
    twitch_username: string;
}