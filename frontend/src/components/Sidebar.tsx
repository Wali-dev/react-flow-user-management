import React, { useState } from 'react';
import { useDnD } from './DnDContext';
import hobbies from '../assets/hobbies';

const DragAndDropSidebar = () => {
    const [_, setType] = useDnD();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredHobbies, setFilteredHobbies] = useState<string[]>([]);
    const [selectedHobby, setSelectedHobby] = useState('');

    const onDragStart = (event, nodeType, hobbyName) => {
        setType(nodeType);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('hobby', hobbyName); // Set the hobby as data for drag
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
        if (value) {
            const results = hobbies.filter((hobby) =>
                hobby.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredHobbies(results);
        } else {
            setFilteredHobbies([]);
        }
    };

    const selectHobby = (hobby: string) => {
        setSelectedHobby(hobby);
        setFilteredHobbies([]);
    };

    return (
        <div className="w-80">
            <div className="description">You can drag these nodes to the left.</div>

            <input
                type="text"
                className="input"
                placeholder="Search hobbies..."
                value={searchTerm}
                onChange={handleSearch}
            />


            {filteredHobbies.length > 0 && (
                <div className="hobby-list">
                    {filteredHobbies.map((hobby) => (
                        <div
                            key={hobby}
                            className="dndnode output"
                            onClick={() => selectHobby(hobby)}
                            onDragStart={(event) => onDragStart(event, 'output', hobby)}
                            draggable
                        >
                            {hobby}
                        </div>
                    ))}
                </div>
            )}

            {/* <div
                className="dndnode output"
                onDragStart={(event) => onDragStart(event, 'output', selectedHobby)}
                draggable
            > */}
            {/* {selectedHobby || 'Output Node'}  Show selected hobby or default */}
        </div>
        // </div>
    );
};

export default DragAndDropSidebar;
