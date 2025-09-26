<script>
    import { Background, Controls, MiniMap, SvelteFlow } from '@xyflow/svelte';
    import '@xyflow/svelte/dist/base.css';
    import '../app.css';
    import Node from '../components/Node.svelte';
    import { writable } from 'svelte/store';

    let nodes = $state.raw([
        {
            id: 'a',
            type: 'synchrotron_node',
            data: {
                nodeData: writable({
                    name: 'foo',
                    type: 'FooNode',
                    inputs: [
                        {
                            node_name: 'FooNode',
                            port_name: 'in',
                            type: 'bleh',
                            source: null,
                        },
                    ],
                    outputs: [
                        {
                            node_name: 'FooNode',
                            port_name: 'out',
                            type: 'bleh',
                            sinks: null,
                        },
                    ],
                    exports: {
                        bar: 'baz',
                    },
                }),
            },
            position: { x: 0, y: 0 },
        },
    ]);
</script>

<main>
    <SvelteFlow bind:nodes nodeTypes={{ synchrotron_node: Node }}>
        <Background />
        <Controls />
        <MiniMap />
    </SvelteFlow>
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
    }
</style>
