import type { OnConnect, OnDelete } from '@xyflow/svelte';
import { api, type Connection } from './api';

export const handleConnect: OnConnect = async (connection) => {
    if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
        return;
    }

    const apiConnection: Connection = {
        source: {
            node_name: connection.source,
            port_name: connection.sourceHandle
        },
        sink: {
            node_name: connection.target,
            port_name: connection.targetHandle
        }
    };

    try {
        await api.addConnection(apiConnection);
        await api.loadGraph();
    } catch (err) {
        console.error('Failed to add connection:', err);
    }
};

export const handleDelete: OnDelete = async ({ nodes, edges }) => {
    try {
        // Delete nodes first
        for (const node of nodes) {
            await api.removeNode(node.id);
        }

        // Only delete edges where BOTH endpoints are NOT being deleted
        // (edges connected to deleted nodes are auto-removed by the server)
        const deletedNodeIds = new Set(nodes.map(n => n.id));
        const edgesToDelete = edges.filter(edge =>
            !deletedNodeIds.has(edge.source) && !deletedNodeIds.has(edge.target)
        );

        for (const edge of edgesToDelete) {
            if (!edge.source || !edge.target || !edge.sourceHandle || !edge.targetHandle) {
                continue;
            }

            const apiConnection: Connection = {
                source: {
                    node_name: edge.source,
                    port_name: edge.sourceHandle
                },
                sink: {
                    node_name: edge.target,
                    port_name: edge.targetHandle
                }
            };

            await api.removeConnection(apiConnection);
        }

        await api.loadGraph();
    } catch (err) {
        console.error('Failed to delete nodes/edges:', err);
    }
};
