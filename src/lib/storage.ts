import { Product, Store, ProductLocation, ProductTransfer, ProductAddition, Sale, PriceHistory, UndetectedProduct, SalesUploadHistory } from '@/types';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (filename: string) => path.join(DATA_DIR, filename);

// Helper functions to read/write JSON files
const readJSON = <T>(filename: string, defaultValue: T): T => {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    if (!data || data.trim() === '') {
      return defaultValue;
    }
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue;
  }
};

const writeJSON = <T>(filename: string, data: T): void => {
  const filePath = getFilePath(filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
};

// Products
export const getProducts = (): Product[] => {
  const products = readJSON<Product[]>('products.json', []);
  // Migrate old products to new structure (backward compatibility)
  return products.map(product => {
    // If product has old priceHistory but no costHistory, migrate it
    if ((product as any).priceHistory && !product.costHistory) {
      const oldPriceHistory = (product as any).priceHistory;
      return {
        ...product,
        costPrice: product.costPrice || (oldPriceHistory.length > 0 ? oldPriceHistory[oldPriceHistory.length - 1].price : 0),
        costHistory: oldPriceHistory,
        priceHistory: undefined, // Remove old field
      } as Product;
    }
    // Ensure costPrice exists
    if (!product.costPrice && product.costHistory && product.costHistory.length > 0) {
      const sorted = [...product.costHistory].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      product.costPrice = sorted[0].price;
    }
    return product;
  });
};

export const saveProducts = (products: Product[]): void => {
  writeJSON('products.json', products);
};

export const getProduct = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(p => p.id === id);
};

export const addProduct = (product: Product): void => {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
};

export const updateProduct = (id: string, updates: Partial<Product>): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    saveProducts(products);
  }
};

// Stores
export const getStores = (): Store[] => {
  return readJSON<Store[]>('stores.json', []);
};

export const saveStores = (stores: Store[]): void => {
  writeJSON('stores.json', stores);
};

export const addStore = (store: Store): void => {
  const stores = getStores();
  stores.push(store);
  saveStores(stores);
};

// Product Locations
export const getProductLocations = (): ProductLocation[] => {
  return readJSON<ProductLocation[]>('productLocations.json', []);
};

export const saveProductLocations = (locations: ProductLocation[]): void => {
  writeJSON('productLocations.json', locations);
};

export const updateProductLocation = (
  productId: string,
  location: 'gudang' | 'toko',
  storeId: string | undefined,
  quantity: number
): void => {
  const locations = getProductLocations();
  const index = locations.findIndex(
    l => l.productId === productId && l.location === location && l.storeId === storeId
  );
  
  if (index !== -1) {
    locations[index].quantity = quantity;
  } else {
    locations.push({ productId, location, quantity, storeId });
  }
  
  saveProductLocations(locations);
};

// Product Transfers
export const getProductTransfers = (): ProductTransfer[] => {
  return readJSON<ProductTransfer[]>('productTransfers.json', []);
};

export const saveProductTransfers = (transfers: ProductTransfer[]): void => {
  writeJSON('productTransfers.json', transfers);
};

export const addProductTransfer = (transfer: ProductTransfer): void => {
  const transfers = getProductTransfers();
  transfers.push(transfer);
  saveProductTransfers(transfers);
};

// Product Additions
export const getProductAdditions = (): ProductAddition[] => {
  return readJSON<ProductAddition[]>('productAdditions.json', []);
};

export const saveProductAdditions = (additions: ProductAddition[]): void => {
  writeJSON('productAdditions.json', additions);
};

export const addProductAddition = (addition: ProductAddition): void => {
  const additions = getProductAdditions();
  additions.push(addition);
  saveProductAdditions(additions);
};

// Sales
export const getSales = (): Sale[] => {
  return readJSON<Sale[]>('sales.json', []);
};

export const saveSales = (sales: Sale[]): void => {
  writeJSON('sales.json', sales);
};

export const addSales = (newSales: Sale[]): void => {
  const sales = getSales();
  sales.push(...newSales);
  saveSales(sales);
};

// Cost Price History
export const addCostPriceHistory = (productId: string, price: number, timestamp: string): void => {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (product) {
    if (!product.costHistory) {
      product.costHistory = [];
    }
    product.costHistory.push({ price, timestamp });
    product.costPrice = price; // Update current cost price
    saveProducts(products);
  }
};

