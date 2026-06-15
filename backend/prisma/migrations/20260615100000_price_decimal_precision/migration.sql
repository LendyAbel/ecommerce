-- Set monetary precision on Product.price (Decimal(65,30) -> Decimal(10,2)).
-- Scale is reduced to 2 decimals intentionally for currency amounts.
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);
