
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Commodity } from '@/types';
import { CommoditySelector } from '../components/CommoditySelector';
import { TruckIcon } from '@heroicons/react/24/outline';

export const FarmerUpload = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [formData, setFormData] = useState({
    commodityId: '',
    location: '',
    farmGatePrice: '',
    transportCost: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    api.getCommodities().then(setCommodities);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    await api.submitFarmgatePrice({
      commodityId: formData.commodityId,
      location: formData.location,
      farmGatePrice: parseFloat(formData.farmGatePrice),
      transportCost: parseFloat(formData.transportCost)
    });
    setStatus('success');
    setFormData({ commodityId: '', location: '', farmGatePrice: '', transportCost: '' });
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <TruckIcon className="h-8 w-8 text-green-600 mr-2" />
          Farmer's Gate
        </h1>
        <p className="mt-1 text-sm text-gray-500">Upload direct farm prices to help buyers connect with you.</p>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {status === 'success' && (
             <div className="bg-green-50 p-4 rounded-md text-green-800 text-sm font-medium">
               Price submitted successfully!
             </div>
          )}

          <div className="space-y-4">
            <CommoditySelector 
               commodities={commodities} 
               selectedCommodityId={formData.commodityId} 
               onSelect={(id) => setFormData({...formData, commodityId: id})}
               label="Product"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">Farm Location</label>
              <input 
                type="text" 
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="e.g., Iseyin, Oyo State"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Farmgate Price (₦)</label>
                <input 
                  type="number" 
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="0.00"
                  value={formData.farmGatePrice}
                  onChange={e => setFormData({...formData, farmGatePrice: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transport Cost (Est.)</label>
                <input 
                  type="number" 
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="0.00"
                  value={formData.transportCost}
                  onChange={e => setFormData({...formData, transportCost: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {status === 'submitting' ? 'Uploading...' : 'Upload Price'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
