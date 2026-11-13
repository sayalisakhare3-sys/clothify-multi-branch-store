CREATE TYPE "ReturnType" AS ENUM ('RETURN', 'EXCHANGE');

CREATE TABLE "SaleReturn" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "replacementSaleId" INTEGER,
    "type" "ReturnType" NOT NULL,
    "refundAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaleReturn_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SaleReturnItem" (
    "id" SERIAL NOT NULL,
    "returnId" INTEGER NOT NULL,
    "saleItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "refundAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaleReturnItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SaleReturn_replacementSaleId_key" ON "SaleReturn"("replacementSaleId");
CREATE INDEX "SaleReturn_saleId_idx" ON "SaleReturn"("saleId");
CREATE UNIQUE INDEX "SaleReturnItem_returnId_saleItemId_key" ON "SaleReturnItem"("returnId", "saleItemId");
CREATE INDEX "SaleReturnItem_saleItemId_idx" ON "SaleReturnItem"("saleItemId");

ALTER TABLE "SaleReturn"
    ADD CONSTRAINT "SaleReturn_saleId_fkey"
    FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleReturn"
    ADD CONSTRAINT "SaleReturn_replacementSaleId_fkey"
    FOREIGN KEY ("replacementSaleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SaleReturnItem"
    ADD CONSTRAINT "SaleReturnItem_returnId_fkey"
    FOREIGN KEY ("returnId") REFERENCES "SaleReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SaleReturnItem"
    ADD CONSTRAINT "SaleReturnItem_saleItemId_fkey"
    FOREIGN KEY ("saleItemId") REFERENCES "SaleItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
