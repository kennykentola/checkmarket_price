
import React from 'react';
import { Commodity } from '../types';

interface CommoditySelectorProps {
  commodities: Commodity[];
  selectedCommodityId: string;
  onSelect: (commodityId: string) => void;
  label?: string;
}

export const CommoditySelector: React.FC<CommoditySelectorProps> = ({ commodities, selectedCommodityId, onSelect, label = "Select Commodity" }) => {
  return (
    <div>
      <label htmlFor="commodity-selector" className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        id="commodity-selector"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
        value={selectedCommodityId}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="" disabled>-- Choose a Commodity --</option>
        {commodities.map((c) => (
          <option key={c.$id} value={c.$id}>
            {c.name} ({c.unit})
          </option>
        ))}
      </select>
    </div>
  );
};
