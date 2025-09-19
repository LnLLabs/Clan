"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const clsx_1 = __importDefault(require("clsx"));
const Input = ({ label, error, helperText, fullWidth = false, startAdornment, endAdornment, variant = 'outlined', size = 'medium', className, id, ...props }) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const inputClasses = (0, clsx_1.default)('input-base', {
        'input-outlined': variant === 'outlined',
        'input-filled': variant === 'filled',
        'input-standard': variant === 'standard',
        'input-small': size === 'small',
        'input-medium': size === 'medium',
        'input-large': size === 'large',
        'input-full-width': fullWidth,
        'input-error': !!error,
        'input-with-start-adornment': !!startAdornment,
        'input-with-end-adornment': !!endAdornment
    }, className);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "input-wrapper", children: [label && ((0, jsx_runtime_1.jsx)("label", { htmlFor: inputId, className: "input-label", children: label })), (0, jsx_runtime_1.jsxs)("div", { className: "input-adornment-wrapper", children: [startAdornment && ((0, jsx_runtime_1.jsx)("div", { className: "input-start-adornment", children: startAdornment })), (0, jsx_runtime_1.jsx)("input", { id: inputId, className: inputClasses, ...props }), endAdornment && ((0, jsx_runtime_1.jsx)("div", { className: "input-end-adornment", children: endAdornment }))] }), error && ((0, jsx_runtime_1.jsx)("div", { className: "input-error-text", children: error })), !error && helperText && ((0, jsx_runtime_1.jsx)("div", { className: "input-helper-text", children: helperText }))] }));
};
exports.Input = Input;
exports.default = exports.Input;
//# sourceMappingURL=Input.js.map