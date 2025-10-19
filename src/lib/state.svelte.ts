import { type ColorMode, type Edge as EdgeData, type Node as NodeData } from '@xyflow/svelte';
import { type ConnectionState } from '../components/ConnectionIndicator.svelte';

interface AppState {
    serverUrl: string;
    nodes: NodeData[];
    edges: EdgeData[];
    connectionState: ConnectionState | null;
    theme: ColorMode;
}

export const appState: AppState = $state({
    serverUrl: 'http://localhost:2031',
    nodes: [],
    edges: [],
    connectionState: null,
    theme: 'system',
});
