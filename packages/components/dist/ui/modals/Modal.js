"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const clsx_1 = __importDefault(require("clsx"));
const Modal = ({ isOpen, onClose, title, children, size = 'md', closeOnOverlayClick = true, closeOnEscape = true, className }) => {
    (0, react_1.useEffect)(() => {
        const handleEscape = (event) => {
            if (closeOnEscape && event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, closeOnEscape]);
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity", onClick: closeOnOverlayClick ? onClose : undefined }), (0, jsx_runtime_1.jsxs)("div", { className: (0, clsx_1.default)('inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle', sizeClasses[size], 'w-full', className), children: [title && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between border-b border-gray-200 px-6 py-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900", children: title }), (0, jsx_runtime_1.jsxs)("button", { type: "button", className: "text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2", onClick: onClose, children: [(0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Close" }), (0, jsx_runtime_1.jsx)("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })] })] })), (0, jsx_runtime_1.jsx)("div", { className: "px-6 py-4", children: children })] })] }) }));
};
exports.Modal = Modal;
exports.default = exports.Modal;
//# sourceMappingURL=Modal.js.map