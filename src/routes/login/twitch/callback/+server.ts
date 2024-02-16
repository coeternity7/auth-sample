import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { twitch, lucia } from "$lib/server/auth";

import type { RequestEvent } from "@sveltejs/kit";

import {TWITCH_CLIENT} from '$env/static/private'
import { users } from "$lib/server/schema";
import { eq } from "drizzle-orm";

export async function GET(event:RequestEvent): Promise<Response> {
    const code = event.url.searchParams.get("code")
    const state = event.url.searchParams.get("state")
    const storedState = event.cookies.get("twitch_oauth_state") ?? null

    if (!code || !state || !storedState || state !== storedState) {
        return new Response(null, {
            status:400
        })
    }

    try {
        const tokens = await twitch.validateAuthorizationCode(code)
        const twitchUserResponse = await fetch("https://api.twitch.tv/helix/users", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
                "Client-Id": TWITCH_CLIENT
            }
        })

        const twitchUser = await twitchUserResponse.json()

        const existingUser = await event.locals.db.select().from(users).where(eq(users.twitch_id, twitchUser.id))

        if (existingUser) {
            const session = await lucia.createSession(existingUser.id, {})
            const sessionCookie = lucia.createSessionCookie(session.id)
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            })
        } else {
            const userId = generateId(15);

            await event.locals.db.insert(users).values({
                id: userId,
                twitch_id: twitchUser.id,
                twitch_username: twitchUser.login
            })

            const session = await lucia.createSession(userId, {})
            const sessionCookie = lucia.createSessionCookie(session.id)
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            })
        }

        return new Response(null, {
            status: 302,
            headers: {
                Location: "/"
            }
        })

    } catch (e) {
        console.log(e)
        if (e instanceof OAuth2RequestError) {
            return new Response(null, {
                status:400
            })
        }
        return new Response(null, {
            status:500
        })
    }
}

interface TwitchUser {
    id: number;
    login: string
}