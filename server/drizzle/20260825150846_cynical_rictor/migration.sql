CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clerk_id" varchar(255) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"phone_number" varchar(255),
	"profile_picture_url" varchar(255),
	"subscription_tier" varchar(255) DEFAULT 'FREE' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
