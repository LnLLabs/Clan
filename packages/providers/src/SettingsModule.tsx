import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import {
  WalletInterface,
  WalletConfig,
  Assets,
  TransactionHistoryEntry,
  NetworkConfig
} from '@clan/framework-core';

// Wallet state
interface WalletState {
  wallets: WalletInterface[];
  selectedWallet: WalletInterface | null;
  isConnecting: boolean;
  isConnected: boolean;
  address: string | null;
  balance: Assets | null;
  network: NetworkConfig | null;
  transactions: TransactionHistoryEntry[];
  error: string | null;
  isLoading: boolean;
}

// Wallet actions
type WalletAction =
  | { type: 'SET_WALLETS'; payload: WalletInterface[] }
  | { type: 'SELECT_WALLET'; payload: WalletInterface | null }
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ADDRESS'; payload: string | null }
  | { type: 'SET_BALANCE'; payload: Assets | null }
  | { type: 'SET_NETWORK'; payload: NetworkConfig | null }
  | { type: 'SET_TRANSACTIONS'; payload: TransactionHistoryEntry[] }
  | { type: 'ADD_TRANSACTION'; payload: TransactionHistoryEntry }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET' };

// Initial state
const initialState: WalletState = {
  wallets: [],
  selectedWallet: null,
  isConnecting: false,
  isConnected: false,
  address: null,
  balance: null,
  network: null,
  transactions: [],
  error: null,
  isLoading: false
};

