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
            // Create parent user nodes
            const userNodes = users.map((user, index) => ({
                id: `user-${index + 1}`,
                type: 'input',
                data: {
                    label: `${user.username}, ${user.age}`,
                    userId: user.id,
                    username: user.username,
                    age: user.age,
                    hobbies: [...user.hobbies],
                },
                position: { x: 250 + index * 300, y: 50 }, // Adjust spacing for user nodes
            }));

            const hobbyNodes = users.flatMap((user, userIndex) =>
                user.hobbies.map((hobby, hobbyIndex) => ({
                    id: `user-${userIndex + 1}-hobby-${hobbyIndex + 1}`,
                    type: 'default', // You can use a different type if needed
                    data: { label: hobby },
                    position: {
                        x: 250 + userIndex * 300 + (hobbyIndex % 2 === 0 ? -100 : 100), // Left (-100) or Right (+100)
                        y: 150 + Math.floor(hobbyIndex / 2) * 100 + (hobbyIndex % 2 !== 0 ? 50 : 0), // Right nodes are 50px lower
                    },
                }))
            );
            const hobbyNodesWithEdges = users.flatMap((user, userIndex) => {
                const userNodeId = `user-${userIndex + 1}`;

                // Create hobby nodes
                const userHobbyNodes = user.hobbies.map((hobby, hobbyIndex) => ({
                    id: `user-${userIndex + 1}-hobby-${hobbyIndex + 1}`,
                    type: 'default',
                    data: { label: hobby },
                    position: {
                        x: 250 + userIndex * 300 + (hobbyIndex % 2 === 0 ? -100 : 100),
                        y: 150 + Math.floor(hobbyIndex / 2) * 100 + (hobbyIndex % 2 !== 0 ? 50 : 0),
                    },
                }));

                // Create edges connecting user to hobbies
                const userHobbyEdges = userHobbyNodes.map((hobbyNode) => ({
                    id: `edge-${userNodeId}-${hobbyNode.id}`,
                    source: userNodeId,
                    target: hobbyNode.id,
                }));

                return {
                    nodes: userHobbyNodes,
                    edges: userHobbyEdges
                };
            });

            // Combine and set nodes and edges
            const initialNodes = [...userNodes, ...hobbyNodesWithEdges.flatMap(item => item.nodes)];
            const initialEdges = [...hobbyNodesWithEdges.flatMap(item => item.edges)];

            setNodes(initialNodes);
            setEdges(initialEdges);

            // Combine user and hobby nodes

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

            if (!type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            console.log(position)
            const hobbyName = event.dataTransfer.getData('text/plain');

            // Find the specific user node being targeted
            const targetNode = nodes.find(node =>
                node.type === 'input' &&
                node.position.x <= position.x &&
                node.position.x + 100 >= position.x &&
                node.position.y <= position.y &&
                node.position.y + 50 >= position.y
            );

            if (targetNode && hobbyName) {
                // Add hobby specifically to this user
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

            // Existing node creation logic
            const newNode = {
                id: getId(),
                type,
                position,
                data: { label: hobbyName || `${type} node` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, type, nodes]
    );

    const [selectedUser, setSelectedUser] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [editAge, setEditAge] = useState('');

    const handleNodeClick = (event, node) => {
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
            // Refresh users or update local state
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }
        console.log(selectedUser.userId)
    };

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleDeleteConfirmation = () => {
        setShowConfirmDialog(true);
    };

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

    const cancelDelete = () => {
        setShowConfirmDialog(false);
    };


    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newAge, setNewAge] = useState('');

    const addUser = async () => {
        try {
            await axios.post(`${url}users`, {
                username: newUsername,
                age: newAge.toString(),
                hobbies: []

            });
            console.log(newUsername, newAge)
            fetchUsers();
            // Reset add user state
            setNewUsername('');
            setNewAge('');
            setIsAddingUser(false);
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    // const TopBar = () => {
    //     return (
    //         <div className='bg-blue-500 h-16 flex items-center justify-between p-4'>
    //             {selectedUser ? (
    //                 <div className='flex space-x-4'>
    //                     <input
    //                         value={editUsername}
    //                         onChange={(e) => setEditUsername(e.target.value)}
    //                         placeholder="Username"
    //                         className="input"
    //                     />
    //                     <input
    //                         value={editAge}
    //                         onChange={(e) => setEditAge(e.target.value)}
    //                         placeholder="Age"
    //                         type="number"
    //                         className="input"
    //                     />
    //                     <button onClick={updateUser} className="btn bg-green-500">Update</button>
    //                     <button onClick={handleDeleteConfirmation} className="btn bg-red-500">Delete</button>
    //                 </div>
    //             ) : (
    //                 <span>Select a user node to edit</span>
    //             )}
    //         </div>
    //     );
    // };

    const TopBar = () => {
        return (
            <div className='bg-blue-500 h-16 flex items-center justify-between p-4'>
                {isAddingUser ? (
                    <div className='flex space-x-4'>
                        <input
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="New Username"
                            className="input"
                        />
                        <input
                            value={newAge}
                            onChange={(e) => setNewAge(e.target.value)}
                            placeholder="New Age"
                            type="number"
                            className="input"
                        />
                        <button onClick={addUser} className="btn bg-green-500">Add</button>
                        <button
                            onClick={() => {
                                setIsAddingUser(false);
                                setNewUsername('');
                                setNewAge('');
                            }}
                            className="btn bg-gray-500"
                        >
                            Cancel
                        </button>
                    </div>
                ) : selectedUser ? (
                    <div className='flex space-x-4'>
                        <input
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            placeholder="Username"
                            className="input"
                        />
                        <input
                            value={editAge}
                            onChange={(e) => setEditAge(e.target.value)}
                            placeholder="Age"
                            type="number"
                            className="input"
                        />
                        <button onClick={updateUser} className="btn bg-green-500">Update</button>
                        <button onClick={handleDeleteConfirmation} className="btn bg-red-500">Delete</button>
                    </div>
                ) : (
                    <div className='flex space-x-4'>
                        <span>Select a user node to edit</span>
                        <button
                            onClick={() => setIsAddingUser(true)}
                            className="btn bg-green-500"
                        >
                            Add User
                        </button>
                    </div>
                )}
            </div>
        );
    };

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
                                        onClick={cancelDelete}
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
