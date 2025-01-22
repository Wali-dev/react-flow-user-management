import React, { useRef, useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import {
    ReactFlow,
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    useReactFlow,
    Background,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import Sidebar from './Sidebar';
import { DnDProvider, useDnD } from './DnDContext';

const url = import.meta.env.VITE_API_URL_V1;

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
    const [users, setUsers] = useState([]);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const reactFlowWrapper = useRef(null);
    const { screenToFlowPosition } = useReactFlow();
    const [type] = useDnD();

    const fetchUsers = async (): Promise<void> => {
        try {
            const response = await axios.get(`${url}users`);
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (users.length > 0) {
            const initialNodes = users.map((user, index) => ({
                id: (index + 1).toString(),
                type: 'input',
                data: { label: user.username },
                position: { x: 250 + index * 200, y: 50 },
            }));
            setNodes(initialNodes);
        }
    }, [users, setNodes]);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            if (!type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            const newNode = {
                id: getId(),
                type,
                position,
                data: { label: `${type} ` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, type],
    );

    const TopBar = () => {
        return (
            <div className='bg-blue-500 h-16 text-center'>
                This is the right bar
            </div>
        );
    }

    return (
        <div className="dndflow">
            <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                <TopBar />
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    fitView
                    style={{ backgroundColor: '#F7F9FB' }}
                >
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>
            <Sidebar />
        </div>
    );
};

export default () => (
    <ReactFlowProvider>
        <DnDProvider>
            <DnDFlow />
        </DnDProvider>
    </ReactFlowProvider>
);
