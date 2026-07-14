-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "identification" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "tableId" UUID,
    "reservationDate" TIMESTAMPTZ(3) NOT NULL,
    "numberOfGuests" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerNote" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPreference" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CustomerPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_restaurantId_isActive_idx" ON "Customer"("restaurantId", "isActive");

-- CreateIndex
CREATE INDEX "Customer_restaurantId_phone_idx" ON "Customer"("restaurantId", "phone");

-- CreateIndex
CREATE INDEX "Customer_restaurantId_email_idx" ON "Customer"("restaurantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_restaurantId_identification_key" ON "Customer"("restaurantId", "identification");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_id_restaurantId_key" ON "Customer"("id", "restaurantId");

-- CreateIndex
CREATE INDEX "Reservation_restaurantId_reservationDate_idx" ON "Reservation"("restaurantId", "reservationDate");

-- CreateIndex
CREATE INDEX "Reservation_restaurantId_status_reservationDate_idx" ON "Reservation"("restaurantId", "status", "reservationDate");

-- CreateIndex
CREATE INDEX "Reservation_customerId_restaurantId_idx" ON "Reservation"("customerId", "restaurantId");

-- CreateIndex
CREATE INDEX "Reservation_tableId_idx" ON "Reservation"("tableId");

-- CreateIndex
CREATE INDEX "CustomerNote_restaurantId_customerId_idx" ON "CustomerNote"("restaurantId", "customerId");

-- CreateIndex
CREATE INDEX "CustomerNote_createdByUserId_idx" ON "CustomerNote"("createdByUserId");

-- CreateIndex
CREATE INDEX "CustomerPreference_restaurantId_customerId_idx" ON "CustomerPreference"("restaurantId", "customerId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_customerId_restaurantId_fkey" FOREIGN KEY ("customerId", "restaurantId") REFERENCES "Customer"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_customerId_restaurantId_fkey" FOREIGN KEY ("customerId", "restaurantId") REFERENCES "Customer"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPreference" ADD CONSTRAINT "CustomerPreference_customerId_restaurantId_fkey" FOREIGN KEY ("customerId", "restaurantId") REFERENCES "Customer"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;
