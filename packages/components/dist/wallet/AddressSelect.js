"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressSelect = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const AddressSelect = ({ wallet, selectedAddress, onAddressChange, showAll = true, setName = false, onSetDefaultAddress, onChangeAddressName, className = '' }) => {
    const [fundedAddresses, setFundedAddresses] = react_1.default.useState([]);
    const [defaultAddress, setDefaultAddress] = react_1.default.useState('');
    const [addressNames, setAddressNames] = react_1.default.useState({});
    react_1.default.useEffect(() => {
        const loadWalletData = async () => {
            try {
                if (wallet.getFundedAddress) {
                    const addresses = await wallet.getFundedAddress();
                    setFundedAddresses(addresses);
                }
                if (wallet.getDefaultAddress) {
                    const defaultAddr = await wallet.getDefaultAddress();
                    setDefaultAddress(defaultAddr);
                }
                if (wallet.getAddressNames) {
                    const names = await wallet.getAddressNames();
                    setAddressNames(names);
                }
            }
            catch (error) {
                console.error('Failed to load wallet data:', error);
            }
        };
        loadWalletData();
    }, [wallet]);
    const getAddressDisplayName = (address) => {
        const name = addressNames[address];
        if (name)
            return name;
        // If no name, show truncated address
        return `${address.slice(0, 8)}...${address.slice(-8)}`;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `address-select-container ${className}`, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("select", { className: "addressSelect", value: selectedAddress, onChange: (event) => onAddressChange(event.target.value), children: [showAll && (0, jsx_runtime_1.jsx)("option", { value: "", children: "All" }), fundedAddresses.map((address, index) => ((0, jsx_runtime_1.jsx)("option", { value: address, children: getAddressDisplayName(address) }, index)))] }), selectedAddress && selectedAddress !== defaultAddress && onSetDefaultAddress && ((0, jsx_runtime_1.jsx)("button", { className: "defaultButton", onClick: () => onSetDefaultAddress(selectedAddress), children: "Make Default" }))] }), setName && selectedAddress && selectedAddress !== '' && selectedAddress !== wallet.getAddress() && ((0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Name", onChange: (event) => onChangeAddressName?.(selectedAddress, event.target.value), className: "address-name-input" }))] }));
};
exports.AddressSelect = AddressSelect;
exports.default = exports.AddressSelect;
//# sourceMappingURL=AddressSelect.js.map