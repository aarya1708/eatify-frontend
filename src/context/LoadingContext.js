import { createContext, useState, useContext } from "react";

// Create Context
const LoadingContext = createContext();

// Provider Component
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () =>{
    // console.log("🔄 Loading Started");
    setIsLoading(true);}
  const stopLoading = () => {
    // console.log("✅ Loading Stopped");
    setIsLoading(false);}

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Custom Hook to use loading state
export const useLoading = () => useContext(LoadingContext);
