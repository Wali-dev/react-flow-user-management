import React, { useState } from 'react';
import { useDnD } from './DnDContext';
import hobbies from '../assets/hobbies';

const DragAndDropSidebar: React.FC = () => {
    const [_, setType] = useDnD();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredHobbies, setFilteredHobbies] = useState<string[]>([]);
    const [selectedHobby, setSelectedHobby] = useState('');

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, hobbyName: string) => {
        setType(nodeType);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', hobbyName);
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
        <div className="w-80 flex flex-col">
            <div className="description m-auto text-center font-serif my-2">Search Hobbies</div>

            <input
                type="text"
                className="input mx-4"
                placeholder="Search hobbies..."
                value={searchTerm}
                onChange={handleSearch}

            />

            {filteredHobbies.length > 0 && (
                <div className="hobby-list mx-6 mt-4">
                    {filteredHobbies.map((hobby) => (
                        <div
                            key={hobby}
                            className="dndnode output h-10"
                            onClick={() => selectHobby(hobby)}
                            onDragStart={(event) => onDragStart(event, 'output', hobby)}
                            draggable
                        >
                            {hobby}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DragAndDropSidebar;