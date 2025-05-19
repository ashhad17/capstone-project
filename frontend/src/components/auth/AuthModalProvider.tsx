
import React, { createContext, useState, useContext, ReactNode } from 'react';
import AuthModal from './AuthModal';

interface AuthModalContextType {
  isOpen: boolean;
  openModal: (view?: "login" | "signup") => void;
  closeModal: () => void;
  defaultView?: "login" | "signup"; // Added defaultView to the context
}

const AuthModalContext = createContext<AuthModalContextType>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
  defaultView: "login"
});

export const useAuthModal = () => useContext(AuthModalContext);

interface AuthModalProviderProps {
  children: ReactNode;
}

export const AuthModalProvider: React.FC<AuthModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultView, setDefaultView] = useState<"login" | "signup">("login");

  const openModal = (view: "login" | "signup" = "login") => {
    setDefaultView(view);
    setIsOpen(true);
  };
  
  const closeModal = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal, defaultView }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={closeModal} defaultView={defaultView} />
    </AuthModalContext.Provider>
  );
};
