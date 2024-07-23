<script>
    import { SvelteFlowProvider } from '@xyflow/svelte';
    import Flow from './components/Flow.svelte';
</script>

<main style:height="100vh">
    <SvelteFlowProvider>
        <Flow />
    </SvelteFlowProvider>
</main>