interface WalletContextValue extends WalletState {
  connectWallet: (wallet: WalletInterface) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

// Provider props
interface WalletProviderProps {
  children: ReactNode;
  wallets?: WalletInterface[];
  config?: WalletConfig;
  onWalletConnected?: (wallet: WalletInterface) => void;
  onWalletDisconnected?: () => void;
  onError?: (error: string) => void;
}
const MwalletPassthrough = "https://passthrough.broclan.io" 

// Provider component
export const SettingsModule = (props: {settings : any, setOpenModal: (modal: string) => void}) => {
  const [network, setNetwork] = useState(props.settings.network);
  const [provider, setProvider] = useState(props.settings.api.url === MwalletPassthrough ? "MWallet" :  props.settings.provider);
  const [providerConnection, setProviderConnection] = useState(props.settings.api);
  const [metadataProvider, setMetadataProvider] = useState(props.settings.metadataProvider);
  
  function networkChange(network: string){
    setNetwork(network)
  }


  function setDefaultValues(){
    if (provider === "Blockfrost"){
      setProviderConnection( {"projectId": ""})
    }else if (provider === "MWallet"){
      setProviderConnection({})
    }else if (provider === "Kupmios"){
      if (network === "Mainnet"){
        setProviderConnection({kupoUrl: "https://kupo-mainnet-wmalletmainnet-c8be04.us1.demeter.run" , ogmiosUrl: "wss://ogmios-wmalletmainnet-c8be04.us1.demeter.run"})
      }else if (network === "Preprod"){
        setProviderConnection({kupoUrl: "https://kupo-preprod-mwallet-e048ec.us1.demeter.run" , ogmiosUrl: "wss://ogmios-mwallet-e048ec.us1.demeter.run"})
      }else {
      setProviderConnection({"kupoUrl": "" , "ogmiosUrl": ""})
    }}

    if(metadataProvider==="Blockfrost"){
      const providerConnectionNew = {...providerConnection}
      providerConnectionNew.projectId = ""
      setProviderConnection( providerConnectionNew )
  }
}

  function resetSettings(){
    setProvider("MWallet")
    setMetadataProvider("Blockfrost")
    networkChange("Mainnet")

  }

  function changeProvider(provider: string){
    setProvider(provider)
    if(provider === "Blockfrost"){
      setProviderConnection({
        url: "",
        projectId: ""


      } )
    }else if(provider === "MWallet"){
      setProviderConnection({})
    }
    setDefaultValues()
  }
  
  async function applyNetworkSettings() {
    try {
    let localproviderConnection = providerConnection
    if (provider === "Blockfrost"){

      if (providerConnection.url === "" || providerConnection.projectId === ""){

        // toast.error("Please fill all fields");
        return
      }
      switch (network) {
        case "Mainnet": 
          localproviderConnection.url = "https://cardano-mainnet.blockfrost.io/api/v0"  
          break;
        case "Preview":
          localproviderConnection.url = "https://cardano-preview.blockfrost.io/api/v0"
          break;
        case "Preprod":
          localproviderConnection.url = "https://cardano-preprod.blockfrost.io/api/v0"
          break;
        case "Custom":
          localproviderConnection.url = providerConnection.url
          break;
        default:
          localproviderConnection.url = "https://cardano-preprod.blockfrost.io/api/v0"
          break;
      }

    }
    else if (provider === "Kupmios"){
      if (providerConnection.kupoUrl === "" || providerConnection.ogmiosUrl === ""){
        // toast.error("Please fill all fields");
        return
      }
    }else if (provider === "MWallet"){
      localproviderConnection.url =  MwalletPassthrough

      switch (network) {
      case "Mainnet": 
      localproviderConnection.projectId = "mainnet"
      break;
    case "Preview":
      localproviderConnection.projectId = "preview"
      break;
    case "Preprod":
      localproviderConnection.projectId = "preprod"
      break;
    default:
      localproviderConnection.projectId = "custom"
      break;


  }
    }

      

    const applySetting = props.settings.setSettings({
      "network": network,
      "provider": provider,
      "api": providerConnection,
      "metadataProvider": metadataProvider,
      "sendAll": props.settings.sendAll,
      "explorer": props.settings.explorer,
      "disableSync": props.settings.disableSync,
      "termsAccepted": props.settings.termsAccepted
    })
    // toast.promise(applySetting, { pending: "Applying settings", 
    //                               success: "Settings applied", 
    //                               error: "Connection Failure" });

      await applySetting
      props.setOpenModal("")
    } catch (error) {
      // toast.error("Connection Failure");
    }




  }

  function providerSettings(){
    
    
    return (
      <div> {  
    ((provider === "Blockfrost" || metadataProvider === "Blockfrost" ) && provider !== "MWallet") && (
        <div>
          {network === "Custom" && <input type="text" placeholder="url" value={providerConnection.url ? providerConnection.url : ""} onChange={(event) => setProviderConnection({...providerConnection, url: event.target.value})} />} <br />
          <input type="text" placeholder="projectId" value={providerConnection.projectId ? providerConnection.projectId :  "" } onChange={(event) => setProviderConnection({...providerConnection, projectId: event.target.value})} />
        </div>)  }
    { provider === "Kupmios" &&( <div>
          <input type="text" placeholder="kupoUrl" value={providerConnection.kupoUrl ? providerConnection.kupoUrl : ""} onChange={(event) => setProviderConnection({...providerConnection, kupoUrl: event.target.value})} />    
          <br/>
          <input type="text" placeholder="ogmiosUrl" value={providerConnection.ogmiosUrl ? providerConnection.ogmiosUrl : "" } onChange={(event) => setProviderConnection({...providerConnection, ogmiosUrl: event.target.value})} />
          </div>
      )}
      { (provider === "Maestro" || metadataProvider === "Maestro") &&( <div> 
          <input type="text" placeholder="apiKey" value={providerConnection.apiKey ? providerConnection.apiKey : ""} onChange={(event) => setProviderConnection({...providerConnection, apiKey: event.target.value})} />    
          </div>
      )}
      </div>
    )
  }  



  return (
    <div className="modalBackground" onClick={() => { props.setOpenModal(""); }}>
      <div className="modalContainer"  onClick={ (e) => e.stopPropagation()}   >
        <div className="titleCloseBtn">
          <button
            onClick={() => {
              props.setOpenModal("");
            }}
          >
            X

          </button>
        </div>
  
     
        <div className="body settingsModal">
          <h1>Settings</h1>
          <span> Network</span>   
        <select onChange={(event) => networkChange(event.target.value)} value={network} defaultValue={network}>
          <option value="Preprod">Preprod</option>
          <option value="Preview">Preview</option>
          <option value="Mainnet">Mainnet</option>
          { provider !== "MWallet" ? <option value="Custom">Custom</option>  : ""   }
        </select>
          {  network === "Mainnet" && ["alpha.broclan.io","beta.broclan.io","testnet.broclan.io"].includes(window.location.hostname)   && 
          <span className="warning">WARNING: This is a testnet deployment, make sure you understand the risks before using it on the mainnet.</span>   }

        <span> Provider</span>   
        <select onChange={(event) => changeProvider(event.target.value)} value={provider} defaultValue={provider}>
          <option value="Blockfrost">Blockfrost</option>
          <option value="MWallet">KeyPact</option>
          <option value="Kupmios">Kupmios</option>
          <option value="Maestro">Maestro</option>
        </select>
        <span>Metadata Provider</span>
            <select onChange={(event) => setMetadataProvider(event.target.value)} value={metadataProvider} defaultValue={metadataProvider}>
              <option value="None">None</option>
              {/* <option value="Koios">Koios</option> */}
              <option value="Maestro">Maestro</option>
             { provider && <option value="Blockfrost">Blockfrost</option> }
            </select>

            {providerSettings()}

            <div className="sendAll">
          <label htmlFor="sendAll">Enable Send All</label>
           <input type="checkbox" id="sendAll" name="sendAll" checked={props.settings.sendAll} onChange={ () => props.settings.toggleSendAll()} />
        </div>
        <div className="DisableSync">
          <label htmlFor="DisableSync">Disable All Sync</label>
          <input type="checkbox" name="EnableSync" checked={props.settings.disableSync} onChange={ () => props.settings.toggleDisableSync()} />
        </div>
        <div className="footer">
         <button
            onClick={() => {
              applyNetworkSettings();
            }}
            id="applyButton">
            Apply
          </button>
          <br/>          
          <br/>

          <button
            onClick={() => {
              resetSettings();
            }}
            id="resetButton">
            Reset
          </button>
          </div> 
        
        </div>
      </div>
    </div>
  );
}

// Hook to use wallet context
export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default SettingsModule;

