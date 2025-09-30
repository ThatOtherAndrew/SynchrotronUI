<script lang="ts">
    import { Panel } from '@xyflow/svelte';
    import { slide } from 'svelte/transition';
    import { api } from '$lib/api';

    interface Props {
        onreload?: () => void;
    }

    let { onreload }: Props = $props();

    type ConsoleEntry = {
        id: number;
        command: string;
        return: string;
    };

    let consoleHistory: ConsoleEntry[] = $state([]);
    let isConsoleFocused = $state(false);
    let commandInput: HTMLInputElement;
    let currentCommand = $state('');

    function unfocusConsole(event: FocusEvent) {
        const newFocusTarget = event.relatedTarget as HTMLElement;
        const consoleArea = event.currentTarget as HTMLElement;
        if (!consoleArea?.contains(newFocusTarget)) {
            isConsoleFocused = false;
        }
    }

    async function runSynchrolangCommand(event: SubmitEvent) {
        event.preventDefault();

        const target = event.target as HTMLFormElement;
        let command = new FormData(target).get('command') as string;
        currentCommand = '';
        if (command.trim().match(/^demo\w*;?$/g)) {
            // TODO: implement demo
            return;
        }

        try {
            const return_data = await api.execute(command);

            const consoleEntry: ConsoleEntry = {
                id:
                    consoleHistory.length > 0
                        ? consoleHistory[consoleHistory.length - 1].id + 1
                        : 0,
                command: command,
                return: return_data,
            };

            console.log(consoleEntry);
            consoleHistory = [...consoleHistory, consoleEntry];
            onreload?.();
        } catch (err) {
            console.error('Failed to execute command:', err);
        }
    }
</script>

<Panel position="bottom-center">
    <aside onfocusin={() => (isConsoleFocused = true)} onfocusout={unfocusConsole}>
        {#if isConsoleFocused}
            <div transition:slide class="console-history">
                {#each consoleHistory as entry (entry.id)}
                    <button
                        transition:slide
                        class="entry"
                        tabindex="0"
                        onfocus={() => (currentCommand = entry.command)}
                        onclick={() => commandInput.focus()}
                    >
                        <div class="command">{entry.command}</div>
                        <div class="return">{entry.return}</div>
                    </button>
                {/each}
            </div>
        {/if}
        <form onsubmit={runSynchrolangCommand}>
            <input
                bind:this={commandInput}
                bind:value={currentCommand}
                class:active={isConsoleFocused}
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
        max-height: 50vh;
        overflow-y: auto;

        .entry {
            display: block;
            width: 100%;
            text-align: left;
            padding: 0.5rem 1rem;
            font: inherit;
            background: transparent;
            border: 0 solid transparent;
            border-radius: 0.25em;
            cursor: pointer;
            transition:
                background-color 0.2s,
                border-color 0.2s;

            &:hover,
            &:focus {
                background-color: var(--colour-bg-accent);
                border-color: var(--colour-fg-default);
            }
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

        &.active {
            width: 100%;
        }

        &:focus {
            background-color: var(--colour-bg-accent);
        }
    }
</style>
