<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let isOpen = false;

    function closeModal() {
        isOpen = false;
        dispatch('close');
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        on:click={handleBackdropClick}
        on:keydown={handleKeydown}
    >
        <div class="modal">
            <div class="modal-header">
                <h2>Welcome to SynchrotronUI!</h2>
                <button class="close-button" on:click={closeModal} aria-label="Close"> × </button>
            </div>

            <div class="modal-body">
                <div class="video-container">
                    <iframe
                        src="https://www.youtube.com/embed/txflkMDjk4A"
                        title="YouTube video player"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen
                    ></iframe>
                </div>
                <p>
                    SynchrotronUI is a graphical editor for the
                    <a href="https://github.com/ThatOtherAndrew/Synchrotron" target="_blank"
                        >Synchrotron</a
                    >
                    node-based audio engine.
                </p>
                <p>Here's how to quickly get started:</p>
                <ol>
                    <li>
                        <b>Run synchrotron-server</b> locally in your terminal:
                        <!-- prettier-ignore -->
                        <code>
                            $ pip install synchrotron
                            $ synchrotron-server
                        </code>
                        This should change the connection state in the top right from
                        <span style="color: red">Disconnected</span>
                        to <span style="color: green">Connected</span>.
                        <br /> <br />
                        (Yes, it seems odd that I'm asking you to install something to run what looks
                        like a browser tool, but Synchrotron doesn't run in the browser!)
                    </li>
                    <li>
                        Once you're connected, type <b>demo</b> into the bottom console to load a demo
                        graph.
                    </li>
                    <li>
                        Hit <b>Start</b> in the top right (or use the
                        <i>start</i> command in the console) to hear the graph!
                    </li>
                    <li>
                        Tinker about with the graph! Load up another
                        <a
                            href="https://github.com/ThatOtherAndrew/Synchrotron/tree/main/examples"
                            target="_blank">example project</a
                        >, edit the links in the graph, or create some new nodes with e.g.
                        <i>new SineNode</i>.
                    </li>
                </ol>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal {
        background: var(--colour-bg-default);
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        max-width: 1000px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 2px solid var(--colour-bg-accent);
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--colour-fg-default);
    }

    .close-button {
        background: none;
        border: none;
        font-size: 2rem;
        color: var(--colour-fg-default);
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition:
            color 0.2s,
            background-color 0.2s;
    }

    .close-button:hover {
        background-color: white;
    }

    .modal-body {
        padding: 1.5rem;
        color: var(--colour-fg-default);
        line-height: 1.6;
    }

    .modal-body p {
        margin-bottom: 1rem;
    }

    .modal-body ol {
        margin: 1rem 0;
        padding-left: 1.5rem;
    }

    .modal-body li {
        margin-bottom: 2rem;
    }

    code {
        background-color: var(--colour-bg-accent);
        color: var(--colour-fg-default);
        padding: 0.75rem 1rem;
        border-radius: 4px;
        display: block;
        white-space: pre-line;
        margin: 0.5rem 0;
        font-size: 0.9rem;
        line-height: 1.4;
    }

    .video-container {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 56.25%; /* 16:9 aspect ratio */
        margin: 1rem 0 2rem 0;
        border-radius: 8px;
        overflow: hidden;
    }

    .video-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
    }

    @media (min-width: 768px) {
        .video-container {
            max-width: 700px;
            margin: 1rem auto 2rem auto;
        }
    }

    @media (min-width: 1024px) {
        .video-container {
            max-width: 800px;
        }
    }
</style>
