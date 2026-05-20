import React, { useEffect, useMemo, useState } from 'react';

type BasketItem = {
  id: string;
  marketId: string;
  marketName: string;
  commodityId: string;
  commodityName: string;
  unit: string;
  unitPrice: number;
  qty: number;
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

const LOCAL_STORAGE_KEY = 'market_basket_v1';

const localMarkets = [
  {
    marketId: 'bodija',
    marketName: 'Bodija Market',
    commodities: [
      { commodityId: 'rice-50kg', commodityName: 'Foreign Rice (50kg Bag)', price: 45000, unit: '50kg Bag' },
      { commodityId: 'beans-100kg', commodityName: 'Brown Beans (100kg Bag)', price: 29159, unit: '100kg Bag' },
      { commodityId: 'pepper-small-basket', commodityName: 'Pepper (Rodo) (Small Basket)', price: 12500, unit: 'Small Basket' },
      { commodityId: 'palm-oil-25l', commodityName: 'Red Palm Oil (25L Gallon)', price: 85000, unit: '25L Gallon' }
    ]
  },
  {
    marketId: 'dugbe',
    marketName: 'Dugbe Market',
    commodities: [
      { commodityId: 'rice-50kg', commodityName: 'Foreign Rice (50kg Bag)', price: 6428, unit: '50kg Bag' },
      { commodityId: 'beans-100kg', commodityName: 'Brown Beans (100kg Bag)', price: 33600, unit: '100kg Bag' },
      { commodityId: 'local-rice-50kg', commodityName: 'Local Rice (50kg Bag)', price: 33685, unit: '50kg Bag' },
      { commodityId: 'tomato-large-basket', commodityName: 'Tomato (Large Basket)', price: 4750, unit: 'Large Basket' }
    ]
  },
  {
    marketId: 'oja-oba',
    marketName: 'Oja Oba Market',
    commodities: [
      { commodityId: 'beans-100kg', commodityName: 'Brown Beans (100kg Bag)', price: 28500, unit: '100kg Bag' },
      { commodityId: 'onion-100kg', commodityName: 'Onion (Red) (100kg Bag)', price: 25000, unit: '100kg Bag' },
      { commodityId: 'pepper-small-basket', commodityName: 'Pepper (Rodo) (Small Basket)', price: 12300, unit: 'Small Basket' }
    ]
  },
  {
    marketId: 'gbagi',
    marketName: 'Gbagi Market',
    commodities: [
      { commodityId: 'beef-1kg', commodityName: 'Beef (1kg)', price: 33551, unit: '1kg' },
      { commodityId: 'garri-80kg', commodityName: 'Garri (White) (80kg Bag)', price: 42000, unit: '80kg Bag' },
      { commodityId: 'yam-large', commodityName: 'White Yam (Large Tuber)', price: 2500, unit: 'Large Tuber' }
    ]
  },
  {
    marketId: 'ibadan-north',
    marketName: 'Ibadan North Market',
    commodities: [
      { commodityId: 'maize-100kg', commodityName: 'Yellow Maize (100kg Bag)', price: 15500, unit: '100kg Bag' },
      { commodityId: 'local-rice-50kg', commodityName: 'Local Rice (50kg Bag)', price: 34000, unit: '50kg Bag' }
    ]
  }
];

export default function MarketBasketCalculator(): React.ReactElement {
  const [markets, setMarkets] = useState<any[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState('');
  const [selectedCommodityId, setSelectedCommodityId] = useState('');
  const [qty, setQty] = useState('');
  const [basket, setBasket] = useState<BasketItem[]>([]);

  useEffect(() => {
    // try to load persisted basket
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) setBasket(JSON.parse(raw));
    } catch (e) {
      // ignore
    }

    // Use local market data only
    setMarkets(localMarkets);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(basket));
    } catch (e) {
      // ignore
    }
  }, [basket]);

  const marketOptions = markets.map(m => ({ id: m.marketId, name: m.marketName }));

  const commoditiesForSelectedMarket = useMemo(() => {
    const market = markets.find(m => m.marketId === selectedMarketId);
    return market ? market.commodities : [];
  }, [markets, selectedMarketId]);

  function getCommodityFromMarket(marketId: string, commodityId: string) {
    const market = markets.find(m => m.marketId === marketId);
    return market?.commodities?.find((c: any) => c.commodityId === commodityId) || null;
  }

  function uid() {
    if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) return (crypto as any).randomUUID();
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  function addToBasket() {
    const quantity = Number(qty);
    if (!selectedMarketId || !selectedCommodityId || Number.isNaN(quantity) || quantity < 1) return;
    const commodity = getCommodityFromMarket(selectedMarketId, selectedCommodityId);
    if (!commodity) return;

    const keyMatch = (it: BasketItem) => it.marketId === selectedMarketId && it.commodityId === selectedCommodityId;

    setBasket(prev => {
      const idx = prev.findIndex(keyMatch);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + quantity };
        return copy;
      }
      const item: BasketItem = {
        id: uid(),
        marketId: selectedMarketId,
        marketName: markets.find(m => m.marketId === selectedMarketId)?.marketName || selectedMarketId,
        commodityId: selectedCommodityId,
        commodityName: commodity.commodityName || commodity.name || selectedCommodityId,
        unit: commodity.unit || commodity.unitLabel || 'unit',
        unitPrice: Number(commodity.price || commodity.unitPrice || 0),
        qty: quantity
      };
      return [...prev, item];
    });

    setQty('');
    setSelectedCommodityId('');
  }

  function removeItem(id: string) {
    setBasket(prev => prev.filter(i => i.id !== id));
  }

  function updateQty(id: string, newQty: number) {
    if (newQty < 1) return;
    setBasket(prev => prev.map(i => i.id === id ? { ...i, qty: newQty } : i));
  }

  const totalsByMarket = useMemo(() => {
    const map = new Map<string, number>();
    basket.forEach(i => {
      const prev = map.get(i.marketId) || 0;
      map.set(i.marketId, prev + i.unitPrice * i.qty);
    });
    return map;
  }, [basket]);

  const grandTotal = useMemo(() => basket.reduce((s, i) => s + i.unitPrice * i.qty, 0), [basket]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Basket Calculator</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow border border-gray-200 h-fit">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Item</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Market</label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedMarketId}
                  onChange={e => { setSelectedMarketId(e.target.value); setSelectedCommodityId(''); }}
                >
                  <option value="">Select market</option>
                  {marketOptions.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commodity</label>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedCommodityId}
                  onChange={e => setSelectedCommodityId(e.target.value)}
                  disabled={!selectedMarketId}
                >
                  <option value="">Select commodity</option>
                  {commoditiesForSelectedMarket.map((c: any) => (
                    <option key={c.commodityId} value={c.commodityId}>{c.commodityName} @ {formatCurrency(Number(c.price || 0))}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  min={1}
                  placeholder="Enter quantity"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  type="number"
                  value={qty}
                  onChange={e => setQty(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                disabled={!selectedMarketId || !selectedCommodityId || Number.isNaN(Number(qty)) || Number(qty) < 1}
                onClick={addToBasket}
              >
                Add to Basket
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Your Shopping List</h3>
            </div>

            <ul className="divide-y divide-gray-200 max-h-[420px] overflow-y-auto">
              {basket.length === 0 && (
                <li className="px-4 py-6 text-center text-gray-500">No items added yet.</li>
              )}

              {basket.map(item => (
                <li key={item.id} className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.commodityName}</p>
                    <p className="text-xs text-gray-500">{item.qty} x {item.unit} @ {formatCurrency(item.unitPrice)}</p>
                    <p className="text-xs text-gray-400">Market: {item.marketName}</p>
                  </div>

                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-900 mr-4">{formatCurrency(item.unitPrice * item.qty)}</span>
                    <input className="w-16 border rounded p-1 mr-2 text-sm" type="number" value={item.qty} min={1} onChange={e => updateQty(item.id, Math.max(1, Number(e.target.value || 1)))} />
                    <button className="text-red-400 hover:text-red-600 p-1" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.commodityName}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Per-market subtotals:</p>
                  {Array.from(totalsByMarket.entries()).map(([marketId, sub]) => (
                    <div key={marketId} className="text-sm text-gray-800">{markets.find(m => m.marketId === marketId)?.marketName || marketId}: {formatCurrency(sub)}</div>
                  ))}
                </div>

                <div className="text-right">
                  <span className="text-base font-medium text-gray-900">Total Estimated Cost:</span>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(grandTotal)}</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">*Based on selected market prices. Actual prices may vary.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