// Get cost price for a product at a given time
export const getCostPriceAtTime = (product: Product, dateTime: string): number => {
  if (!product.costHistory || product.costHistory.length === 0) {
    return product.costPrice || 0;
  }
  
  // Sort by timestamp descending
  const sortedHistory = [...product.costHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Find the most recent price that is <= the given dateTime
  for (const history of sortedHistory) {
    if (new Date(history.timestamp).getTime() <= new Date(dateTime).getTime()) {
      return history.price;
    }
  }
  
  // If no price found, return the oldest price or current costPrice
  return sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].price : (product.costPrice || 0);
};

// Selling Price History (for future use if needed)
export const addSellingPriceHistory = (productId: string, price: number, timestamp: string): void => {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (product) {
    if (!product.sellingPriceHistory) {
      product.sellingPriceHistory = [];
    }
    product.sellingPriceHistory.push({ price, timestamp });
    product.sellingPrice = price;
    saveProducts(products);
  }
};

// Legacy function for backward compatibility - now uses cost price
export const addPriceHistory = (productId: string, price: number, timestamp: string): void => {
  addCostPriceHistory(productId, price, timestamp);
};

// Legacy function for backward compatibility - now uses cost price
export const getProductPriceAtTime = (product: Product, dateTime: string): number => {
  return getCostPriceAtTime(product, dateTime);
};

// Undetected Products
export const getUndetectedProducts = (): UndetectedProduct[] => {
  return readJSON<UndetectedProduct[]>('undetectedProducts.json', []);
};

export const saveUndetectedProducts = (undetected: UndetectedProduct[]): void => {
  writeJSON('undetectedProducts.json', undetected);
};

export const addUndetectedProduct = (undetected: UndetectedProduct): void => {
  const undetectedProducts = getUndetectedProducts();
  undetectedProducts.push(undetected);
  saveUndetectedProducts(undetectedProducts);
};

// Sales Upload History
export const getSalesUploadHistory = (): SalesUploadHistory[] => {
  return readJSON<SalesUploadHistory[]>('salesUploadHistory.json', []);
};

export const saveSalesUploadHistory = (history: SalesUploadHistory[]): void => {
  writeJSON('salesUploadHistory.json', history);
};

export const addSalesUploadHistory = (history: SalesUploadHistory): void => {
  const histories = getSalesUploadHistory();
  histories.push(history);
  saveSalesUploadHistory(histories);
};

export const deleteSalesUploadHistory = (id: string): void => {
  const histories = getSalesUploadHistory();
  const filtered = histories.filter(h => h.id !== id);
  saveSalesUploadHistory(filtered);
};

// Helper function to calculate stock at a specific date
// This calculates stock by reverse-engineering from current stock
export const getStockAtDate = (
  productId: string,
  location: 'gudang' | 'toko',
  storeId: string | undefined,
  targetDate: string
): number => {
  const locations = getProductLocations();
  const additions = getProductAdditions();
  const transfers = getProductTransfers();
  const sales = getSales();

  // Get current stock
  const currentLocation = locations.find(
    l => l.productId === productId && l.location === location && l.storeId === storeId
  );
  
  // If no location exists, start from 0
  let stock = currentLocation?.quantity || 0;

  const targetDateTime = new Date(targetDate).getTime();
  
  // Reverse calculate: start from current stock and work backwards
  // Subtract additions that happened after target date (they weren't there yet)
  additions
    .filter(a => 
      a.productId === productId && 
      a.location === location && 
      a.storeId === storeId &&
      new Date(a.timestamp).getTime() > targetDateTime
    )
    .forEach(a => {
      stock = Math.max(0, stock - a.quantity);
    });

  // Subtract transfers TO this location after target date (they weren't there yet)
  transfers
    .filter(t => 
      t.productId === productId &&
      t.toLocation === location &&
      t.toStoreId === storeId &&
      new Date(t.timestamp).getTime() > targetDateTime
    )
    .forEach(t => {
      stock = Math.max(0, stock - t.quantity);
    });

  // Add back transfers FROM this location after target date (they were still there)
  transfers
    .filter(t => 
      t.productId === productId &&
      t.fromLocation === location &&
      t.fromStoreId === storeId &&
      new Date(t.timestamp).getTime() > targetDateTime
    )
    .forEach(t => {
      stock += t.quantity;
    });

  // Add back sales after target date (they were still in stock)
  if (location === 'toko') {
    sales
      .filter(s => 
        s.productId === productId &&
        s.storeId === storeId &&
        new Date(s.timestamp).getTime() > targetDateTime
      )
      .forEach(s => {
        stock += s.quantity;
      });
  }

  return Math.max(0, stock);
};

