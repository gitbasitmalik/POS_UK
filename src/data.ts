import type { Product, Staff, Customer, Transaction, Alert, StockAdjustment, WasteLog, SalesDataPoint, HeldTransaction, Category } from './types';

export const VAT_RATES = { standard: 0.20, reduced: 0.05, zero: 0 };

export const categoryList: Category[] = [
  { id: 'beverages', name: 'Beverages', icon: 'Coffee', color: '#6366F1', productCount: 6 },
  { id: 'snacks', name: 'Snacks', icon: 'Cookie', color: '#F59E0B', productCount: 5 },
  { id: 'dairy', name: 'Dairy', icon: 'Milk', color: '#3B82F6', productCount: 4 },
  { id: 'bakery', name: 'Bakery', icon: 'Croissant', color: '#D97706', productCount: 4 },
  { id: 'produce', name: 'Produce', icon: 'Apple', color: '#10B981', productCount: 4 },
  { id: 'meat', name: 'Meat & Fish', icon: 'Beef', color: '#EF4444', productCount: 3 },
  { id: 'household', name: 'Household', icon: 'Home', color: '#8B5CF6', productCount: 3 },
];

export const products: Product[] = [
  { id:'bev-001',name:'Oat Milk Latte',price:4.50,cost:1.80,category:'beverages',image:'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200&h=200&fit=crop',sku:'BEV-OML-001',stock:48,barcode:'5901234000001',color:'#8B6F47',vatRate:'standard',ageRestricted:false,reorderPoint:10,supplier:'Bean & Co',unit:'each',active:true,createdAt:'2025-01-15',updatedAt:'2025-05-01' },
  { id:'bev-002',name:'Cold Brew Coffee',price:3.80,cost:1.20,category:'beverages',image:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop',sku:'BEV-CBC-002',stock:32,barcode:'5901234000002',color:'#3D2B1F',vatRate:'standard',ageRestricted:false,reorderPoint:8,supplier:'Bean & Co',unit:'each',active:true,createdAt:'2025-01-15',updatedAt:'2025-04-20' },
  { id:'bev-003',name:'Matcha Green Tea',price:5.20,cost:2.10,category:'beverages',image:'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=200&h=200&fit=crop',sku:'BEV-MGT-003',stock:26,barcode:'5901234000003',color:'#7DB954',vatRate:'standard',ageRestricted:false,reorderPoint:6,supplier:'TeaLeaf Ltd',unit:'each',active:true,createdAt:'2025-02-01',updatedAt:'2025-05-01' },
  { id:'bev-004',name:'Fresh Orange Juice',price:3.50,cost:1.40,category:'beverages',image:'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&h=200&fit=crop',sku:'BEV-FOJ-004',stock:18,barcode:'5901234000004',color:'#FF8C00',vatRate:'zero',ageRestricted:false,reorderPoint:10,supplier:'FreshCo',unit:'each',active:true,createdAt:'2025-01-20',updatedAt:'2025-05-01' },
  { id:'bev-005',name:'Sparkling Water',price:1.80,cost:0.40,category:'beverages',image:'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=200&h=200&fit=crop',sku:'BEV-SPW-005',stock:64,barcode:'5901234000005',color:'#87CEEB',vatRate:'zero',ageRestricted:false,reorderPoint:20,supplier:'AquaPure',unit:'each',active:true,createdAt:'2025-01-15',updatedAt:'2025-04-15' },
  { id:'bev-006',name:'Craft IPA 330ml',price:3.90,cost:1.60,category:'beverages',image:'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=200&h=200&fit=crop',sku:'BEV-IPA-006',stock:36,barcode:'5901234000006',color:'#C8A951',vatRate:'standard',ageRestricted:true,minAge:18,reorderPoint:12,supplier:'BrewHaus',unit:'each',active:true,createdAt:'2025-03-01',updatedAt:'2025-05-01' },
  { id:'snk-001',name:'Almond Granola Bar',price:2.40,cost:0.90,category:'snacks',image:'https://images.unsplash.com/photo-1604877681007-44ba0f8f0a6e?w=200&h=200&fit=crop',sku:'SNK-AGB-001',stock:56,barcode:'5901234100001',color:'#C4A265',vatRate:'standard',ageRestricted:false,reorderPoint:15,supplier:'NutriSnack',unit:'each',active:true,createdAt:'2025-01-15',updatedAt:'2025-04-28' },
  { id:'snk-002',name:'Dark Choc Truffles',price:6.90,cost:2.80,category:'snacks',image:'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=200&h=200&fit=crop',sku:'SNK-DCT-002',stock:24,barcode:'5901234100002',color:'#3C1414',vatRate:'standard',ageRestricted:false,reorderPoint:8,supplier:'ChocoLux',unit:'each',active:true,createdAt:'2025-02-10',updatedAt:'2025-05-01' },
  { id:'snk-003',name:'Sea Salt Crisps',price:1.90,cost:0.60,category:'snacks',image:'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=200&fit=crop',sku:'SNK-SSC-003',stock:72,barcode:'5901234100003',color:'#DAA520',vatRate:'standard',ageRestricted:false,reorderPoint:20,supplier:'CrunchCo',unit:'each',active:true,createdAt:'2025-01-15',updatedAt:'2025-04-20' },
  { id:'snk-004',name:'Mixed Nuts Pack',price:4.50,cost:1.80,category:'snacks',image:'https://images.unsplash.com/photo-1536816579748-4ecb3f03d72a?w=200&h=200&fit=crop',sku:'SNK-MNP-004',stock:40,barcode:'5901234100004',color:'#8B7355',vatRate:'zero',ageRestricted:false,reorderPoint:10,supplier:'NutriSnack',unit:'each',active:true,createdAt:'2025-01-20',updatedAt:'2025-04-15' },
  { id:'snk-005',name:'Rice Crackers',price:2.80,cost:1.00,category:'snacks',image:'https://images.unsplash.com/photo-1607083206325-caf1edba7a0f?w=200&h=200&fit=crop',sku:'SNK-RCK-005',stock:36,barcode:'5901234100005',color:'#F5DEB3',vatRate:'standard',ageRestricted:false,reorderPoint:12,supplier:'AsiaFoods',unit:'each',active:true,createdAt:'2025-02-15',updatedAt:'2025-04-28' },
  { id:'dry-001',name:'Greek Yoghurt',price:2.20,cost:0.80,category:'dairy',image:'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop',sku:'DRY-GYO-001',stock:30,barcode:'5901234200001',color:'#FFFAF0',vatRate:'zero',ageRestricted:false,reorderPoint:10,supplier:'DairyFarm',unit:'each',active:true,createdAt:'2025-01-15',updatedAt:'2025-05-01' },
  { id:'dry-002',name:'Aged Cheddar Block',price:5.80,cost:2.40,category:'dairy',image:'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=200&h=200&fit=crop',sku:'DRY-ACB-002',stock:18,barcode:'5901234200002',color:'#FFD700',vatRate:'zero',ageRestricted:false,reorderPoint:6,supplier:'CheeseWorks',unit:'each',active:true,createdAt:'2025-01-20',updatedAt:'2025-04-20' },
  { id:'dry-003',name:'Organic Butter',price:3.40,cost:1.40,category:'dairy',image:'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop',sku:'DRY-OBT-003',stock:22,barcode:'5901234200003',color:'#FFEFD5',vatRate:'zero',ageRestricted:false,reorderPoint:8,supplier:'DairyFarm',unit:'each',active:true,createdAt:'2025-02-01',updatedAt:'2025-04-28' },
  { id:'dry-004',name:'Fresh Cream 250ml',price:1.80,cost:0.60,category:'dairy',image:'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop',sku:'DRY-FCR-004',stock:28,barcode:'5901234200004',color:'#FFF8DC',vatRate:'zero',ageRestricted:false,reorderPoint:10,supplier:'DairyFarm',unit:'litre',active:true,createdAt:'2025-01-15',updatedAt:'2025-05-01' },
  { id:'bkr-001',name:'Sourdough Loaf',price:4.20,cost:1.60,category:'bakery',image:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop',sku:'BKR-SDL-001',stock:14,barcode:'5901234300001',color:'#8B7355',vatRate:'zero',ageRestricted:false,reorderPoint:5,supplier:'BakeHouse',unit:'each',active:true,createdAt:'2025-01-15',updatedAt:'2025-05-01' },
  { id:'bkr-002',name:'Croissant Butter',price:2.60,cost:0.90,category:'bakery',image:'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=200&h=200&fit=crop',sku:'BKR-CRB-002',stock:20,barcode:'5901234300002',color:'#D2691E',vatRate:'zero',ageRestricted:false,reorderPoint:8,supplier:'BakeHouse',unit:'each',active:true,createdAt:'2025-01-20',updatedAt:'2025-04-28' },
  { id:'bkr-003',name:'Cinnamon Roll',price:3.40,cost:1.10,category:'bakery',image:'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=200&h=200&fit=crop',sku:'BKR-CNR-003',stock:16,barcode:'5901234300003',color:'#A0522D',vatRate:'standard',ageRestricted:false,reorderPoint:6,supplier:'BakeHouse',unit:'each',active:true,createdAt:'2025-02-10',updatedAt:'2025-05-01' },
  { id:'bkr-004',name:'Blueberry Muffin',price:2.80,cost:0.95,category:'bakery',image:'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=200&h=200&fit=crop',sku:'BKR-BBM-004',stock:24,barcode:'5901234300004',color:'#4169E1',vatRate:'standard',ageRestricted:false,reorderPoint:8,supplier:'BakeHouse',unit:'each',active:true,createdAt:'2025-02-15',updatedAt:'2025-04-20' },
  { id:'prd-001',name:'Organic Avocado',price:1.80,cost:0.70,category:'produce',image:'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=200&fit=crop',sku:'PRD-OAV-001',stock:44,barcode:'5901234400001',color:'#2E8B57',vatRate:'zero',ageRestricted:false,reorderPoint:15,supplier:'GreenFields',unit:'each',active:true,createdAt:'2025-01-15',updatedAt:'2025-05-01' },
  { id:'prd-002',name:'Cherry Tomatoes',price:2.40,cost:0.90,category:'produce',image:'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=200&h=200&fit=crop',sku:'PRD-CTM-002',stock:36,barcode:'5901234400002',color:'#FF6347',vatRate:'zero',ageRestricted:false,reorderPoint:12,supplier:'GreenFields',unit:'kg',active:true,createdAt:'2025-01-20',updatedAt:'2025-04-28' },
  { id:'prd-003',name:'Baby Spinach 200g',price:1.60,cost:0.50,category:'produce',image:'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop',sku:'PRD-BSP-003',stock:28,barcode:'5901234400003',color:'#228B22',vatRate:'zero',ageRestricted:false,reorderPoint:10,supplier:'GreenFields',unit:'each',active:true,createdAt:'2025-02-01',updatedAt:'2025-05-01' },
  { id:'prd-004',name:'Sweet Potatoes',price:2.20,cost:0.80,category:'produce',image:'https://images.unsplash.com/photo-1596097635092-6e7b1b920e4e?w=200&h=200&fit=crop',sku:'PRD-SPT-004',stock:32,barcode:'5901234400004',color:'#CD853F',vatRate:'zero',ageRestricted:false,reorderPoint:10,supplier:'GreenFields',unit:'kg',active:true,createdAt:'2025-01-15',updatedAt:'2025-04-20' },
  { id:'met-001',name:'Free-Range Chicken',price:7.80,cost:3.60,category:'meat',image:'https://images.unsplash.com/photo-1604503468506-a8da13d82571?w=200&h=200&fit=crop',sku:'MET-FRC-001',stock:12,barcode:'5901234500001',color:'#F5DEB3',vatRate:'zero',ageRestricted:false,reorderPoint:4,supplier:'FarmFresh',unit:'kg',active:true,createdAt:'2025-01-15',updatedAt:'2025-05-01' },
  { id:'met-002',name:'Atlantic Salmon',price:9.40,cost:4.50,category:'meat',image:'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=200&h=200&fit=crop',sku:'MET-ATS-002',stock:8,barcode:'5901234500002',color:'#FA8072',vatRate:'zero',ageRestricted:false,reorderPoint:3,supplier:'SeaCatch',unit:'kg',active:true,createdAt:'2025-02-01',updatedAt:'2025-04-28' },
  { id:'met-003',name:'Beef Mince 500g',price:5.60,cost:2.80,category:'meat',image:'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200&h=200&fit=crop',sku:'MET-BMC-003',stock:14,barcode:'5901234500003',color:'#8B0000',vatRate:'zero',ageRestricted:false,reorderPoint:5,supplier:'FarmFresh',unit:'each',active:true,createdAt:'2025-01-20',updatedAt:'2025-05-01' },
  { id:'hsh-001',name:'Eco Dish Soap',price:3.20,cost:1.20,category:'household',image:'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop',sku:'HSH-EDS-001',stock:40,barcode:'5901234600001',color:'#00CED1',vatRate:'standard',ageRestricted:false,reorderPoint:10,supplier:'CleanCo',unit:'each',active:true,createdAt:'2025-01-15',updatedAt:'2025-04-15' },
  { id:'hsh-002',name:'Bamboo Paper Towel',price:2.80,cost:1.00,category:'household',image:'https://images.unsplash.com/photo-1585237672814-8922b31b8538?w=200&h=200&fit=crop',sku:'HSH-BPT-002',stock:52,barcode:'5901234600002',color:'#D2B48C',vatRate:'standard',ageRestricted:false,reorderPoint:15,supplier:'EcoHome',unit:'each',active:true,createdAt:'2025-02-01',updatedAt:'2025-04-28' },
  { id:'hsh-003',name:'Laundry Pods x30',price:8.90,cost:3.60,category:'household',image:'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=200&h=200&fit=crop',sku:'HSH-LPD-003',stock:22,barcode:'5901234600003',color:'#4682B4',vatRate:'standard',ageRestricted:false,reorderPoint:8,supplier:'CleanCo',unit:'each',active:true,createdAt:'2025-01-20',updatedAt:'2025-05-01' },
];

export const staffMembers: Staff[] = [
  { id:'s1',name:'Sarah Khan',email:'sarah@auraflow.co',role:'manager',pin:'1234',avatar:'SK',hireDate:'2024-03-15',active:true,salesTotal:48250,transactionCount:842 },
  { id:'s2',name:'James Wilson',email:'james@auraflow.co',role:'supervisor',pin:'5678',avatar:'JW',hireDate:'2024-06-01',active:true,salesTotal:36800,transactionCount:654 },
  { id:'s3',name:'Aisha Patel',email:'aisha@auraflow.co',role:'cashier',pin:'9012',avatar:'AP',hireDate:'2024-09-10',active:true,salesTotal:28400,transactionCount:512 },
  { id:'s4',name:'Tom Bradley',email:'tom@auraflow.co',role:'cashier',pin:'3456',avatar:'TB',hireDate:'2025-01-08',active:true,salesTotal:15600,transactionCount:298 },
  { id:'s5',name:'Priya Sharma',email:'priya@auraflow.co',role:'admin',pin:'0000',avatar:'PS',hireDate:'2024-01-10',active:true,salesTotal:0,transactionCount:0 },
];

export const customers: Customer[] = [
  { id:'c1',name:'Emily Chen',email:'emily@mail.com',phone:'07700 900001',loyaltyPoints:2450,loyaltyTier:'gold',totalSpend:1240.50,visitCount:48,lastVisit:'2025-05-08',createdAt:'2024-06-15',notes:'Prefers plant-based' },
  { id:'c2',name:'David Brown',email:'david@mail.com',phone:'07700 900002',loyaltyPoints:890,loyaltyTier:'silver',totalSpend:620.30,visitCount:22,lastVisit:'2025-05-07',createdAt:'2024-09-20',notes:'' },
  { id:'c3',name:'Fatima Al-Rashid',email:'fatima@mail.com',phone:'07700 900003',loyaltyPoints:3200,loyaltyTier:'platinum',totalSpend:2100.80,visitCount:86,lastVisit:'2025-05-08',createdAt:'2024-03-10',notes:'Halal only' },
  { id:'c4',name:'Oliver Smith',email:'oliver@mail.com',phone:'07700 900004',loyaltyPoints:340,loyaltyTier:'bronze',totalSpend:180.40,visitCount:8,lastVisit:'2025-04-28',createdAt:'2025-02-01',notes:'' },
  { id:'c5',name:'Sophie Williams',email:'sophie@mail.com',phone:'07700 900005',loyaltyPoints:1100,loyaltyTier:'silver',totalSpend:780.90,visitCount:30,lastVisit:'2025-05-06',createdAt:'2024-07-22',notes:'Gluten-free' },
];

const past = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

export const transactions: Transaction[] = [
  { id:'TXN-A1B2C',items:[{product:products[0],quantity:2,discount:0},{product:products[6],quantity:1,discount:0}],subtotal:11.40,tax:2.28,discount:0,total:13.68,payments:[{method:'card',amount:13.68}],cashier:staffMembers[0],customer:customers[0],timestamp:past(1),status:'completed',receiptNumber:'R-20250508-001',notes:'' },
  { id:'TXN-D3E4F',items:[{product:products[15],quantity:1,discount:0},{product:products[11],quantity:2,discount:0}],subtotal:8.60,tax:0,discount:0,total:8.60,payments:[{method:'cash',amount:10},{method:'cash',amount:-1.40}],cashier:staffMembers[2],timestamp:past(2),status:'completed',receiptNumber:'R-20250508-002',notes:'' },
  { id:'TXN-G5H6I',items:[{product:products[1],quantity:1,discount:0},{product:products[4],quantity:2,discount:0}],subtotal:7.40,tax:0.76,discount:0,total:8.16,payments:[{method:'contactless',amount:8.16}],cashier:staffMembers[3],customer:customers[2],timestamp:past(3),status:'completed',receiptNumber:'R-20250508-003',notes:'' },
  { id:'TXN-J7K8L',items:[{product:products[7],quantity:1,discount:0}],subtotal:6.90,tax:1.38,discount:0,total:8.28,payments:[{method:'card',amount:8.28}],cashier:staffMembers[0],timestamp:past(5),status:'refunded',receiptNumber:'R-20250508-004',notes:'Customer changed mind' },
];

export const alerts: Alert[] = [
  { id:'a1',type:'low-stock',title:'Low Stock Alert',message:'Atlantic Salmon is below reorder point (8 remaining)',severity:'warning',timestamp:past(0.5),read:false,actionUrl:'/inventory' },
  { id:'a2',type:'low-stock',title:'Critical Stock',message:'Free-Range Chicken critically low (12 remaining)',severity:'critical',timestamp:past(1),read:false,actionUrl:'/inventory' },
  { id:'a3',type:'refund',title:'Refund Processed',message:'TXN-J7K8L refunded £8.28 by Sarah Khan',severity:'info',timestamp:past(5),read:true },
  { id:'a4',type:'shift',title:'Shift Starting',message:'Tom Bradley clocked in at 09:00',severity:'info',timestamp:past(8),read:true },
];

export const wasteLog: WasteLog[] = [
  { id:'w1',productId:'dry-001',productName:'Greek Yoghurt',quantity:3,reason:'expired',cost:6.60,loggedBy:'Sarah Khan',timestamp:past(24),notes:'Past use-by date' },
  { id:'w2',productId:'bkr-002',productName:'Croissant Butter',quantity:2,reason:'damaged',cost:5.20,loggedBy:'James Wilson',timestamp:past(48),notes:'Dropped during stock' },
];

export const stockAdjustments: StockAdjustment[] = [
  { id:'sa1',productId:'bev-001',productName:'Oat Milk Latte',previousStock:24,newStock:48,change:24,reason:'delivery',notes:'Weekly delivery',adjustedBy:'James Wilson',timestamp:past(6) },
  { id:'sa2',productId:'dry-001',productName:'Greek Yoghurt',previousStock:33,newStock:30,change:-3,reason:'expired',notes:'Past use-by',adjustedBy:'Sarah Khan',timestamp:past(24) },
];

export function generateSalesData(): SalesDataPoint[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const hour = new Date(now.getTime() - (11 - i) * 3600000);
    return {
      hour: hour.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      sales: Math.floor(Math.random() * 800 + 200),
      transactions: Math.floor(Math.random() * 30 + 5),
    };
  });
}
