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


    type Node,
    type Edge,

} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import Sidebar from './Sidebar';
import { DnDProvider, useDnD } from './DnDContext';

interface User {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
}

const url = import.meta.env.VITE_API_URL_V1;

const DnDFlow: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();
    const [type] = useDnD();

    const fetchUsers = async (): Promise<void> => {
        try {
            const response = await axios.get<{ data: User[] }>(`${url}users`);
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
            const userNodes: Node[] = users.map((user, index) => ({
                id: `user-${index + 1}`,
                type: 'input',
                data: {
                    label: `${user.username}, ${user.age}`,
                    userId: user.id,
                    username: user.username,
                    age: user.age,
                    hobbies: user.hobbies,
                },
                position: { x: 250 + index * 300, y: 50 },
            }));

            const userHobbyData = users.flatMap((user, userIndex) => {
                const userNodeId = `user-${userIndex + 1}`;
                const userHobbyNodes: Node[] = user.hobbies.map((hobby, hobbyIndex) => ({
                    id: `user-${userIndex + 1}-hobby-${hobbyIndex + 1}`,
                    type: 'default',
                    data: { label: hobby },
                    position: {
                        x: 250 + userIndex * 300 + (hobbyIndex % 2 === 0 ? -100 : 100),
                        y: 150 + Math.floor(hobbyIndex / 2) * 100 + (hobbyIndex % 2 !== 0 ? 50 : 0),
                    },
                }));

                const userHobbyEdges: Edge[] = userHobbyNodes.map((hobbyNode) => ({
                    id: `edge-${userNodeId}-${hobbyNode.id}`,
                    source: userNodeId,
                    target: hobbyNode.id,
                }));

                return { nodes: userHobbyNodes, edges: userHobbyEdges };
            });

            const initialNodes = [...userNodes, ...userHobbyData.flatMap(item => item.nodes)];
            const initialEdges = [...userHobbyData.flatMap(item => item.edges)];

            setNodes(initialNodes);
            setEdges(initialEdges);
        }
    }, [users, setNodes]);

    const onConnect = useCallback(
        (params: Edge) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            if (!type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const hobbyName = event.dataTransfer.getData('text/plain');
            const targetNode = nodes.find(node =>
                node.type === 'input' &&
                node.position.x <= position.x &&
                node.position.x + 100 >= position.x &&
                node.position.y <= position.y &&
                node.position.y + 50 >= position.y
            );

            if (targetNode && hobbyName) {
                const addHobbyToUser = async () => {
                    try {
                        await axios.patch(`${url}users/${targetNode.data.userId}`, {
                            hobbies: [...targetNode.data.hobbies, hobbyName]
                        });
                        fetchUsers();
                    } catch (error) {
                        console.error('Error adding hobby:', error);
                    }
                };
                addHobbyToUser();
                return;
            }

            const newNode: Node = {
                id: `node-${Math.random()}`,
                type,
                position,
                data: { label: hobbyName || `${type} node` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, type, nodes]
    );

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editUsername, setEditUsername] = useState('');
    const [editAge, setEditAge] = useState('');
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newAge, setNewAge] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleNodeClick = (event: React.MouseEvent, node: Node) => {
        if (node.type === 'input') {
            setSelectedUser(node.data);
            setEditUsername(node.data.username);
            setEditAge(node.data.age);
        }
    };

    const updateUser = async () => {
        if (!selectedUser) return;
        try {
            await axios.patch(`${url}users/${selectedUser.userId}`, {
                username: editUsername,
                age: editAge.toString()
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleDeleteConfirmation = () => setShowConfirmDialog(true);

    const confirmDelete = async () => {
        if (!selectedUser) return;
        try {
            await axios.delete(`${url}users/${selectedUser.userId}`);
            fetchUsers();
            setSelectedUser(null);
            setShowConfirmDialog(false);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const addUser = async () => {
        try {
            await axios.post(`${url}users`, {
                username: newUsername,
                age: newAge.toString(),
                hobbies: []
            });
            fetchUsers();
            setNewUsername('');
            setNewAge('');
            setIsAddingUser(false);
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const TopBar: React.FC = () => (
        <div className='bg-slate-300 h-16 flex items-center justify-between p-4'>
            {isAddingUser ? (
                <div className='flex space-x-4 mx-auto my-auto'>
                    <input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="New Username"
                        className="input input-sm"
                    />
                    <input
                        value={newAge}
                        onChange={(e) => setNewAge(e.target.value)}
                        placeholder="New Age"
                        type="number"
                        className="input input-sm"
                    />
                    <div className='flex space-x-1 m-auto'>
                        <button onClick={addUser} className="btn btn-sm  btn-accent w-20">Add</button>
                        <button
                            onClick={() => {
                                setIsAddingUser(false);
                                setNewUsername('');
                                setNewAge('');
                            }}
                            className="btn btn-sm btn-error"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : selectedUser ? (
                <div className='flex space-x-4 mx-auto my-auto'>
                    <input
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="Username"
                        className="input input-sm"
                    />
                    <input
                        value={editAge}
                        onChange={(e) => setEditAge(e.target.value)}
                        placeholder="Age"
                        type="number"
                        className="input input-sm"
                    />
                    <div className='space-x-1 m-auto'>
                        <button onClick={updateUser} className="btn btn-sm btn-accent">Update</button>
                        <button onClick={handleDeleteConfirmation} className="btn btn-sm btn-error">Delete</button>
                    </div>

                </div>
            ) : (
                <div className='flex m-auto gap-20 mx-auto'>
                    <span className='m-auto font-serif'>Select a user node to edit</span>
                    <button
                        onClick={() => setIsAddingUser(true)}
                        className="btn btn-sm btn-accent"
                    >
                        Add User
                    </button>
                </div>
            )}
        </div>
    );

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
                    onNodeClick={handleNodeClick}
                    fitView
                    style={{ backgroundColor: '#F7F9FB' }}
                >
                    {showConfirmDialog && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-xl">
                                <h2 className="text-xl mb-4">Confirm Deletion</h2>
                                <p>Are you sure you want to delete this user?</p>
                                <div className="flex justify-end space-x-4 mt-4">
                                    <button
                                        onClick={() => setShowConfirmDialog(false)}
                                        className="btn bg-gray-300 text-black"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="btn bg-red-500 text-white"
                                    >
                                        Sure
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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