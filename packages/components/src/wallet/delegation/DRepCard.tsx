import React from 'react';

export interface DRepDisplayInfo {
  type: 'drep';
  id: string;
  name: string;
  description: string;
  votingPower: string;
  isActive: boolean;
  logo?: string;
  isSpecial?: boolean;
}

export interface DRepCardProps {
  drep: DRepDisplayInfo;
  isSelected?: boolean;
  isCurrent?: boolean;
  onClick?: () => void;
  className?: string;
}

export const DRepCard: React.FC<DRepCardProps> = ({
  drep,
  isSelected = false,
  isCurrent = false,
  onClick,
  className = '',
}) => {
  const cardClasses = [
    'drep-card',
    isSelected && 'selected',
    isCurrent && !isSelected && 'current',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="drep-card-header">
        <div className={`drep-card-icon ${drep.isSpecial ? 'special' : ''}`}>
          {drep.logo ? (
            <img src={drep.logo} alt={drep.name} />
          ) : (
            drep.isSpecial ? '⚖️' : '🏛️'
          )}
        </div>
        <div className="drep-card-info">
          <div className="drep-card-name">
            {drep.name}
            {drep.isSpecial && <span className="delegation-badge special">System</span>}
          </div>
          {!drep.isSpecial && (
            <div className="drep-card-id">{drep.id.slice(0, 20)}...</div>
          )}
        </div>
        <div className="drep-card-badges">
          {isCurrent && <span className="delegation-badge current">Current</span>}
          {isSelected && !isCurrent && <span className="delegation-badge selected">Selected</span>}
        </div>
      </div>

      <div className="drep-card-description">{drep.description}</div>

      {!drep.isSpecial && (
        <div className="drep-card-stats">
          <div className="drep-card-stat">
            <span className="drep-card-stat-label">Voting Power</span>
            <span className="drep-card-stat-value">{drep.votingPower}</span>
          </div>
          <div className="drep-card-stat">
            <span className="drep-card-stat-label">Status</span>
            <span className={`drep-card-stat-value ${drep.isActive ? 'active' : 'inactive'}`}>
              {drep.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DRepCard;


