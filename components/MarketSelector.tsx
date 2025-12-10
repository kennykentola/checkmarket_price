
import React from 'react';
import { Market } from '../types';

interface MarketSelectorProps {
  markets: Market[];
  selectedMarketId: string;
  onSelect: (marketId: string) => void;
  label?: string;
}

export const MarketSelector: React.FC<MarketSelectorProps> = ({ markets, selectedMarketId, onSelect, label = "Select Market" }) => {
  return (
    <div>
      <label htmlFor="market-selector" className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        id="market-selector"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
        value={selectedMarketId}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="" disabled>-- Choose a Market --</option>
        {markets.map((m) => (
          <option key={m.$id} value={m.$id}>
            {m.name} ({m.location})
          </option>
        ))}
      </select>
    </div>
  );
};
