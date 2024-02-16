import { db } from "$lib/server/db";
import { lucia } from "$lib/server/auth";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

export const handleDrizzle = async ({event, resolve}) => {
    event.locals.db = db
    migrate(db, {migrationsFolder: "drizzle"})

    return await resolve(event)
}

async function handleLucia({event, resolve}) {
    const sessionID = event.cookies.get(lucia.sessionCookieName);
    if (!sessionID) {
        event.locals.user = null;
        event.locals.session = null;
        return resolve(event)
    }

    const {session, user} = await lucia.validateSession(sessionID);
    if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id)
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        })
    }
    if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path:".",
            ...sessionCookie.attributes
        })
    }
    event.locals.user = user;
    event.locals.session = session;
    return resolve(event)
}

export const handle = sequence(handleDrizzle, handleLucia)