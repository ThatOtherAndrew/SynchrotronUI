<script>
    import { onMount } from "svelte";
    import { SvelteFlowProvider } from "@xyflow/svelte";
    import Flow from "./components/Flow.svelte";
    import WelcomeModal from "./components/WelcomeModal.svelte";
    import { isFirstVisit, markAsVisited } from "./utils/firstVisit";

    let showWelcomeModal = false;

    onMount(() => {
        if (isFirstVisit()) {
            showWelcomeModal = true;
        }
    });

    function handleWelcomeModalClose() {
        showWelcomeModal = false;
        markAsVisited();
    }
</script>

<main style:height="100vh">
    <SvelteFlowProvider>
        <Flow />
    </SvelteFlowProvider>

    <WelcomeModal
        bind:isOpen={showWelcomeModal}
        on:close={handleWelcomeModalClose}
    />
</main>
