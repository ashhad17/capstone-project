import React from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "@/context/ThemeContext";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}) => {
  const { isDark } = useTheme(); // Access dark mode state

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-4xl",
    full: "max-w-full",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div
            className={`absolute inset-0 ${
              isDark ? "bg-black/75" : "bg-gray-500/75"
            } backdrop-blur-sm`}
          ></div>
        </div>

        {/* This element tricks the browser into centering the modal contents */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal container */}
        <div
          className={`inline-block align-bottom ${
            isDark ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
          } rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full max-h-[90vh]`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {/* Header */}
          {title && (
            <div
              className={`px-6 py-4 border-b sticky top-0 z-10 ${
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-lg leading-6 font-medium ${
                    isDark ? "text-gray-100" : "text-gray-900"
                  }`}
                  id="modal-headline"
                >
                  {title}
                </h3>
                {showCloseButton && (
                  <button
                    type="button"
                    className={`${
                      isDark
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-400 hover:text-gray-500"
                    } focus:outline-none`}
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <X className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Scrollable content area */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;