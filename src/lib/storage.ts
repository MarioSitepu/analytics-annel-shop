import { Product, Store, ProductLocation, ProductTransfer, ProductAddition, Sale, PriceHistory, UndetectedProduct, SalesUploadHistory } from '@/types';
import { prisma } from './db';
import { Prisma } from '@prisma/client';

// Helper to convert Prisma models to our types
const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  sku: p.sku || undefined,
  costPrice: p.costPrice,
  costHistory: p.priceHistory?.filter((h: any) => h.type === 'cost').map((h: any) => ({
    price: h.price,
    timestamp: h.timestamp.toISOString(),
  })) || [],
  sellingPrice: p.sellingPrice || undefined,
  sellingPriceHistory: p.priceHistory?.filter((h: any) => h.type === 'selling').map((h: any) => ({
    price: h.price,
    timestamp: h.timestamp.toISOString(),
  })) || [],
  createdAt: p.createdAt.toISOString(),
  priceUpdateMode: (p.priceUpdateMode as 'date' | 'purchase') || 'date',
});

const mapStore = (s: any): Store => ({
  id: s.id,
  name: s.name,
  type: s.type as 'offline' | 'online',
  address: s.address || undefined,
  createdAt: s.createdAt.toISOString(),
});

const mapProductLocation = (l: any): ProductLocation => ({
  productId: l.productId,
  location: l.location as 'gudang' | 'toko',
  quantity: l.quantity,
  storeId: l.storeId || undefined,
});

const mapProductTransfer = (t: any): ProductTransfer => ({
  id: t.id,
  productId: t.productId,
  fromLocation: t.fromLocation as 'gudang' | 'toko',
  toLocation: t.toLocation as 'gudang' | 'toko',
  fromStoreId: t.fromStoreId || undefined,
  toStoreId: t.toStoreId || undefined,
  quantity: t.quantity,
  timestamp: t.timestamp.toISOString(),
});

const mapProductAddition = (a: any): ProductAddition => ({
  id: a.id,
  productId: a.productId,
  location: a.location as 'gudang' | 'toko',
  storeId: a.storeId || undefined,
  quantity: a.quantity,
  timestamp: a.timestamp.toISOString(),
});

const mapSale = (s: any): Sale => ({
  id: s.id,
  storeId: s.storeId,
  productId: s.productId,
  productName: s.productName,
  quantity: s.quantity,
  price: s.price,
  total: s.total,
  date: s.date,
  timestamp: s.timestamp.toISOString(),
});

const mapUndetectedProduct = (u: any): UndetectedProduct => ({
  id: u.id,
  productName: u.productName,
  storeId: u.storeId,
  storeName: u.storeName,
  rowNumber: u.rowNumber,
  timestamp: u.timestamp.toISOString(),
});

const mapSalesUploadHistory = (h: any): SalesUploadHistory => ({
  id: h.id,
  storeId: h.storeId,
  storeName: h.storeName,
  fileName: h.fileName,
  fileType: h.fileType,
  imported: h.imported,
  skipped: h.skipped,
  totalRows: h.totalRows,
  errors: h.errors || [],
  timestamp: h.timestamp.toISOString(),
});

// Products
export const getProducts = async (): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    include: {
      priceHistory: {
        orderBy: { timestamp: 'desc' },
      },
    },
  });
  return products.map(mapProduct);
};

export const saveProducts = async (products: Product[]): Promise<void> => {
  // This function is kept for backward compatibility but may not be used
  // Individual add/update functions should be used instead
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        sku: product.sku,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        priceUpdateMode: product.priceUpdateMode,
      },
      create: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        priceUpdateMode: product.priceUpdateMode,
        createdAt: new Date(product.createdAt),
      },
    });
  }
};

export const getProduct = async (id: string): Promise<Product | undefined> => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      priceHistory: {
        orderBy: { timestamp: 'desc' },
      },
    },
  });
  return product ? mapProduct(product) : undefined;
};

export const addProduct = async (product: Product): Promise<void> => {
  await prisma.product.create({
    data: {
      id: product.id,
      name: product.name,
      sku: product.sku,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      priceUpdateMode: product.priceUpdateMode,
      createdAt: new Date(product.createdAt),
    },
  });
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  await prisma.product.update({
    where: { id },
    data: {
      name: updates.name,
      sku: updates.sku,
      costPrice: updates.costPrice,
      sellingPrice: updates.sellingPrice,
      priceUpdateMode: updates.priceUpdateMode,
    },
  });
};

// Stores
export const getStores = async (): Promise<Store[]> => {
  const stores = await prisma.store.findMany();
  return stores.map(mapStore);
};

