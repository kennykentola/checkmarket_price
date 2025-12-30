import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { PriceDataExpanded } from '@/types';

interface PriceChartProps {
  data: PriceDataExpanded[];
  type: 'marketComparison' | 'timeSeries' | 'traderHistory';
}

export const PriceChart: React.FC<PriceChartProps> = ({ data, type }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-500">No data available to display</p>
      </div>
    );
  }

  const formatData = () => {
    if (type === 'marketComparison') {
      return data.map(item => ({
        market: item.marketName,
        price: item.price,
        date: new Date(item.dateSubmitted).toLocaleDateString()
      }));
    } else if (type === 'timeSeries') {
      return data.map(item => ({
        date: new Date(item.dateSubmitted).toLocaleDateString(),
        price: item.price,
        market: item.marketName
      }));
    } else {
      return data.map(item => ({
        date: new Date(item.dateSubmitted).toLocaleDateString(),
        price: item.price
      }));
    }
  };

  const chartData = formatData();

  if (type === 'marketComparison') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Price Comparison by Market</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="market" />
            <YAxis />
            <Tooltip formatter={(value) => [`₦${value}`, 'Price']} />
            <Legend />
            <Bar dataKey="price" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Price Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => [`₦${value}`, 'Price']} />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
