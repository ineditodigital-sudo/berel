import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  sku: text("sku").notNull().default(""),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  categoryId: text("category_id").references(() => categories.id),
  shortDescription: text("short_description").notNull().default(""),
  description: text("description").notNull().default(""),
  priceCents: integer("price_cents").notNull().default(0),
  compareAtCents: integer("compare_at_cents"),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url").notNull().default(""),
  galleryJson: text("gallery_json").notNull().default("[]"),
  technicalSheetUrl: text("technical_sheet_url").notNull().default(""),
  benefitsJson: text("benefits_json").notNull().default("[]"),
  uses: text("uses").notNull().default(""),
  whatsappMessage: text("whatsapp_message").notNull().default(""),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  status: text("status").notNull().default("published"),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  ...timestamps,
});

export const contentBlocks = sqliteTable("content_blocks", {
  id: text("id").primaryKey(),
  pageId: text("page_id").notNull().references(() => pages.id),
  blockKey: text("block_key").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull().default(""),
  body: text("body").notNull().default(""),
  configJson: text("config_json").notNull().default("{}"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const carouselSlides = sqliteTable("carousel_slides", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  eyebrow: text("eyebrow").notNull().default(""),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  imageUrlMobile: text("image_url_mobile").notNull().default(""),
  buttonLabel: text("button_label").notNull().default(""),
  buttonUrl: text("button_url").notNull().default(""),
  theme: text("theme").notNull().default("red"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const faqs = sqliteTable("faqs", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const branches = sqliteTable("branches", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull().default("Aguascalientes"),
  state: text("state").notNull().default("Aguascalientes"),
  postalCode: text("postal_code").notNull().default(""),
  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  mapUrl: text("map_url").notNull().default(""),
  schedule: text("schedule").notNull().default(""),
  isPickupEnabled: integer("is_pickup_enabled", { mode: "boolean" }).notNull().default(true),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  valueJson: text("value_json").notNull().default("{}"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  objectKey: text("object_key").notNull().unique(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  altText: text("alt_text").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending_payment"),
  paymentProvider: text("payment_provider").notNull().default("manual"),
  paymentReference: text("payment_reference").notNull().default(""),
  paymentStatus: text("payment_status").notNull().default("pending"),
  fulfillmentType: text("fulfillment_type").notNull(),
  branchId: text("branch_id").references(() => branches.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  addressJson: text("address_json").notNull().default("{}"),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  productId: text("product_id").references(() => products.id),
  sku: text("sku").notNull().default(""),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
});
