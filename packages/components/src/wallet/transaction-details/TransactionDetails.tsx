import React, { useState } from 'react';
import { Transaction, Assets, meshUtxoToAssets } from '@clan/framework-core';
import { TokenElement } from '../token/TokenElement';
import { formatAddress, copyToClipboard, showInfo } from '@clan/framework-helpers';

export interface TransactionDetailsProps {
  transaction: Transaction;
  walletAddress?: string;
  onClose?: () => void;
  className?: string;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  walletAddress,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inputs' | 'outputs'>('overview');

  const isAddressMine = (address: string): boolean => {
    return walletAddress ? address === walletAddress : false;
  };

  const formatAmount = (assets: Assets): { ada: number; tokens: Assets } => {
    const adaAmount = assets['lovelace'] ? Number(assets['lovelace']) / 1000000 : 0;
    const tokens = { ...assets };
    delete tokens['lovelace'];

    return { ada: adaAmount, tokens };
  };

  const copyToClipboardHandler = (text: string, label: string) => {
    copyToClipboard(text);
    showInfo(`${label} copied to clipboard`);
  };

  const renderOverview = () => {
    const totalInputs = transaction.inputs?.length || 0;
    const totalOutputs = transaction.outputs?.length || 0;

    // Calculate total amounts (simplified)
    const totalInputAda = transaction.inputs?.reduce((sum, input) => {
      const ada = meshUtxoToAssets(input)['lovelace'];
      return sum + (ada ? Number(ada) / 1000000 : 0);
    }, 0) || 0;

    const totalOutputAda = transaction.outputs?.reduce((sum, output) => {
      const amount = formatAmount(meshUtxoToAssets(output));
      return sum + amount.ada;
    }, 0) || 0;

    const fee = totalInputAda - totalOutputAda;

    return (
      <div className="transaction-overview">
        <div className="overview-grid">
          <div className="overview-item">
            <h4>Transaction Hash</h4>
            <div className="hash-display">
              <span className="hash-text">{transaction.hash.slice(0, 32)}...</span>
              <button
                className="copy-btn"
                onClick={() => copyToClipboardHandler(transaction.hash, 'Transaction hash')}
              >
                📋
              </button>
            </div>
          </div>

          <div className="overview-item">
            <h4>Structure</h4>
            <div className="structure-info">
              <span>{totalInputs} input{totalInputs !== 1 ? 's' : ''}</span>
              <span>→</span>
              <span>{totalOutputs} output{totalOutputs !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {transaction.fee && (
            <div className="overview-item">
              <h4>Fee</h4>
              <span className="fee-amount">{(Number(transaction.fee) / 1000000).toFixed(6)} ₳</span>
            </div>
          )}

          {transaction.metadata && (
            <div className="overview-item">
              <h4>Metadata</h4>
              <span className="metadata-indicator">Present</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInputs = () => {
    if (!transaction.inputs || transaction.inputs.length === 0) {
      return <div className="empty-state">No inputs found</div>;
    }

    return (
      <div className="transaction-inputs">
        {transaction.inputs.map((input, index) => {
          const assets = meshUtxoToAssets(input);
          const amount = formatAmount(assets);
          const addr = input.output.address;
          const txHash = input.input.txHash;
          const outputIndex = input.input.outputIndex;

          return (
            <div key={`${txHash}-${outputIndex}`} className="input-item">
              <div className="input-header">
                <span className="input-index">Input #{index + 1}</span>
                <span className={`address-type ${isAddressMine(addr) ? 'mine' : 'external'}`}>
                  {isAddressMine(addr) ? 'Mine' : 'External'}
                </span>
              </div>

              <div className="input-address">
                <span className="address-label">Address:</span>
                <div className="address-display">
                  <span className="address-text">{formatAddress(addr)}</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboardHandler(addr, 'Address')}
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="input-reference">
                <span className="ref-label">Reference:</span>
                <div className="reference-display">
                  <span className="ref-text">
                    {txHash.slice(0, 16)}...#{outputIndex}
                  </span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboardHandler(txHash, 'Transaction hash')}
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="input-assets">
                <div className="asset-ada">
                  <span className="ada-amount">{amount.ada.toFixed(6)} ₳</span>
                </div>
                {Object.keys(amount.tokens).length > 0 && (
                  <div className="asset-tokens">
                    {Object.keys(amount.tokens).map((tokenId) => (
                      <TokenElement
                        key={tokenId}
                        tokenId={tokenId}
                        amount={Number(amount.tokens[tokenId])}
                        className="input-token"
                      />
                    ))}
                  </div>
                )}
              </div>

              {input.output.plutusData && (
                <div className="input-datum">
                  <details>
                    <summary>Datum</summary>
                    <pre className="datum-content">
                      {typeof input.output.plutusData === 'string'
                        ? input.output.plutusData
                        : JSON.stringify(input.output.plutusData, null, 2)
                      }
                    </pre>
                  </details>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderOutputs = () => {
    if (!transaction.outputs || transaction.outputs.length === 0) {
      return <div className="empty-state">No outputs found</div>;
    }

    return (
      <div className="transaction-outputs">
        {transaction.outputs.map((output, index) => {
          const assets = meshUtxoToAssets(output);
          const amount = formatAmount(assets);
          const addr = output.output.address;

          return (
            <div key={index} className="output-item">
              <div className="output-header">
                <span className="output-index">Output #{index + 1}</span>
                <span className={`address-type ${isAddressMine(addr) ? 'mine' : 'external'}`}>
                  {isAddressMine(addr) ? 'Mine' : 'External'}
                </span>
              </div>

              <div className="output-address">
                <span className="address-label">Address:</span>
                <div className="address-display">
                  <span className="address-text">{formatAddress(addr)}</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboardHandler(addr, 'Address')}
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="output-assets">
                <div className="asset-ada">
                  <span className="ada-amount">{amount.ada.toFixed(6)} ₳</span>
                </div>
                {Object.keys(amount.tokens).length > 0 && (
                  <div className="asset-tokens">
                    {Object.keys(amount.tokens).map((tokenId) => (
                      <TokenElement
                        key={tokenId}
                        tokenId={tokenId}
                        amount={Number(amount.tokens[tokenId])}
                        className="output-token"
                      />
                    ))}
                  </div>
                )}
              </div>

              {output.output.plutusData && (
                <div className="output-datum">
                  <details>
                    <summary>Datum</summary>
                    <pre className="datum-content">
                      {typeof output.output.plutusData === 'string'
                        ? output.output.plutusData
                        : JSON.stringify(output.output.plutusData, null, 2)
                      }
                    </pre>
                  </details>
                </div>
              )}

              {output.output.dataHash && (
                <div className="output-datum-hash">
                  <span className="datum-hash-label">Datum Hash:</span>
                  <div className="datum-hash-display">
                    <span className="datum-hash-text">{output.output.dataHash}</span>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboardHandler(output.output.dataHash!, 'Datum hash')}
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`transaction-details ${className}`}>
      <div className="details-header">
        <h2>Transaction Details</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="details-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'inputs' ? 'active' : ''}`}
          onClick={() => setActiveTab('inputs')}
        >
          Inputs ({transaction.inputs?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'outputs' ? 'active' : ''}`}
          onClick={() => setActiveTab('outputs')}
        >
          Outputs ({transaction.outputs?.length || 0})
        </button>
      </div>

      <div className="details-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'inputs' && renderInputs()}
        {activeTab === 'outputs' && renderOutputs()}
      </div>
    </div>
  );
};

export default TransactionDetails;

