<script lang="ts">
    import { Panel } from "@xyflow/svelte";
    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";

    const dispatch = createEventDispatcher();

    type ConsoleEntry = {
        command: string;
        return: string;
    };

    let consoleHistory: ConsoleEntry[] = [];
    let isConsoleFocused = false;

    async function runSynchrolangCommand(event: SubmitEvent) {
        const target = event.target as HTMLFormElement;
        let command = new FormData(target).get("command") as string;
        target.reset();
        if (command.trim().match(/^demo\w*;?$/g)) {
            dispatch("demo");
            return;
        }

        const response = await fetch("http://localhost:2031/execute", {
            method: "POST",
            body: command,
        });
        const return_data = await response.json();

        const consoleEntry: ConsoleEntry = {
            command: command,
            return: return_data,
        };
        console.log(consoleEntry);
        consoleHistory = [...consoleHistory, consoleEntry];

        dispatch("reload");
    }
</script>

<Panel position="bottom-center">
    <aside>
        {#if isConsoleFocused}
            <div transition:slide class="console-history">
                {#each consoleHistory as entry}
                    <div transition:slide class="entry">
                        <div class="command">{entry.command}</div>
                        <div class="return">{entry.return}</div>
                    </div>
                {/each}
            </div>
        {/if}
        <form on:submit|preventDefault={runSynchrolangCommand}>
            <input
                on:focus={() => (isConsoleFocused = true)}
                on:blur={() => (isConsoleFocused = false)}
                type="text"
                name="command"
                placeholder="Send a Synchrolang command..."
            />
            <input type="submit" hidden />
        </form>
    </aside>
</Panel>

<style lang="scss">
    aside {
        color: var(--colour-fg-default);
        width: 50vw;
    }

    .console-history {
        margin-bottom: 1rem;

        .entry {
            margin: 0.5rem 0;
        }

        .command {
            color: dodgerblue;
        }

        .return {
            color: var(--colour-fg-muted);
        }
    }

    form {
        display: flex;
        justify-content: center;
    }

    input {
        font-family: inherit;
        font-size: 1rem;
        width: 20em;
        color: inherit;
        background-color: var(--colour-bg-default);
        padding: 0.5em 1em;
        border: 3px solid var(--colour-fg-muted);
        border-radius: 0.5em;
        transition:
            width 0.5s cubic-bezier(0, 0, 0.2, 1),
            background-color 0.5s ease;
    }

    input:focus {
        background-color: var(--colour-bg-accent);
        width: 100%;
    }
</style>