export const saveStores = async (stores: Store[]): Promise<void> => {
  for (const store of stores) {
    await prisma.store.upsert({
      where: { id: store.id },
      update: {
        name: store.name,
        type: store.type,
        address: store.address,
      },
      create: {
        id: store.id,
        name: store.name,
        type: store.type,
        address: store.address,
        createdAt: new Date(store.createdAt),
      },
    });
  }
};

export const addStore = async (store: Store): Promise<void> => {
  await prisma.store.create({
    data: {
      id: store.id,
      name: store.name,
      type: store.type,
      address: store.address,
      createdAt: new Date(store.createdAt),
    },
  });
};

// Product Locations
export const getProductLocations = async (): Promise<ProductLocation[]> => {
  const locations = await prisma.productLocation.findMany();
  return locations.map(mapProductLocation);
};

export const saveProductLocations = async (locations: ProductLocation[]): Promise<void> => {
  for (const location of locations) {
    await prisma.productLocation.upsert({
      where: {
        productId_location_storeId: {
          productId: location.productId,
          location: location.location,
          storeId: location.storeId || null,
        } as any,
      },
      update: {
        quantity: location.quantity,
      },
      create: {
        productId: location.productId,
        location: location.location,
        storeId: location.storeId,
        quantity: location.quantity,
      },
    });
  }
};

export const updateProductLocation = async (
  productId: string,
  location: 'gudang' | 'toko',
  storeId: string | undefined,
  quantity: number
): Promise<void> => {
  await prisma.productLocation.upsert({
    where: {
      productId_location_storeId: {
        productId,
        location,
        storeId: storeId || null,
      } as any,
    },
    update: {
      quantity,
    },
    create: {
      productId,
      location,
      storeId,
      quantity,
    },
  });
};

// Product Transfers
export const getProductTransfers = async (): Promise<ProductTransfer[]> => {
  const transfers = await prisma.productTransfer.findMany({
    orderBy: { timestamp: 'desc' },
  });
  return transfers.map(mapProductTransfer);
};

export const saveProductTransfers = async (transfers: ProductTransfer[]): Promise<void> => {
  for (const transfer of transfers) {
    await prisma.productTransfer.create({
      data: {
        id: transfer.id,
        productId: transfer.productId,
        fromLocation: transfer.fromLocation,
        toLocation: transfer.toLocation,
        fromStoreId: transfer.fromStoreId,
        toStoreId: transfer.toStoreId,
        quantity: transfer.quantity,
        timestamp: new Date(transfer.timestamp),
      },
    });
  }
};

export const addProductTransfer = async (transfer: ProductTransfer): Promise<void> => {
  await prisma.productTransfer.create({
    data: {
      id: transfer.id,
      productId: transfer.productId,
      fromLocation: transfer.fromLocation,
      toLocation: transfer.toLocation,
      fromStoreId: transfer.fromStoreId,
      toStoreId: transfer.toStoreId,
      quantity: transfer.quantity,
      timestamp: new Date(transfer.timestamp),
    },
  });
};

// Product Additions
export const getProductAdditions = async (): Promise<ProductAddition[]> => {
  const additions = await prisma.productAddition.findMany({
    orderBy: { timestamp: 'desc' },
  });
  return additions.map(mapProductAddition);
};

export const saveProductAdditions = async (additions: ProductAddition[]): Promise<void> => {
  for (const addition of additions) {
    await prisma.productAddition.create({
      data: {
        id: addition.id,
        productId: addition.productId,
        location: addition.location,
        storeId: addition.storeId,
        quantity: addition.quantity,
        timestamp: new Date(addition.timestamp),
      },
    });
  }
};

export const addProductAddition = async (addition: ProductAddition): Promise<void> => {
  await prisma.productAddition.create({
    data: {
      id: addition.id,
      productId: addition.productId,
      location: addition.location,
      storeId: addition.storeId,
      quantity: addition.quantity,
      timestamp: new Date(addition.timestamp),
    },
  });
};

// Sales
export const getSales = async (): Promise<Sale[]> => {
  const sales = await prisma.sale.findMany({
    orderBy: { timestamp: 'desc' },
  });
  return sales.map(mapSale);
};

export const saveSales = async (sales: Sale[]): Promise<void> => {
  for (const sale of sales) {
    await prisma.sale.create({
      data: {
        id: sale.id,
        storeId: sale.storeId,
        productId: sale.productId,
        productName: sale.productName,
        quantity: sale.quantity,
        price: sale.price,
        total: sale.total,
        date: sale.date,
        timestamp: new Date(sale.timestamp),
      },
    });
  }
};

