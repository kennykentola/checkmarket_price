import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { PriceDataExpanded } from '../types';

interface PriceChartProps {
  data: PriceDataExpanded[];
  type: 'marketComparison';
}

export const PriceChart: React.FC<PriceChartProps> = ({ data, type }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 border-dashed">
        <p className="text-gray-400">No data available for visualization</p>
      </div>
    );
  }

  // Group data for comparison (Average price per market for a commodity)
  const chartData = data.map(item => ({
    name: item.marketName,
    price: item.price,
    unit: item.commodityUnit,
    commodity: item.commodityName
  }));

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="h-80 w-full bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Price Comparison</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} />
          <YAxis tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} unit={` ${data[0]?.commodityUnit || ''}`} />
          <Tooltip 
            cursor={{fill: '#F3F4F6'}}
            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
          />
          <Legend />
          <Bar dataKey="price" name="Price" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};