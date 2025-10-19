<script lang="ts">
    import { Panel } from '@xyflow/svelte';
    import { slide } from 'svelte/transition';
    import { api } from '$lib/api';

    type ConsoleEntry = {
        id: number;
        command: string;
        return: string;
    };

    let consoleHistory: ConsoleEntry[] = $state([]);
    let isConsoleFocused = $state(false);
    let commandInput: HTMLInputElement;
    let currentCommand = $state('');
    let historyIndex = $state(-1);
    // svelte-ignore non_reactive_update
    let historyContainer: HTMLDivElement;
    let savedCommand = $state('');
    let scrollTop = $state(0);

    // Gradually fade in transparency mask over first 50px of scroll
    let maskGradient = $derived.by(() => {
        const fadeDistance = 50;
        const scrollRatio = Math.min(scrollTop / fadeDistance, 1);
        const startAlpha = 1 - scrollRatio;
        return `linear-gradient(to bottom, rgba(0,0,0,${startAlpha}) 0%, black 30%)`;
    });

    function handleScroll(event: Event) {
        scrollTop = (event.target as HTMLDivElement).scrollTop;
    }

    function unfocusConsole(event: FocusEvent) {
        const newFocusTarget = event.relatedTarget as HTMLElement;
        const consoleArea = event.currentTarget as HTMLElement;
        if (!consoleArea?.contains(newFocusTarget)) {
            isConsoleFocused = false;
        }
    }

    function smoothScrollToEntry(index: number | 'bottom') {
        if (!historyContainer) return;

        if (index === 'bottom') {
            // Keep anchored to bottom during animation
            const scrollToBottom = () => {
                historyContainer.scrollTop = historyContainer.scrollHeight;
            };

            // Scroll immediately and continuously during animation
            scrollToBottom();
            const interval = setInterval(scrollToBottom, 16); // ~60fps
            setTimeout(() => clearInterval(interval), 300);
        } else {
            queueMicrotask(() => {
                const entry = historyContainer.children[index] as HTMLElement;
                entry?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        }
    }

    // Scroll to bottom when new command is added
    $effect(() => {
        if (consoleHistory.length > 0) {
            smoothScrollToEntry('bottom');
        }
    });

    // Scroll to selected entry when navigating with arrow keys
    $effect(() => {
        if (historyIndex >= 0) {
            const selectedIndex = consoleHistory.length - 1 - historyIndex;
            smoothScrollToEntry(selectedIndex);
        }
    });

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (historyIndex === -1) {
                savedCommand = currentCommand;
            }
            if (historyIndex < consoleHistory.length - 1) {
                historyIndex++;
                currentCommand = consoleHistory[consoleHistory.length - 1 - historyIndex].command;
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                currentCommand = consoleHistory[consoleHistory.length - 1 - historyIndex].command;
            } else if (historyIndex === 0) {
                historyIndex = -1;
                currentCommand = savedCommand;
                savedCommand = '';
            }
        }
    }

    function handleInput() {
        if (historyIndex !== -1) {
            savedCommand = currentCommand;
            historyIndex = -1;
        }
    }

    async function runSynchrolangCommand(event: SubmitEvent) {
        event.preventDefault();

        const target = event.target as HTMLFormElement;
        let command = new FormData(target).get('command') as string;
        currentCommand = '';
        historyIndex = -1;
        savedCommand = '';
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
            api.loadGraph();
        } catch (err) {
            console.error('Failed to execute command:', err);
        }
    }
</script>

<Panel position="bottom-center">
    <aside onfocusin={() => (isConsoleFocused = true)} onfocusout={unfocusConsole}>
        {#if isConsoleFocused}
            <div
                bind:this={historyContainer}
                transition:slide
                class="console-history"
                onscroll={handleScroll}
                style="mask-image: {maskGradient}"
            >
                {#each consoleHistory as entry, index (entry.id)}
                    <button
                        transition:slide
                        class="entry"
                        class:selected={historyIndex === consoleHistory.length - 1 - index}
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
                onkeydown={handleKeyDown}
                oninput={handleInput}
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
        scrollbar-width: none;
        position: relative;

        &::-webkit-scrollbar {
            display: none;
        }

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

            &.selected {
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
