"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receive = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const framework_helpers_1 = require("@clan/framework-helpers");
const Receive = ({ wallet, donationAddress = 'addr1q9jae9tlky2gw97hxqkrdm5lu0qlasrzw5u5ju9acpazk3ev94h8gqswgsgfp59e4v0z2dapyamyctfeyzykr97pajdq0nanuq', onAddressCopy, className = '' }) => {
    const [address, setAddress] = react_1.default.useState(wallet.getAddress());
    const [defaultAddress, setDefaultAddress] = react_1.default.useState('');
    const [newStake, setNewStake] = react_1.default.useState(false);
    const [options, setOptions] = react_1.default.useState([]);
    const [optionsNames, setOptionsNames] = react_1.default.useState({});
    const [isValidAddress, setIsValidAddress] = react_1.default.useState(true);
    const canvasRef = (0, react_1.useRef)(null);
    // Dynamically import QRCode to avoid SSR issues
    const [QRCode, setQRCode] = react_1.default.useState(null);
    (0, react_1.useEffect)(() => {
        const loadWalletData = async () => {
            try {
                let selectedAddress = wallet.getAddress();
                if (wallet.getDefaultAddress) {
                    const defaultAddr = await wallet.getDefaultAddress();
                    setDefaultAddress(defaultAddr);
                    if (defaultAddr && defaultAddr !== '') {
                        selectedAddress = defaultAddr;
                    }
                }
                setAddress(selectedAddress);
                if (wallet.getFundedAddress) {
                    const fundedAddresses = await wallet.getFundedAddress();
                    setOptions(fundedAddresses);
                    if (wallet.getAddressNames) {
                        const addressNames = await wallet.getAddressNames();
                        setOptionsNames(addressNames);
                    }
                }
            }
            catch (error) {
                console.error('Failed to load wallet data:', error);
            }
        };
        loadWalletData();
        Promise.resolve().then(() => __importStar(require('qrcode'))).then((module) => {
            setQRCode(module.default);
        }).catch((error) => {
            console.warn('QRCode library not available:', error);
        });
    }, [wallet]);
    const handleClick = async (value) => {
        if (isValidAddress) {
            const success = await (0, framework_helpers_1.copyToClipboard)(value);
            if (success !== undefined) {
                (0, framework_helpers_1.showInfo)('Address copied to clipboard!');
                onAddressCopy?.(value);
            }
        }
    };
    (0, react_1.useEffect)(() => {
        if (QRCode && canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, isValidAddress ? address : ' ', (error) => {
                if (error)
                    console.error(error);
            });
        }
    }, [address, QRCode, isValidAddress]);
    const handleStakingChange = (event) => {
        const value = event.target.value;
        if (value === 'new') {
            setNewStake(true);
            setIsValidAddress(false);
            setAddress('Enter an address of the wallet that will receive the rewards');
        }
        else {
            setNewStake(false);
            setIsValidAddress(true);
            try {
                setAddress(value);
            }
            catch (error) {
                setAddress('Invalid address');
                setIsValidAddress(false);
            }
        }
    };
    const handleNewAddressChange = (event) => {
        const value = event.target.value;
        if (value === '') {
            setAddress('Enter an address of the wallet that will receive the rewards');
            setIsValidAddress(false);
            return;
        }
        try {
            setAddress(value);
            setIsValidAddress(true);
        }
        catch {
            setAddress('Invalid Stake Address');
            setIsValidAddress(false);
        }
    };
    (0, react_1.useEffect)(() => {
        const loadAddressOptions = async () => {
            if (!wallet.getFundedAddress)
                return;
            const fundedAddresses = await wallet.getFundedAddress();
            const addressNames = {};
            // Add address names
            if (wallet.getAddressNames) {
                const names = await wallet.getAddressNames();
                Object.assign(addressNames, names);
            }
            // Add the unstaked address only if it is not already in the list
            const walletAddress = address;
            if (!fundedAddresses.includes(walletAddress)) {
                fundedAddresses.push(walletAddress);
                addressNames[walletAddress] = 'Regular Address';
            }
            // Add donation address
            const donationAddr = donationAddress;
            if (!fundedAddresses.includes(donationAddr)) {
                fundedAddresses.push(donationAddr);
                if (!(donationAddr in addressNames) || addressNames[donationAddr] === donationAddr) {
                    addressNames[donationAddr] = 'Donate rewards';
                }
            }
            // Add new stake option
            fundedAddresses.push('new');
            addressNames['new'] = 'New Externaly Staked Address';
            setOptions(fundedAddresses);
            setOptionsNames(addressNames);
        };
        loadAddressOptions();
    }, [wallet, donationAddress, address]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `receive-tab ${className}`, children: [(0, jsx_runtime_1.jsx)("select", { onChange: handleStakingChange, className: "address-select", defaultValue: address, children: options.map((item, index) => ((0, jsx_runtime_1.jsx)("option", { value: item, children: optionsNames[item] }, index))) }), (0, jsx_runtime_1.jsx)("br", {}), newStake && ((0, jsx_runtime_1.jsx)("input", { type: "text", onChange: handleNewAddressChange, placeholder: "Enter stake address", className: "new-address-input" })), donationAddress === address && ((0, jsx_runtime_1.jsx)("div", { className: "donation-message", children: "By using this address your Staking rewards will support the development of this software!" })), (0, jsx_runtime_1.jsxs)("div", { className: "receive-address", onClick: () => handleClick(address), style: { cursor: isValidAddress ? 'pointer' : 'not-allowed' }, children: [(0, jsx_runtime_1.jsx)("canvas", { ref: canvasRef, className: "qr-canvas" }), (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("div", { className: "address-text", children: address }), isValidAddress && ((0, jsx_runtime_1.jsx)("svg", { className: "copy-icon", viewBox: "0 0 24 24", fill: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" }) }))] })] }));
};
exports.Receive = Receive;
exports.default = exports.Receive;
//# sourceMappingURL=Receive.js.map