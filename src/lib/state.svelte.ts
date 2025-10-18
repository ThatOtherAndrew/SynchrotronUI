import { type ColorMode, type Edge as EdgeData, type Node as NodeData } from '@xyflow/svelte';
import { type ConnectionState } from '../components/ConnectionIndicator.svelte';

interface AppState {
    nodes: NodeData[];
    edges: EdgeData[];
    connectionState: ConnectionState | null;
    theme: ColorMode;
}

export const appState: AppState = $state({
    nodes: [],
    edges: [],
    connectionState: null,
    theme: 'system',
});
