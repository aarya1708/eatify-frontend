import React, { createContext, useState } from 'react';

export const PrevOrderContext = createContext();

export const PrevOrderProvider = ({ children }) => {
    const [prevOrder, setprevOrder] = useState({});

    return (
        <PrevOrderContext.Provider value={{ prevOrder, setprevOrder }}>
            {children}
        </PrevOrderContext.Provider>
    );
};