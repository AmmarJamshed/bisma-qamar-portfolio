import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "website/js/default-content.js"), "utf8");
const match = src.match(/window\.PORTFOLIO_DEFAULT_CONTENT\s*=\s*(\{[\s\S]*\});/);
const json = JSON.stringify(Function(`return (${match[1]})`)());
const tag = "seed_content";
const sql = `INSERT INTO public.portfolio_content (id, content)
VALUES (1, $${tag}$${json}$${tag}$::jsonb)
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = now();`;
writeFileSync(join(root, "scripts/_seed.sql"), sql, "utf8");
console.log(sql.length);
