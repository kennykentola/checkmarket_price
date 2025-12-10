
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Commodity, PriceDataExpanded } from '../types';
import { CommoditySelector } from '../components/CommoditySelector';
import { TrashIcon, PlusIcon, CalculatorIcon } from '@heroicons/react/24/outline';

interface BasketItem {
  id: string;
  commodityId: string;
  commodityName: string;
  quantity: number;
  unit: string;
  estimatedPrice: number; // Unit price
}

export const Calculator = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [prices, setPrices] = useState<PriceDataExpanded[]>([]);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  
  // Selection state
  const [selectedCommId, setSelectedCommId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    Promise.all([api.getCommodities(), api.getLatestPrices()]).then(([c, p]) => {
      setCommodities(c);
      setPrices(p);
    });
  }, []);

  const addToBasket = () => {
    if (!selectedCommId) return;
    const comm = commodities.find(c => c.$id === selectedCommId);
    if (!comm) return;

    // Find average price for this commodity
    const commPrices = prices.filter(p => p.commodityId === selectedCommId);
    let avgPrice = 0;
    if (commPrices.length > 0) {
      avgPrice = commPrices.reduce((acc, curr) => acc + curr.price, 0) / commPrices.length;
    }

    const newItem: BasketItem = {
      id: Date.now().toString(),
      commodityId: selectedCommId,
      commodityName: comm.name,
      quantity: quantity,
      unit: comm.unit,
      estimatedPrice: avgPrice
    };

    setBasket([...basket, newItem]);
    setSelectedCommId('');
    setQuantity(1);
  };

  const removeFromBasket = (id: string) => {
    setBasket(basket.filter(i => i.id !== id));
  };

  const totalCost = basket.reduce((acc, item) => acc + (item.quantity * item.estimatedPrice), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CalculatorIcon className="h-8 w-8 text-indigo-600 mr-2" />
            Market Basket Calculator
        </h1>
        <p className="mt-1 text-sm text-gray-500">Estimate the cost of your "Pot of Soup" or bulk market run based on current average prices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow border border-gray-200 h-fit">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Items</h3>
          <div className="space-y-4">
            <CommoditySelector 
              commodities={commodities} 
              selectedCommodityId={selectedCommId} 
              onSelect={setSelectedCommId} 
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input 
                type="number" 
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <button
              onClick={addToBasket}
              disabled={!selectedCommId}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add to Basket
            </button>
          </div>
        </div>

        {/* List Section */}
        <div className="md:col-span-2 bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
           <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
             <h3 className="text-lg leading-6 font-medium text-gray-900">Your Shopping List</h3>
           </div>
           
           <ul className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
             {basket.map((item) => (
               <li key={item.id} className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                 <div>
                   <p className="text-sm font-medium text-gray-900">{item.commodityName}</p>
                   <p className="text-xs text-gray-500">{item.quantity} x {item.unit} @ ₦{item.estimatedPrice.toLocaleString()}/{item.unit}</p>
                 </div>
                 <div className="flex items-center">
                   <span className="text-sm font-bold text-gray-900 mr-4">₦{(item.quantity * item.estimatedPrice).toLocaleString()}</span>
                   <button 
                     onClick={() => removeFromBasket(item.id)}
                     className="text-red-400 hover:text-red-600 p-1"
                   >
                     <TrashIcon className="h-5 w-5" />
                   </button>
                 </div>
               </li>
             ))}
             {basket.length === 0 && (
               <li className="px-4 py-8 text-center text-gray-500">Your basket is empty. Add items to see the cost.</li>
             )}
           </ul>

           <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
             <div className="flex justify-between items-center">
               <span className="text-base font-medium text-gray-900">Total Estimated Cost:</span>
               <span className="text-2xl font-bold text-green-600">₦{totalCost.toLocaleString()}</span>
             </div>
             <p className="text-xs text-gray-500 mt-1 text-right">*Based on average market prices. Actual prices may vary.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
