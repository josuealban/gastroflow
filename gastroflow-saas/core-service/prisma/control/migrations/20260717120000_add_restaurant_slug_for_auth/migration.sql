ALTER TABLE "restaurants" ADD COLUMN "slug" TEXT;
UPDATE "restaurants" SET "slug" = 'restaurant-' || left(replace("id"::text, '-', ''), 12) WHERE "slug" IS NULL;
ALTER TABLE "restaurants" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "restaurants_slug_key" ON "restaurants"("slug");
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");
