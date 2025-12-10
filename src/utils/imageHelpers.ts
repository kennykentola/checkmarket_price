
export const getItemImage = (name: string, category: string = 'Other', customImage?: string) => {
  // 1. Return custom uploaded image if available
  if (customImage && customImage.trim() !== '') {
    return customImage;
  }

  const n = name.toLowerCase();
  
  // Specific Commodity Overrides (Nigeria Ecosystem)
  if (n.includes('titus') || n.includes('fish') || n.includes('catfish')) return 'https://images.unsplash.com/photo-1519708227418-c8fd9a3a190e?auto=format&fit=crop&w=600&q=80';
  if (n.includes('crayfish') || n.includes('seafood') || n.includes('prawn')) return 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80';
  if (n.includes('rice')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
  if (n.includes('beans') || n.includes('oloyin')) return 'https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=600&q=80';
  if (n.includes('garri') || n.includes('cassava')) return 'https://images.unsplash.com/photo-1640188636906-8c0c41071495?auto=format&fit=crop&w=600&q=80';
  if (n.includes('yam') || n.includes('potato') || n.includes('tuber')) return 'https://images.unsplash.com/photo-1596700867812-466d3f25c276?auto=format&fit=crop&w=600&q=80';
  if (n.includes('tomato')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80';
  if (n.includes('pepper') || n.includes('rodo') || n.includes('chilli')) return 'https://images.unsplash.com/photo-1563177611-361270bc786c?auto=format&fit=crop&w=600&q=80';
  if (n.includes('onion')) return 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80';
  if (n.includes('okra') || n.includes('okro')) return 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80';
  if (n.includes('palm') || n.includes('oil')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80';
  if (n.includes('chicken') || n.includes('poultry')) return 'https://images.unsplash.com/photo-1587593810167-a649254297e7?auto=format&fit=crop&w=600&q=80';
  if (n.includes('beef') || n.includes('meat') || n.includes('goat') || n.includes('suya')) return 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80';
  if (n.includes('egg')) return 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80';
  if (n.includes('spaghetti') || n.includes('pasta') || n.includes('indomie') || n.includes('noodle')) return 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=600&q=80';
  if (n.includes('milk') || n.includes('dairy') || n.includes('cheese')) return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80';
  if (n.includes('sugar')) return 'https://images.unsplash.com/photo-1600742526366-00f727c62257?auto=format&fit=crop&w=600&q=80';
  if (n.includes('semovita') || n.includes('flour') || n.includes('wheat')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80';
  if (n.includes('maggi') || n.includes('spice') || n.includes('curry') || n.includes('thyme')) return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80';
  if (n.includes('bread')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80';
  if (n.includes('plantain')) return 'https://images.unsplash.com/photo-1628839077977-160136297395?auto=format&fit=crop&w=600&q=80';

  // Fallback to Category
  switch (category) {
    case 'Vegetables': return 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=600&q=80';
    case 'Fruits': return 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80';
    case 'Grains': return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
    case 'Meat': return 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80';
    case 'Dairy': return 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80';
    case 'Tubers': return 'https://images.unsplash.com/photo-1624838618210-9cb9588eb344?auto=format&fit=crop&w=600&q=80';
    case 'Oils': return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80';
    case 'Seafood': return 'https://images.unsplash.com/photo-1615141982880-19ed7e6642b8?auto=format&fit=crop&w=600&q=80';
    case 'Spices': return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80';
    case 'Processed': return 'https://images.unsplash.com/photo-1580913428706-c81199602d5c?auto=format&fit=crop&w=600&q=80';
    default: return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
  }
};

export const getMarketImage = (name: string) => {
  const n = name.toLowerCase();
  
  if (n.includes('bodija')) return 'https://images.unsplash.com/photo-1605218427368-35b81ae2d7e5?auto=format&fit=crop&w=400&q=80';
  if (n.includes('mile 12')) return 'https://images.unsplash.com/photo-1574974671999-24b745227159?auto=format&fit=crop&w=400&q=80';
  if (n.includes('dugbe')) return 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=400&q=80';
  if (n.includes('wuse')) return 'https://images.unsplash.com/photo-1599933355554-44588cb7d6f1?auto=format&fit=crop&w=400&q=80';
  if (n.includes('onitsha')) return 'https://images.unsplash.com/photo-1561577553-272cb23b7a05?auto=format&fit=crop&w=400&q=80';
  if (n.includes('ariaria')) return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80';
  if (n.includes('computer')) return 'https://images.unsplash.com/photo-1550041473-d296a1a8ec52?auto=format&fit=crop&w=400&q=80';
  if (n.includes('gbagi')) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80';
  
  // General Market Fallbacks
  return 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&q=80';
};
