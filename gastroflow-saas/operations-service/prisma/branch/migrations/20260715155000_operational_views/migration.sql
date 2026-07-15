CREATE VIEW "vw_low_stock" AS
SELECT
  "id",
  "name",
  "type",
  "unit",
  "currentStock",
  "minimumStock",
  "minimumStock" - "currentStock" AS "shortage"
FROM "inventory_items"
WHERE "isActive" = TRUE
  AND "currentStock" <= "minimumStock";

CREATE VIEW "vw_daily_sales" AS
SELECT
  DATE("paidAt") AS "saleDate",
  COUNT(*)::integer AS "paymentCount",
  SUM("amount") AS "totalSales"
FROM "payments"
WHERE "status" = 'COMPLETED'
GROUP BY DATE("paidAt");

CREATE VIEW "vw_invoice_summary" AS
SELECT
  "id",
  "invoiceNumber",
  "status",
  "customerName",
  "customerIdentification",
  "subtotal",
  "taxAmount",
  "total",
  "issuedAt",
  "archivedAt"
FROM "invoices";

CREATE VIEW "vw_top_selling_products" AS
SELECT
  "productName",
  SUM("quantity")::bigint AS "quantitySold",
  SUM("subtotal") AS "grossSales"
FROM "order_items"
GROUP BY "productName";

CREATE VIEW "vw_inventory_movements_summary" AS
SELECT
  item."id" AS "inventoryItemId",
  item."name" AS "inventoryItemName",
  movement."type",
  COUNT(*)::integer AS "movementCount",
  SUM(movement."quantity") AS "totalQuantity"
FROM "inventory_movements" movement
JOIN "inventory_items" item ON item."id" = movement."inventoryItemId"
GROUP BY item."id", item."name", movement."type";
