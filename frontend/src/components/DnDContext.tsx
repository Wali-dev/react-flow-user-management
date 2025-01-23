import React, { createContext, useContext, useState } from 'react';

type DnDContextType = [string | null, React.Dispatch<React.SetStateAction<string | null>>];

const DnDContext = createContext<DnDContextType>([null, () => { }]);

export const DnDProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [type, setType] = useState<string | null>(null);

    return (
        <DnDContext.Provider value={[type, setType]}>
            {children}
        </DnDContext.Provider>
    );
};

export default DnDContext;

export const useDnD = () => {
    const context = useContext(DnDContext);
    if (!context) {
        throw new Error('useDnD must be used within a DnDProvider');
    }
    return context;
};