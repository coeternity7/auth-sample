<script>
    export let data
</script>

<h1>
    Example
</h1>
<h2>
    SvelteKit - Bun SQLite - Drizzle ORM - Lucia OAuth - Twitch.TV as OAuth Provider
</h2>

<a href="/login/twitch">
    <button>
        Log in with Twitch
    </button>
</a>


{#if data.user || data.session}

{data}

{/if}

<style>
    * {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    button {
        padding:1em;
        border:0;
        background-color:rebeccapurple;
        color: white;
        font-size:100%
    }
</style>