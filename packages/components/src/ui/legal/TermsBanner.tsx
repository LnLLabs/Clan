import React from 'react';
import { Button } from '../buttons/Button';

export interface TermsBannerProps {
  isAccepted: boolean;
  onAccept: (version: string) => void;
  acceptedVersion?: string;
  currentVersion?: string;
  licenseUrl?: string;
  title?: string;
  message?: string;
  acceptButtonText?: string;
  className?: string;
}

export const TermsBanner: React.FC<TermsBannerProps> = ({
  isAccepted,
  onAccept,
  acceptedVersion = 'acceptedV1',
  currentVersion = 'acceptedV1',
  licenseUrl = 'https://github.com/leo42/BroClanWallet/blob/main/LICENSE',
  title,
  message,
  acceptButtonText = 'I Agree',
  className = ''
}) => {
  // If terms are already accepted and versions match, don't show banner
  if (isAccepted && acceptedVersion === currentVersion) {
    return null;
  }

  const defaultMessage = `By using this software, you agree to be bound by our open source license.`;

  return (
    <div className={`terms-banner ${className}`}>
      <div className="terms-banner-content">
        <div className="terms-banner-text">
          {title && <h3 className="terms-banner-title">{title}</h3>}
          <p className="terms-banner-message">
            {message || defaultMessage}
            {licenseUrl && (
              <>
                {' '}
                <a
                  href={licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="terms-banner-link"
                >
                  View License
                </a>
              </>
            )}
          </p>
        </div>

        <div className="terms-banner-actions">
          <Button
            onClick={() => onAccept(currentVersion)}
            size="sm"
            className="terms-banner-accept-button"
          >
            {acceptButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsBanner;
