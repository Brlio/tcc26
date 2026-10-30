CREATE TYPE "public"."perfil_usuario" AS ENUM('admin', 'operador');--> statement-breakpoint
CREATE TABLE "estoque" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(120) NOT NULL,
	"descricao" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"usuario_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "produto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(160) NOT NULL,
	"codigo_de_barras" varchar(64) NOT NULL,
	"quantidade" integer DEFAULT 0 NOT NULL,
	"preco" numeric(12, 2) NOT NULL,
	"estoque_id" uuid NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "produto_quantidade_nao_negativa" CHECK ("produto"."quantidade" >= 0),
	CONSTRAINT "produto_preco_nao_negativo" CHECK ("produto"."preco" >= 0)
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"senha_hash" text NOT NULL,
	"perfil" "perfil_usuario" DEFAULT 'operador' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "estoque" ADD CONSTRAINT "estoque_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produto" ADD CONSTRAINT "produto_estoque_id_estoque_id_fk" FOREIGN KEY ("estoque_id") REFERENCES "public"."estoque"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "produto_codigo_de_barras_unique" ON "produto" USING btree ("codigo_de_barras");--> statement-breakpoint
CREATE UNIQUE INDEX "usuario_email_unique" ON "usuario" USING btree ("email");