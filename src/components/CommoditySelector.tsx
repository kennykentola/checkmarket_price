import React from 'react';
import { Commodity } from '@/types';

interface CommoditySelectorProps {
  commodities: Commodity[];
  selectedCommodityId: string;
  onSelect: (commodityId: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export const CommoditySelector: React.FC<CommoditySelectorProps> = ({
  commodities,
  selectedCommodityId,
  onSelect,
  placeholder = "Select a commodity",
  className = "block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
  label = "Commodity"
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        className={className}
        value={selectedCommodityId}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {commodities.map(commodity => (
          <option key={commodity.$id} value={commodity.$id}>
            {commodity.name} ({commodity.unit})
          </option>
        ))}
      </select>
    </div>
  );
};
