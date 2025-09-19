"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermsBanner = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = require("../buttons/Button");
const TermsBanner = ({ isAccepted, onAccept, acceptedVersion = 'acceptedV1', currentVersion = 'acceptedV1', licenseUrl = 'https://github.com/leo42/BroClanWallet/blob/main/LICENSE', title, message, acceptButtonText = 'I Agree', className = '' }) => {
    // If terms are already accepted and versions match, don't show banner
    if (isAccepted && acceptedVersion === currentVersion) {
        return null;
    }
    const defaultMessage = `By using this software, you agree to be bound by our open source license.`;
    return ((0, jsx_runtime_1.jsx)("div", { className: `terms-banner ${className}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "terms-banner-content", children: [(0, jsx_runtime_1.jsxs)("div", { className: "terms-banner-text", children: [title && (0, jsx_runtime_1.jsx)("h3", { className: "terms-banner-title", children: title }), (0, jsx_runtime_1.jsxs)("p", { className: "terms-banner-message", children: [message || defaultMessage, licenseUrl && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [' ', (0, jsx_runtime_1.jsx)("a", { href: licenseUrl, target: "_blank", rel: "noopener noreferrer", className: "terms-banner-link", children: "View License" })] }))] })] }), (0, jsx_runtime_1.jsx)("div", { className: "terms-banner-actions", children: (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => onAccept(currentVersion), size: "sm", className: "terms-banner-accept-button", children: acceptButtonText }) })] }) }));
};
exports.TermsBanner = TermsBanner;
exports.default = exports.TermsBanner;
//# sourceMappingURL=TermsBanner.js.map