export const addSales = async (newSales: Sale[]): Promise<void> => {
  await prisma.sale.createMany({
    data: newSales.map(sale => ({
      id: sale.id,
      storeId: sale.storeId,
      productId: sale.productId,
      productName: sale.productName,
      quantity: sale.quantity,
      price: sale.price,
      total: sale.total,
      date: sale.date,
      timestamp: new Date(sale.timestamp),
    })),
    skipDuplicates: true,
  });
};

// Cost Price History
export const addCostPriceHistory = async (productId: string, price: number, timestamp: string): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    // Add price history
    await tx.priceHistory.create({
      data: {
        productId,
        price,
        timestamp: new Date(timestamp),
        type: 'cost',
      },
    });
    
    // Update product cost price
    await tx.product.update({
      where: { id: productId },
      data: { costPrice: price },
    });
  });
};

// Get cost price for a product at a given time
export const getCostPriceAtTime = async (product: Product, dateTime: string): Promise<number> => {
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

// Selling Price History
export const addSellingPriceHistory = async (productId: string, price: number, timestamp: string): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    // Add price history
    await tx.priceHistory.create({
      data: {
        productId,
        price,
        timestamp: new Date(timestamp),
        type: 'selling',
      },
    });
    
    // Update product selling price
    await tx.product.update({
      where: { id: productId },
      data: { sellingPrice: price },
    });
  });
};

// Legacy function for backward compatibility - now uses cost price
export const addPriceHistory = async (productId: string, price: number, timestamp: string): Promise<void> => {
  await addCostPriceHistory(productId, price, timestamp);
};

// Legacy function for backward compatibility - now uses cost price
export const getProductPriceAtTime = async (product: Product, dateTime: string): Promise<number> => {
  return getCostPriceAtTime(product, dateTime);
};

// Undetected Products
export const getUndetectedProducts = async (): Promise<UndetectedProduct[]> => {
  const undetected = await prisma.undetectedProduct.findMany({
    orderBy: { timestamp: 'desc' },
  });
  return undetected.map(mapUndetectedProduct);
};

export const saveUndetectedProducts = async (undetected: UndetectedProduct[]): Promise<void> => {
  for (const item of undetected) {
    await prisma.undetectedProduct.create({
      data: {
        id: item.id,
        productName: item.productName,
        storeId: item.storeId,
        storeName: item.storeName,
        rowNumber: item.rowNumber,
        timestamp: new Date(item.timestamp),
      },
    });
  }
};

export const addUndetectedProduct = async (undetected: UndetectedProduct): Promise<void> => {
  await prisma.undetectedProduct.create({
    data: {
      id: undetected.id,
      productName: undetected.productName,
      storeId: undetected.storeId,
      storeName: undetected.storeName,
      rowNumber: undetected.rowNumber,
      timestamp: new Date(undetected.timestamp),
    },
  });
};

// Sales Upload History
export const getSalesUploadHistory = async (): Promise<SalesUploadHistory[]> => {
  const history = await prisma.salesUploadHistory.findMany({
    orderBy: { timestamp: 'desc' },
  });
  return history.map(mapSalesUploadHistory);
};

export const saveSalesUploadHistory = async (history: SalesUploadHistory[]): Promise<void> => {
  for (const item of history) {
    await prisma.salesUploadHistory.create({
      data: {
        id: item.id,
        storeId: item.storeId,
        storeName: item.storeName,
        fileName: item.fileName,
        fileType: item.fileType,
        imported: item.imported,
        skipped: item.skipped,
        totalRows: item.totalRows,
        errors: item.errors || [],
        timestamp: new Date(item.timestamp),
      },
    });
  }
};

export const addSalesUploadHistory = async (history: SalesUploadHistory): Promise<void> => {
  await prisma.salesUploadHistory.create({
    data: {
      id: history.id,
      storeId: history.storeId,
      storeName: history.storeName,
      fileName: history.fileName,
      fileType: history.fileType,
      imported: history.imported,
      skipped: history.skipped,
      totalRows: history.totalRows,
      errors: history.errors || [],
      timestamp: new Date(history.timestamp),
    },
  });
};

export const deleteSalesUploadHistory = async (id: string): Promise<void> => {
  await prisma.salesUploadHistory.delete({
    where: { id },
  });
};

// Helper function to calculate stock at a specific date
export const getStockAtDate = async (
  productId: string,
  location: 'gudang' | 'toko',
  storeId: string | undefined,
  targetDate: string
): Promise<number> => {
  const locations = await getProductLocations();
  const additions = await getProductAdditions();
  const transfers = await getProductTransfers();
  const sales = await getSales();

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
