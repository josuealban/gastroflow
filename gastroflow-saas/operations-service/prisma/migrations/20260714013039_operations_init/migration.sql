-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'IN_PREPARATION', 'READY', 'DELIVERED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('ISSUED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InventoryItemType" AS ENUM ('INGREDIENT', 'CONSUMABLE', 'UTENSIL');

-- CreateEnum
CREATE TYPE "InventoryUnit" AS ENUM ('UNIT', 'GRAM', 'KILOGRAM', 'MILLILITER', 'LITER');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('PURCHASE_ENTRY', 'MANUAL_ENTRY', 'MANUAL_EXIT', 'ADJUSTMENT', 'WASTE', 'DAMAGED', 'LOST', 'RETURN');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ingredientDescription" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "imageUrl" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantTable" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "TableStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RestaurantTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "customerId" UUID,
    "waiterId" UUID NOT NULL,
    "tableId" UUID,
    "status" "OrderStatus" NOT NULL DEFAULT 'OPEN',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "productId" UUID,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "paidAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxConfiguration" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(7,4) NOT NULL,
    "effectiveFrom" TIMESTAMPTZ(3) NOT NULL,
    "effectiveTo" TIMESTAMPTZ(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "TaxConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceSequence" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "establishment" TEXT NOT NULL,
    "emissionPoint" TEXT NOT NULL,
    "currentNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "InvoiceSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "customerId" UUID,
    "createdByUserId" UUID NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "customerName" TEXT NOT NULL,
    "customerIdentification" TEXT,
    "customerEmail" TEXT,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxRate" DECIMAL(7,4) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "issuedAt" TIMESTAMPTZ(3) NOT NULL,
    "cancelledAt" TIMESTAMPTZ(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "productId" UUID,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "InventoryItemType" NOT NULL,
    "unit" "InventoryUnit" NOT NULL,
    "currentStock" DECIMAL(14,3) NOT NULL,
    "minimumStock" DECIMAL(14,3) NOT NULL,
    "costPerUnit" DECIMAL(12,4) NOT NULL,
    "damagedQuantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "lostQuantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "invoiceNumber" TEXT,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "receivedAt" TIMESTAMPTZ(3),
    "cancelledAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "purchaseId" UUID NOT NULL,
    "inventoryItemId" UUID NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unitCost" DECIMAL(12,4) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "inventoryItemId" UUID NOT NULL,
    "createdByUserId" UUID,
    "type" "InventoryMovementType" NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "previousStock" DECIMAL(14,3) NOT NULL,
    "newStock" DECIMAL(14,3) NOT NULL,
    "reason" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_restaurantId_isActive_idx" ON "Category"("restaurantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Category_restaurantId_name_key" ON "Category"("restaurantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_id_restaurantId_key" ON "Category"("id", "restaurantId");

-- CreateIndex
CREATE INDEX "Product_restaurantId_categoryId_isAvailable_idx" ON "Product"("restaurantId", "categoryId", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "Product_restaurantId_name_key" ON "Product"("restaurantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_restaurantId_key" ON "Product"("id", "restaurantId");

-- CreateIndex
CREATE INDEX "RestaurantTable_restaurantId_status_isActive_idx" ON "RestaurantTable"("restaurantId", "status", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantTable_restaurantId_number_key" ON "RestaurantTable"("restaurantId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantTable_id_restaurantId_key" ON "RestaurantTable"("id", "restaurantId");

-- CreateIndex
CREATE INDEX "Order_restaurantId_status_createdAt_idx" ON "Order"("restaurantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_restaurantId_customerId_idx" ON "Order"("restaurantId", "customerId");

-- CreateIndex
CREATE INDEX "Order_restaurantId_waiterId_createdAt_idx" ON "Order"("restaurantId", "waiterId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_tableId_restaurantId_idx" ON "Order"("tableId", "restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_id_restaurantId_key" ON "Order"("id", "restaurantId");

-- CreateIndex
CREATE INDEX "OrderItem_restaurantId_orderId_idx" ON "OrderItem"("restaurantId", "orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_restaurantId_idx" ON "OrderItem"("productId", "restaurantId");

-- CreateIndex
CREATE INDEX "Payment_restaurantId_orderId_status_idx" ON "Payment"("restaurantId", "orderId", "status");

-- CreateIndex
CREATE INDEX "Payment_restaurantId_paidAt_idx" ON "Payment"("restaurantId", "paidAt");

-- CreateIndex
CREATE INDEX "TaxConfiguration_restaurantId_isActive_effectiveFrom_idx" ON "TaxConfiguration"("restaurantId", "isActive", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceSequence_restaurantId_establishment_emissionPoint_key" ON "InvoiceSequence"("restaurantId", "establishment", "emissionPoint");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");

-- CreateIndex
CREATE INDEX "Invoice_restaurantId_status_issuedAt_idx" ON "Invoice"("restaurantId", "status", "issuedAt");

-- CreateIndex
CREATE INDEX "Invoice_restaurantId_customerId_idx" ON "Invoice"("restaurantId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_restaurantId_invoiceNumber_key" ON "Invoice"("restaurantId", "invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_orderId_restaurantId_key" ON "Invoice"("orderId", "restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_id_restaurantId_key" ON "Invoice"("id", "restaurantId");

-- CreateIndex
CREATE INDEX "InvoiceItem_restaurantId_invoiceId_idx" ON "InvoiceItem"("restaurantId", "invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceItem_productId_restaurantId_idx" ON "InvoiceItem"("productId", "restaurantId");

-- CreateIndex
CREATE INDEX "InventoryItem_restaurantId_type_isActive_idx" ON "InventoryItem"("restaurantId", "type", "isActive");

-- CreateIndex
CREATE INDEX "InventoryItem_restaurantId_currentStock_idx" ON "InventoryItem"("restaurantId", "currentStock");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_restaurantId_name_key" ON "InventoryItem"("restaurantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_id_restaurantId_key" ON "InventoryItem"("id", "restaurantId");

-- CreateIndex
CREATE INDEX "Supplier_restaurantId_name_idx" ON "Supplier"("restaurantId", "name");

-- CreateIndex
CREATE INDEX "Supplier_restaurantId_taxId_idx" ON "Supplier"("restaurantId", "taxId");

-- CreateIndex
CREATE INDEX "Supplier_restaurantId_isActive_idx" ON "Supplier"("restaurantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_id_restaurantId_key" ON "Supplier"("id", "restaurantId");

-- CreateIndex
CREATE INDEX "Purchase_restaurantId_status_createdAt_idx" ON "Purchase"("restaurantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Purchase_supplierId_restaurantId_idx" ON "Purchase"("supplierId", "restaurantId");

-- CreateIndex
CREATE INDEX "Purchase_restaurantId_createdByUserId_idx" ON "Purchase"("restaurantId", "createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_id_restaurantId_key" ON "Purchase"("id", "restaurantId");

-- CreateIndex
CREATE INDEX "PurchaseItem_purchaseId_restaurantId_idx" ON "PurchaseItem"("purchaseId", "restaurantId");

-- CreateIndex
CREATE INDEX "PurchaseItem_inventoryItemId_restaurantId_idx" ON "PurchaseItem"("inventoryItemId", "restaurantId");

-- CreateIndex
CREATE INDEX "InventoryMovement_restaurantId_inventoryItemId_createdAt_idx" ON "InventoryMovement"("restaurantId", "inventoryItemId", "createdAt");

-- CreateIndex
CREATE INDEX "InventoryMovement_restaurantId_createdByUserId_idx" ON "InventoryMovement"("restaurantId", "createdByUserId");

-- CreateIndex
CREATE INDEX "InventoryMovement_restaurantId_type_createdAt_idx" ON "InventoryMovement"("restaurantId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "InventoryMovement_restaurantId_referenceType_referenceId_idx" ON "InventoryMovement"("restaurantId", "referenceType", "referenceId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_restaurantId_fkey" FOREIGN KEY ("categoryId", "restaurantId") REFERENCES "Category"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_restaurantId_fkey" FOREIGN KEY ("tableId", "restaurantId") REFERENCES "RestaurantTable"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_restaurantId_fkey" FOREIGN KEY ("orderId", "restaurantId") REFERENCES "Order"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_restaurantId_fkey" FOREIGN KEY ("productId", "restaurantId") REFERENCES "Product"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_restaurantId_fkey" FOREIGN KEY ("orderId", "restaurantId") REFERENCES "Order"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_restaurantId_fkey" FOREIGN KEY ("orderId", "restaurantId") REFERENCES "Order"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_restaurantId_fkey" FOREIGN KEY ("invoiceId", "restaurantId") REFERENCES "Invoice"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_productId_restaurantId_fkey" FOREIGN KEY ("productId", "restaurantId") REFERENCES "Product"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_supplierId_restaurantId_fkey" FOREIGN KEY ("supplierId", "restaurantId") REFERENCES "Supplier"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseId_restaurantId_fkey" FOREIGN KEY ("purchaseId", "restaurantId") REFERENCES "Purchase"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_inventoryItemId_restaurantId_fkey" FOREIGN KEY ("inventoryItemId", "restaurantId") REFERENCES "InventoryItem"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_inventoryItemId_restaurantId_fkey" FOREIGN KEY ("inventoryItemId", "restaurantId") REFERENCES "InventoryItem"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;
