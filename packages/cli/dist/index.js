#!/usr/bin/env node
import{Command as Yt}from"commander";import te from"chalk";import{readFileSync as Ht}from"fs";import{fileURLToPath as Gt}from"url";import{dirname as Xt,join as Jt}from"path";import i from"chalk";import pe from"inquirer";import N from"ora";import I from"fs-extra";import C from"path";import{execa as O}from"execa";import L from"fs-extra";import U from"path";async function X(){let e=process.cwd(),o=U.join(e,"package.json");if(await L.pathExists(o)){let n=await L.readJson(o),t={...n.dependencies,...n.devDependencies};if(t.next){let s=await L.pathExists(U.join(e,"app")),r=await L.pathExists(U.join(e,"pages"));return{name:"nextjs",version:t.next,type:s?"app":r?"pages":"app"}}if(t.react)return{name:"react",version:t.react};if(t.vue||t["@vue/core"])return{name:"vue",version:t.vue||t["@vue/core"]};if(t.express)return{name:"express",version:t.express}}return await L.pathExists(U.join(e,"next.config.js"))||await L.pathExists(U.join(e,"next.config.ts"))||await L.pathExists(U.join(e,"next.config.mjs"))?{name:"nextjs",type:"app"}:await L.pathExists(U.join(e,"vite.config.ts"))?{name:"react"}:{name:"unknown"}}import Ge from"stripe";async function re(e,o,n){try{let r=await e.prices.search({query:`lookup_key:"${n.lookup_key}"`});if(r.data.length>0){let l=r.data[0],h=await e.products.retrieve(typeof l.product=="string"?l.product:l.product.id);return{productId:h.id,priceId:l.id,name:h.name}}}catch{}let t=await e.products.create(o),s=await e.prices.create({product:t.id,unit_amount:n.unit_amount,currency:n.currency,recurring:n.recurring,lookup_key:n.lookup_key});return{productId:t.id,priceId:s.id,name:t.name}}async function fe(e){let o=new Ge(e,{apiVersion:"2023-10-16"}),n=[];try{let t=await re(o,{name:"Pro",description:"For growing businesses",metadata:{tier:"pro",features:JSON.stringify(["10,000 API calls/mo","Unlimited projects","Priority support","Advanced analytics"])}},{unit_amount:2900,currency:"usd",recurring:{interval:"month"},lookup_key:`pro_monthly_${Date.now()}`});n.push({id:t.productId,name:t.name,priceId:t.priceId})}catch(t){console.warn("Failed to create Pro plan:",t instanceof Error?t.message:String(t))}try{let t=await re(o,{name:"Enterprise",description:"For large organizations",metadata:{tier:"enterprise",features:JSON.stringify(["Unlimited API calls","Custom integrations","SLA guarantee","Dedicated support"])}},{unit_amount:9900,currency:"usd",recurring:{interval:"month"},lookup_key:`enterprise_monthly_${Date.now()}`});n.push({id:t.productId,name:t.name,priceId:t.priceId})}catch(t){console.warn("Failed to create Enterprise plan:",t instanceof Error?t.message:String(t))}try{let t=await re(o,{name:"API Calls",description:"Per-call pricing for API usage",metadata:{type:"usage",unit:"api_call"}},{unit_amount:1,currency:"usd",recurring:{interval:"month",usage_type:"metered"},lookup_key:`api_calls_${Date.now()}`});n.push({id:t.productId,name:"API Calls (Usage)",priceId:t.priceId})}catch(t){console.warn("Failed to create Usage plan:",t instanceof Error?t.message:String(t))}if(n.length===0)throw new Error("Failed to create any Stripe products. Check your API key and try again.");return n}import $ from"fs-extra";import E from"path";import he from"chalk";import{globby as Xe}from"globby";import{fileURLToPath as Je}from"url";var Qe="https://billing.drew.dev/docs",ye="https://github.com/drewsephski/monetize",we={saas:{appName:"SaaS Starter",eyebrow:"Subscription product",examplesPath:"examples/saas-starter"},api:{appName:"API Product",eyebrow:"Usage-based API",examplesPath:"examples/api-product"},usage:{appName:"AI Credits",eyebrow:"AI credits product",examplesPath:"examples/ai-credits"}},Ze=new Set([".css",".env",".js",".json",".md",".mjs",".ts",".tsx",".txt"]),et={saas:["app/layout.tsx","app/page.tsx","app/pricing/page.tsx","app/dashboard/page.tsx","components/example-kit.tsx","lib/site.ts"],api:["app/layout.tsx","app/page.tsx","app/pricing/page.tsx","app/dashboard/page.tsx","app/api-keys/page.tsx","components/example-kit.tsx","lib/site.ts"],usage:["app/layout.tsx","app/page.tsx","app/pricing/page.tsx","app/dashboard/page.tsx","app/usage/page.tsx","components/example-kit.tsx","lib/site.ts"]};async function ve(e,o,n){let t=J(e),s=n||process.cwd(),r=tt(),l=ot(t,o);console.log(he.blue(`
\u{1F4C4} Installing ${l.__APP_NAME__} template assets...`));let h=await be(E.join(r,"common"),s,l),d=await be(E.join(r,t),s,l);if(h+d===0)throw new Error(`Template installation copied 0 files from ${r}`);let m=await rt(t,s);if(m.length>0)throw new Error(`Template installation incomplete. Missing required files: ${m.join(", ")}`);console.log(he.green(`\u2705 ${l.__APP_NAME__} template installed
`))}function J(e){let o=e.trim().toLowerCase();if(o==="ai-credits")return"usage";if(o==="saas"||o==="api"||o==="usage")return o;throw new Error(`Unknown template: ${e}`)}function ke(e){let o=J(e);return we[o].appName}function tt(e=Je(import.meta.url)){let o=E.dirname(e),n=[E.resolve(o,".."),E.resolve(o,"..","..")];for(let t of n){let s=E.join(t,"templates"),r=E.join(s,"common");if($.existsSync(r))return s}throw new Error(`Could not locate CLI templates relative to ${e}. Checked: ${n.map(t=>E.join(t,"templates")).join(", ")}`)}function ot(e,o){let n=we[e],t=`${ye}/tree/main/${n.examplesPath}`,s=o.find(l=>/pro|growth|studio/i.test(l.name)),r=o.find(l=>/enterprise|scale/i.test(l.name));return{__APP_NAME__:n.appName,__APP_EYEBROW__:n.eyebrow,__DOCS_URL__:Qe,__GITHUB_URL__:ye,__EXAMPLES_URL__:t,__PRO_PRICE_ID__:s?.priceId||"price_placeholder_pro",__ENTERPRISE_PRICE_ID__:r?.priceId||"price_placeholder_enterprise"}}async function be(e,o,n){if(!await $.pathExists(e))throw new Error(`Template source directory not found: ${e}`);let t=await Xe(["**/*"],{cwd:e,dot:!0,onlyFiles:!0});if(t.length===0)throw new Error(`Template source directory is empty: ${e}`);for(let s of t){let r=E.join(e,s),l=E.join(o,s);if(await $.ensureDir(E.dirname(l)),nt(r)){let h=await $.readFile(r,"utf8");await $.writeFile(l,st(h,n),"utf8");continue}await $.copyFile(r,l)}return t.length}function nt(e){return Ze.has(E.extname(e))}function st(e,o){return Object.entries(o).reduce((n,[t,s])=>n.split(t).join(s),e)}async function rt(e,o){return(await Promise.all(et[e].map(async t=>({relativePath:t,exists:await $.pathExists(E.join(o,t))})))).filter(t=>!t.exists).map(t=>t.relativePath)}import xe from"fs-extra";import at from"path";async function V(e){let o=at.join(process.cwd(),".env.local"),n="";try{n=await xe.readFile(o,"utf-8")}catch{}for(let[t,s]of Object.entries(e)){let r=`${t}=${s}`;n.includes(`${t}=`)?n=n.replace(new RegExp(`${t}=.*`),r):(n+=n.endsWith(`
`)?"":`
`,n+=`${r}
`)}await xe.writeFile(o,n)}import Q from"fs-extra";import Z from"path";import{execa as wo}from"execa";async function Se(){let e=process.cwd();return await Q.pathExists(Z.join(e,"bun.lockb"))||await Q.pathExists(Z.join(e,"bun.lock"))?"bun":await Q.pathExists(Z.join(e,"pnpm-lock.yaml"))?"pnpm":await Q.pathExists(Z.join(e,"yarn.lock"))?"yarn":"npm"}import{createHash as it}from"crypto";import{readFileSync as lt,existsSync as _e,writeFileSync as ct,mkdirSync as pt}from"fs";import{homedir as Ie}from"os";import{join as Ce}from"path";import _o from"chalk";var ae=Ce(Ie(),".drew-billing"),ie=Ce(ae,"telemetry.json"),Pe=process.env.TELEMETRY_ENDPOINT||"";function Ee(){let e=`${Ie()}_${process.platform}_${process.arch}`;return it("sha256").update(e).digest("hex").substring(0,16)}function q(){try{if(_e(ie)){let e=JSON.parse(lt(ie,"utf-8"));return{enabled:e.enabled??!1,machineId:e.machineId||Ee(),optedInAt:e.optedInAt}}}catch{}return{enabled:!1,machineId:Ee()}}function Te(e){try{_e(ae)||pt(ae,{recursive:!0}),ct(ie,JSON.stringify(e,null,2))}catch{}}function Ne(){let e=q();e.enabled=!0,e.optedInAt=new Date().toISOString(),Te(e)}function Re(){let e=q();e.enabled=!1,Te(e)}function dt(){return`cli_${Math.random().toString(36).substring(2,15)}_${Date.now()}`}function z(e,o){let n=q();if(!n.enabled)return;let t={type:e,timestamp:new Date().toISOString(),machineId:n.machineId,sessionId:dt(),cliVersion:"1.0.0",metadata:o};gt(t).catch(()=>{})}function Le(e,o,n){z(e,{...n,durationMs:o})}async function gt(e){if(!Pe){process.env.DEBUG==="true"&&console.log("[Telemetry]",e);return}try{await fetch(Pe,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}catch{}}var le={CLI_INSTALL:"cli_install",INIT_STARTED:"init_started",INIT_COMPLETED:"init_completed",SANDBOX_STARTED:"sandbox_started",FIRST_CHECKOUT:"first_checkout",FIRST_SUBSCRIPTION:"first_subscription"};function ce(e,o){z(`funnel_${e}`,o)}import ee from"chalk";import De from"inquirer";async function Ae(e,o){console.log(),console.log(ee.blue.bold("\u{1F4E3} Quick Feedback")),console.log(ee.gray("Your feedback helps us improve.")),console.log();try{let{wasEasy:n}=await De.prompt([{type:"confirm",name:"wasEasy",message:"Was this easy to set up?",default:!0}]),t;if(!n){let{feedback:s}=await De.prompt([{type:"input",name:"feedback",message:"What was difficult? (optional, 1 sentence)"}]);t=s}z("feedback_collected",{eventType:e,rating:n?"positive":"negative",feedback:t,...o}),console.log(),console.log(n?ee.green("\u2728 Thanks! Glad it went smoothly."):ee.yellow("\u{1F4DD} Thanks for the feedback \u2014 we'll use it to improve.")),console.log()}catch{}}async function je(e){console.log(i.blue.bold(`
\u26A1 drew-billing-cli init
`)),ce(le.INIT_STARTED,{template:e.template});let o=Date.now(),n=process.cwd(),t=await yt(n),s=await I.pathExists(C.join(n,"package.json")),r="npm",l=C.basename(n),h={name:"nextjs"},d=!1;if(t||!s){console.log(i.yellow("\u{1F4C1} No existing project detected."));let p=e.yes;e.yes||(p=(await pe.prompt([{type:"confirm",name:"shouldScaffold",message:"Create a new Next.js project here?",default:!0}])).shouldScaffold),p||(console.log(i.gray(`
Aborted. Please run this in an existing Next.js project directory.
`)),process.exit(0));let u=await bt(n,e.yes);u.success||(console.log(i.red(`
\u274C Failed to scaffold Next.js project.`)),console.log(i.gray(`Please try manually: npx create-next-app@latest .
`)),process.exit(1)),r=u.pkgManager,l=u.projectName,d=!0,h={name:"nextjs",version:"latest"},console.log(i.green(`
\u2705 Created Next.js project: ${l}
`)),await I.pathExists(C.join(n,"package.json"))||(console.log(i.red(`
\u274C Scaffolded project missing package.json`)),process.exit(1))}else{let p=N("Detecting framework...").start(),u=await X();if(h={name:u.name,version:u.version},u.name!=="nextjs"){p.warn(`Detected: ${u.name} (limited support)`),console.log(i.yellow(`
\u26A0\uFE0F  Currently only Next.js is fully supported.`)),console.log(i.gray(`Other frameworks coming soon: React, Vue, Svelte, Express
`));let{continueAnyway:j}=await pe.prompt([{type:"confirm",name:"continueAnyway",message:"Continue with manual setup?",default:!1}]);j||(console.log(i.gray(`
Aborted.
`)),process.exit(0))}else p.succeed(`Detected: ${i.green("Next.js")} ${u.version||""}`);r=await Se()}console.log(i.gray(`Using package manager: ${r}
`));let g;e.yes?g={stripeSecretKey:process.env.STRIPE_SECRET_KEY||"",stripePublishableKey:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY||"",webhookSecret:process.env.STRIPE_WEBHOOK_SECRET||"",databaseUrl:process.env.DATABASE_URL||"",template:e.template||"saas",createProducts:!e.skipStripe}:g={...await pe.prompt([{type:"input",name:"stripeSecretKey",message:"Stripe Secret Key (sk_test_...):",default:process.env.STRIPE_SECRET_KEY,validate:u=>u.startsWith("sk_test_")||u.startsWith("sk_live_")?!0:"Must start with sk_test_ or sk_live_"},{type:"input",name:"stripePublishableKey",message:"Stripe Publishable Key (pk_test_...):",default:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,validate:u=>u.startsWith("pk_test_")||u.startsWith("pk_live_")?!0:"Must start with pk_test_ or pk_live_"},{type:"input",name:"databaseUrl",message:"Database URL (postgresql://...):",default:process.env.DATABASE_URL,validate:u=>!u||u.trim()===""?"Database URL is required (use your Neon or local Postgres URL)":!u.startsWith("postgresql://")&&!u.startsWith("postgres://")?"Must start with postgresql:// or postgres://":!0},{type:"list",name:"template",message:"Choose your template:",choices:[{name:"SaaS Starter (overview + pricing + dashboard)",value:"saas"},{name:"API Billing (usage-based pricing)",value:"api"},{name:"AI Credits / Usage (credits + top-ups + dashboard)",value:"usage"},{name:"Minimal (just the SDK)",value:"minimal"}],default:e.template||"saas"},{type:"confirm",name:"createProducts",message:"Create Stripe products automatically?",default:!e.skipStripe}]),webhookSecret:""},console.log(i.blue.bold(`
\u{1F4E6} Setting up drew-billing-cli...
`));let m={projectScaffolded:d,dependencies:!1,stripeProducts:!1,database:!1,templates:!1,env:!1},b=[],f=N("Installing core dependencies...").start();try{await de(["stripe","lucide-react"],r,f,!1,2,n),f.succeed("Core dependencies installed"),m.dependencies=!0}catch(p){f.fail("Failed to install core dependencies");let u=p instanceof Error?p.message:String(p);b.push(`Dependencies: ${u}`),console.log(i.gray(`Run manually: ${r} ${r==="npm"?"install":"add"} stripe lucide-react`))}let w=N("Installing database dependencies...").start();try{await de(["drizzle-orm","@neondatabase/serverless","drizzle-kit"],r,w,!1,2,n),w.succeed("Database dependencies installed")}catch(p){w.fail("Failed to install database dependencies");let u=p instanceof Error?p.message:String(p);b.push(`DB Dependencies: ${u}`),console.log(i.gray(`Run manually: ${r} ${r==="npm"?"install":"add"} drizzle-orm @neondatabase/serverless drizzle-kit`))}let k=N("Installing dev dependencies...").start();try{await de(["@types/node","typescript"],r,k,!0,2,n),k.succeed("Dev dependencies installed")}catch{k.warn("Some dev dependencies may need manual installation")}let P=[];if(g.createProducts&&g.stripeSecretKey){let p=N("Creating Stripe products...").start();try{if(!g.stripeSecretKey.startsWith("sk_test_")&&!g.stripeSecretKey.startsWith("sk_live_"))throw new Error("Invalid Stripe secret key format");P=await fe(g.stripeSecretKey),p.succeed(`Created ${P.length} Stripe products`),m.stripeProducts=!0}catch(u){p.fail("Failed to create Stripe products");let j=u instanceof Error?u.message:String(u);b.push(`Stripe products: ${j}`),console.log(i.gray("You can create them manually in the Stripe Dashboard")),console.log(i.gray("Then update the price IDs in your code")),P=[{id:"prod_fallback",name:"Pro",priceId:"price_fallback_pro"},{id:"prod_fallback_2",name:"Enterprise",priceId:"price_fallback_enterprise"}]}}let oe=N("Setting up database...").start();try{await wt(n),await vt(n,r,oe),oe.succeed("Database configured"),m.database=!0}catch(p){oe.fail("Database setup failed");let u=p instanceof Error?p.message:String(p);b.push(`Database: ${u}`),console.log(i.gray("You can set up the database later by running:")),console.log(i.gray("  npx drizzle-kit push")),console.log(i.gray(`
Make sure to set DATABASE_URL in your .env.local file`))}let ue=N(`Installing ${g.template} template...`).start();try{await I.ensureDir(C.join(n,"app")),await I.ensureDir(C.join(n,"components")),await ve(g.template,P,n),ue.succeed("Template installed"),m.templates=!0}catch(p){ue.fail("Template installation failed");let u=p instanceof Error?p.message:String(p);b.push(`Templates: ${u}`),console.log(i.gray("Try running:")),console.log(i.gray("  npx drew-billing-cli add all"))}let me=N("Updating environment variables...").start();try{let p={STRIPE_SECRET_KEY:g.stripeSecretKey,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:g.stripePublishableKey,STRIPE_WEBHOOK_SECRET:g.webhookSecret||"whsec_... (run: stripe listen --forward-to localhost:3000/api/webhooks/stripe)",DATABASE_URL:g.databaseUrl||"postgresql://username:password@localhost:5432/database_name",BILLING_API_URL:"http://localhost:3000"};if(P.length>0&&m.stripeProducts){let u=P.find(R=>/starter|free|basic/i.test(R.name)),j=P.find(R=>/pro|growth|paid|standard/i.test(R.name)),se=P.find(R=>/enterprise|scale|advanced|business/i.test(R.name));u&&(p.NEXT_PUBLIC_STRIPE_PRICE_STARTER=u.priceId),j&&(p.NEXT_PUBLIC_STRIPE_PRICE_PRO=j.priceId),se&&(p.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=se.priceId),P.forEach(R=>{let He=`NEXT_PUBLIC_STRIPE_PRICE_${R.name.toUpperCase().replace(/[^A-Z0-9]/g,"_")}`;p[He]=R.priceId})}await V(p),me.succeed("Environment variables configured"),m.env=!0}catch(p){me.fail("Failed to update .env");let u=p instanceof Error?p.message:String(p);b.push(`Environment: ${u}`)}let ne=Date.now()-o;ce(le.INIT_COMPLETED,{template:g.template,durationMs:ne,framework:h.name,success:Object.values(m).every(p=>p)}),Le("init_complete",ne);let Ye=g.template==="minimal"?"Minimal SDK":ke(J(g.template));ut({errors:b,pkgManager:r,projectName:l,projectScaffolded:m.projectScaffolded,templateLabel:Ye,templateKey:g.template,dependenciesReady:m.dependencies,sandboxReady:m.templates}),P.length>0&&m.stripeProducts?(console.log(i.gray("Created Stripe products:")),P.forEach(p=>{console.log(i.gray(`  \u2022 ${p.name}: ${p.priceId}`))}),console.log()):P.length>0&&(console.log(i.gray("Placeholder product IDs (update these in your code):")),P.forEach(p=>{console.log(i.gray(`  \u2022 ${p.name}: ${p.priceId}`))}),console.log()),console.log(i.blue("\u{1F4CA} Help improve drew-billing-cli")),console.log(i.gray("Enable anonymous telemetry to help us fix bugs faster.")),console.log(i.gray(`Run: npx drew-billing-cli telemetry --enable
`)),await Ae("init_completed",{template:g.template,framework:h.name,durationMs:ne,results:m})}function ut({errors:e,pkgManager:o,projectName:n,projectScaffolded:t,templateLabel:s,templateKey:r,dependenciesReady:l,sandboxReady:h}){let d=ft(o,"billing:sandbox"),g=mt(o),m=ht(r),b=[];t&&b.push(`cd ${n}`),l||b.push(g),b.push(d);let f=(w,k)=>`${i.gray(w.padEnd(20))}${i.white(k)}`;console.log(i.green.bold(`
\u25C6 Setup Complete
`)),console.log(f("Created",s)),console.log(f("Template key",r)),console.log(f("Package manager",o)),console.log(f("Dependencies",l?"Installed":`Needs manual step (${g})`)),console.log(f("Sandbox mode",h?"Ready":"Template install incomplete")),console.log(f("First action","Open /pricing and complete checkout")),console.log(i.white(`
Next steps`)),b.forEach((w,k)=>{console.log(i.gray(`${k+1}.`),i.cyan(w))}),console.log(i.white(`
Local URLs`)),Object.entries(m).forEach(([w,k])=>{console.log(i.gray(`- ${w}:`),i.cyan(k))}),e.length>0&&(console.log(i.yellow(`
Warnings`)),e.forEach(w=>{console.log(i.gray(`- ${w}`))})),console.log(i.blue(`
\u{1F517} Webhook Setup (Required for Production)`)),console.log(i.gray("Webhooks sync subscription data between Stripe and your database.")),console.log(i.gray("Local dev:  "),i.cyan("npx drew-billing-cli setup-webhook")),console.log(i.gray("Production: Deploy to Vercel \u2192 Add Stripe webhook \u2192 Configure secrets")),console.log(),console.log(i.gray("Docs:"),i.underline("https://github.com/drewsephski/monetize")),console.log(i.gray("Diagnostics:"),i.cyan("npx drew-billing-cli doctor")),console.log(i.gray("Webhooks:"),i.cyan("npx drew-billing-cli setup-webhook")),console.log(i.gray("Support:"),i.underline("https://github.com/drewsephski/monetize/issues")),console.log()}function mt(e){switch(e){case"bun":return"bun install";case"pnpm":return"pnpm install";case"yarn":return"yarn install";default:return"npm install"}}function ft(e,o){switch(e){case"bun":return`bun run ${o}`;case"pnpm":return`pnpm ${o}`;case"yarn":return`yarn ${o}`;default:return`npm run ${o}`}}function ht(e){let o={App:"http://localhost:3000",Pricing:"http://localhost:3000/pricing",Dashboard:"http://localhost:3000/dashboard"};return e==="api"&&(o["API Keys"]="http://localhost:3000/api-keys",o.Usage="http://localhost:3000/usage"),(e==="usage"||e==="ai-credits")&&(o.Usage="http://localhost:3000/usage"),o}async function yt(e){try{return(await I.readdir(e)).filter(t=>!t.startsWith(".")&&t!=="node_modules").length===0}catch{return!0}}async function bt(e,o=!1){let n=C.basename(e),t="npm";try{await O("bun",["--version"],{stdio:"pipe"}),t="bun"}catch{try{await O("pnpm",["--version"],{stdio:"pipe"}),t="pnpm"}catch{try{await O("yarn",["--version"],{stdio:"pipe"}),t="yarn"}catch{}}}let s=N(`Creating Next.js project with ${t}...`).start();try{let r=t==="npm"?"npx":t,l=[...t==="npm"?["create-next-app@latest"]:["create","next-app"],".","--typescript","--tailwind","--eslint","--app","--src-dir=false","--import-alias","@/*",...o?["--yes"]:[]];return await O(r,l,{cwd:e,stdio:"pipe",timeout:3e5}),s.succeed("Next.js project created"),{success:!0,pkgManager:t,projectName:n}}catch{if(s.fail("Failed to create Next.js project"),t!=="npm"){s.text="Retrying with npm...",s.start();try{return await O("npx",["create-next-app@latest",".","--typescript","--tailwind","--eslint","--app","--src-dir=false","--import-alias","@/*",...o?["--yes"]:[]],{cwd:e,stdio:"pipe",timeout:3e5}),s.succeed("Next.js project created with npm"),{success:!0,pkgManager:"npm",projectName:n}}catch{return s.fail("All attempts failed"),{success:!1,pkgManager:"npm",projectName:n}}}return{success:!1,pkgManager:t,projectName:n}}}async function de(e,o,n,t=!1,s=2,r){let l=o==="npm"?"install":"add",h=t?o==="npm"?"--save-dev":"-D":"",d=[l,...e,...h?[h]:[]],g=r||process.cwd();for(let m=1;m<=s;m++)try{n.text=`Installing dependencies (attempt ${m}/${s})...`,await O(o,d,{cwd:g,stdio:"pipe",timeout:12e4});return}catch(b){let f=b instanceof Error?b.message:String(b);if(console.log(i.gray(`  Install attempt ${m} failed: ${f.substring(0,100)}`)),m===s)throw b;await new Promise(w=>setTimeout(w,2e3))}}async function wt(e){let o=C.join(e,"drizzle.config.ts");if(await I.pathExists(o)||await I.pathExists(C.join(e,"drizzle.config.js")))return;await I.writeFile(o,`import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`);let t=C.join(e,"drizzle");await I.ensureDir(t),await I.writeFile(C.join(t,"schema.ts"),`import { pgTable, serial, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("inactive"),
  plan: varchar("plan", { length: 50 }).notNull().default("free"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usageRecords = pgTable("usage_records", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  feature: varchar("feature", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  recordedAt: timestamp("recorded_at").defaultNow(),
  metadata: jsonb("metadata"),
});
`)}async function vt(e,o,n){try{n.text="Running database migrations...",await O("npx",["drizzle-kit","push","--force"],{cwd:e,stdio:"pipe",timeout:6e4,env:{...process.env,SKIP_ENV_VALIDATION:"true"}})}catch(t){let s=t instanceof Error?t.message:String(t);throw s.includes("DATABASE_URL")||s.includes("database")?new Error("DATABASE_URL not configured. Please add it to .env.local"):t}}import _ from"chalk";import kt from"ora";import Ue from"fs-extra";import $e from"path";var ge={"pricing-table":{name:"PricingTable",description:"Beautiful pricing table with Stripe checkout integration",files:["pricing-table.tsx"]},"upgrade-button":{name:"UpgradeButton",description:"Smart upgrade button with plan comparison",files:["upgrade-button.tsx"]},"usage-meter":{name:"UsageMeter",description:"Real-time usage visualization with limits",files:["usage-meter.tsx"]},"current-plan":{name:"CurrentPlanBadge",description:"Shows current plan with upgrade CTA",files:["current-plan.tsx"]},"billing-portal":{name:"BillingPortalButton",description:"Opens Stripe customer portal",files:["billing-portal-button.tsx"]},"subscription-gate":{name:"SubscriptionGate",description:"Blocks content based on subscription status",files:["subscription-gate.tsx"]},"trial-banner":{name:"TrialBanner",description:"Shows trial status and countdown",files:["trial-banner.tsx"]},all:{name:"All Components",description:"Install all billing components",files:["pricing-table.tsx","upgrade-button.tsx","usage-meter.tsx","current-plan.tsx","billing-portal-button.tsx","subscription-gate.tsx","trial-banner.tsx","index.ts"]}};async function Oe(e,o){console.log(_.blue.bold(`
\u{1F4E6} drew-billing-cli add
`));let n=Object.keys(ge);n.includes(e)||(console.log(_.red(`Invalid component: ${e}
`)),console.log(_.gray("Available components:")),n.forEach(d=>{if(d==="all")return;let g=ge[d];console.log(_.gray(`  \u2022 ${d}`)+` - ${g.description}`)}),console.log(_.gray("  \u2022 all - Install all components")),console.log(),process.exit(1));let t=ge[e],s=o.path||"components/billing",r=o.cwd||process.cwd(),l=$e.join(r,s);console.log(_.gray(`Installing ${t.name}...
`)),await Ue.ensureDir(l);let h=kt("Creating components...").start();try{for(let d of t.files){let g=xt(d);await Ue.writeFile($e.join(l,d),g)}h.succeed(`Installed ${t.name} to ${s}/`)}catch(d){h.fail("Failed to install component"),console.error(d),process.exit(1)}console.log(_.green.bold(`
\u2705 Component installed!
`)),console.log(_.gray("Usage:")),console.log(e==="all"?_.cyan(`import { PricingTable, UpgradeButton } from "${s}";`):_.cyan(`import { ${t.name} } from "${s}/${e.replace("billing-portal","billing-portal-button")}";`)),console.log(),console.log(_.gray("Documentation:"),_.underline("https://github.com/drewsephski/monetize/tree/main/packages/cli#readme")),console.log()}function xt(e){return{"pricing-table.tsx":St(),"upgrade-button.tsx":Pt(),"usage-meter.tsx":Et(),"current-plan.tsx":_t(),"billing-portal-button.tsx":It(),"subscription-gate.tsx":Ct(),"trial-banner.tsx":Tt(),"index.ts":Nt()}[e]||`// ${e} - Component template
export function Placeholder() { return null; }`}function St(){return`"use client";

import { useState } from "react";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceLabel?: string;
  currency: string;
  interval: "month" | "year";
  features: string[];
  cta: string;
  popular?: boolean;
  disabled?: boolean;
  priceId?: string;
}

interface PricingTableProps {
  plans: Plan[];
  currentPlanId?: string;
  userId: string;
  onSubscribe: (planId: string, priceId?: string) => Promise<void>;
  className?: string;
}

export function PricingTable({
  plans,
  currentPlanId,
  userId,
  onSubscribe,
  className,
}: PricingTableProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    if (plan.id === "free" || !plan.priceId) return;
    
    setLoadingPlan(plan.id);
    try {
      await onSubscribe(plan.id, plan.priceId);
    } finally {
      setLoadingPlan(null);
    }
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    if (price === 0) return "Free";
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    });
    return \`\${formatter.format(price / 100)}/\${interval}\`;
  };

  return (
    <div className={\`grid gap-6 lg:grid-cols-3 \${className || ""}\`}>
      {plans.map((plan) => {
        const isCurrentPlan = currentPlanId === plan.id;
        const isLoading = loadingPlan === plan.id;
        const isPopular = plan.popular;

        return (
          <div
            key={plan.id}
            className={\`relative flex flex-col rounded-lg border p-6 \${
              isPopular ? "border-blue-500 shadow-lg scale-105" : "border-gray-200"
            }\`}
          >
            {isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
                Most Popular
              </span>
            )}

            <div className="mb-4">
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">
                {plan.priceLabel || formatPrice(plan.price, plan.currency, plan.interval)}
              </span>
            </div>

            <ul className="mb-6 flex-1 space-y-3">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="h-5 w-5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={\`w-full rounded-lg px-4 py-2 font-medium transition-colors \${
                isPopular
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-300 hover:bg-gray-50"
              } \${isCurrentPlan || isLoading ? "opacity-60 cursor-not-allowed" : ""}\`}
              disabled={isCurrentPlan || isLoading || plan.disabled}
              onClick={() => handleSubscribe(plan)}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : isCurrentPlan ? (
                "Current Plan"
              ) : (
                plan.cta
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
`}function Pt(){return`"use client";

import { useState } from "react";

interface UpgradeButtonProps {
  userId: string;
  currentPlan: string;
  targetPlan: "pro" | "enterprise";
  onUpgrade: (targetPlan: string) => Promise<void>;
  showCurrentLabel?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function UpgradeButton({
  userId,
  currentPlan,
  targetPlan,
  onUpgrade,
  showCurrentLabel = true,
  children,
  className,
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isCurrent = currentPlan === targetPlan;

  const handleUpgrade = async () => {
    if (isCurrent) return;

    setIsLoading(true);
    try {
      await onUpgrade(targetPlan);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCurrent && showCurrentLabel) {
    return (
      <button
        disabled
        className={\`rounded-lg border border-gray-300 px-4 py-2 opacity-60 \${className || ""}\`}
      >
        Current Plan
      </button>
    );
  }

  return (
    <button
      disabled={isLoading || isCurrent}
      onClick={handleUpgrade}
      className={\`rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60 \${className || ""}\`}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children || \`Upgrade to \${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)}\`
      )}
    </button>
  );
}
`}function Et(){return`"use client";

import { useEffect, useState } from "react";

interface UsageMeterProps {
  userId: string;
  feature: string;
  limit: number;
  current?: number;
  label?: string;
  onFetchUsage?: (userId: string, feature: string) => Promise<number>;
  refreshInterval?: number;
  className?: string;
}

export function UsageMeter({
  userId,
  feature,
  limit,
  current: initialCurrent,
  label,
  onFetchUsage,
  refreshInterval = 30000,
  className,
}: UsageMeterProps) {
  const [current, setCurrent] = useState(initialCurrent || 0);
  const [isLoading, setIsLoading] = useState(!initialCurrent && !!onFetchUsage);

  useEffect(() => {
    if (!onFetchUsage || initialCurrent !== undefined) {
      return;
    }

    const fetchUsage = async () => {
      try {
        const usage = await onFetchUsage(userId, feature);
        setCurrent(usage);
      } catch (error) {
        console.error("Failed to fetch usage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchUsage, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [userId, feature, onFetchUsage, refreshInterval, initialCurrent]);

  const percentage = Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80 && percentage < 100;
  const isOverLimit = percentage >= 100;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return \`\${(num / 1000000).toFixed(1)}M\`;
    if (num >= 1000) return \`\${(num / 1000).toFixed(1)}K\`;
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className={\`space-y-2 \${className || ""}\`}>
        <div className="h-2 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className={\`space-y-2 \${className || ""}\`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label || feature}</span>
        <span className="text-gray-600">
          {formatNumber(current)} / {formatNumber(limit)}
        </span>
      </div>

      <div className="relative">
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className={\`h-2 rounded-full transition-all \${
              isOverLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-blue-600"
            }\`}
            style={{ width: \`\${percentage}%\` }}
          />
        </div>
        {(isNearLimit || isOverLimit) && (
          <div className="absolute -right-1 -top-1">
            <svg
              className={\`h-4 w-4 \${isOverLimit ? "text-red-500" : "text-amber-500"}\`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {isNearLimit && !isOverLimit && (
        <p className="text-xs text-amber-600">
          Approaching limit - consider upgrading
        </p>
      )}
      {isOverLimit && (
        <p className="text-xs text-red-600">
          Limit exceeded - upgrade required
        </p>
      )}
    </div>
  );
}
`}function _t(){return`"use client";

interface CurrentPlanProps {
  plan: string;
  status?: "active" | "trialing" | "canceled" | "past_due";
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  features?: string[];
  className?: string;
}

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  pro: "bg-blue-100 text-blue-700",
  enterprise: "bg-amber-100 text-amber-700",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  trialing: "bg-blue-100 text-blue-700",
  canceled: "bg-red-100 text-red-700",
  past_due: "bg-amber-100 text-amber-700",
};

export function CurrentPlanBadge({
  plan,
  status = "active",
  trialEndsAt,
  currentPeriodEnd,
  features,
  className,
}: CurrentPlanProps) {
  const planLower = plan.toLowerCase();
  const isTrial = status === "trialing";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={\`rounded-lg border border-gray-200 overflow-hidden \${className || ""}\`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={\`flex h-12 w-12 items-center justify-center rounded-lg \${
                PLAN_COLORS[planLower] || PLAN_COLORS.free
              }\`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg capitalize">{plan}</h3>
              <span className={\`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium \${
                STATUS_COLORS[status]
              }\`}>
                {isTrial ? "Trial" : status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {isTrial && trialEndsAt && (
          <p className="mt-4 text-sm text-gray-600">
            Trial ends on <strong>{formatDate(trialEndsAt)}</strong>
          </p>
        )}

        {!isTrial && currentPeriodEnd && (
          <p className="mt-4 text-sm text-gray-600">
            Renews on <strong>{formatDate(currentPeriodEnd)}</strong>
          </p>
        )}

        {features && features.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium">Included features:</h4>
            <ul className="space-y-1">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
`}function It(){return`"use client";

import { useState } from "react";

interface BillingPortalButtonProps {
  userId: string;
  returnUrl?: string;
  onOpenPortal: (userId: string, returnUrl?: string) => Promise<string>;
  children?: React.ReactNode;
  className?: string;
}

export function BillingPortalButton({
  userId,
  returnUrl,
  onOpenPortal,
  children,
  className,
}: BillingPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const url = await onOpenPortal(userId, returnUrl || window.location.href);
      window.location.href = url;
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={\`inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium transition-colors hover:bg-gray-50 disabled:opacity-60 \${className || ""}\`}
    >
      {isLoading ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          {children || "Manage Billing"}
        </>
      )}
    </button>
  );
}
`}function Ct(){return`"use client";

interface SubscriptionGateProps {
  hasSubscription: boolean;
  isLoading?: boolean;
  requiredPlan?: string;
  children: React.ReactNode;
  onUpgrade?: () => void;
}

export function SubscriptionGate({
  hasSubscription,
  isLoading,
  requiredPlan = "paid",
  children,
  onUpgrade,
}: SubscriptionGateProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (hasSubscription) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 p-8">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold">Premium Feature</h3>
        <p className="mt-2 text-sm text-gray-600">
          This feature requires a {requiredPlan} subscription
        </p>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Upgrade to Unlock
          </button>
        )}
        <p className="mt-4 text-xs text-gray-500">
          Get access to all premium features and priority support
        </p>
      </div>
    </div>
  );
}
`}function Tt(){return`"use client";

import { useState } from "react";

interface TrialBannerProps {
  trialEndsAt: string;
  onUpgrade: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function TrialBanner({
  trialEndsAt,
  onUpgrade,
  onDismiss,
  className,
}: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const endDate = new Date(trialEndsAt);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  if (dismissed || daysLeft <= 0) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const isUrgent = daysLeft <= 3;

  return (
    <div
      className={\`relative rounded-lg border p-4 \${
        isUrgent
          ? "border-amber-400 bg-amber-50"
          : "border-blue-200 bg-blue-50"
      } \${className || ""}\`}
    >
      <div className="flex items-start gap-3">
        <svg
          className={\`h-5 w-5 shrink-0 \${isUrgent ? "text-amber-600" : "text-blue-600"}\`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h4 className={\`font-medium \${isUrgent ? "text-amber-900" : "text-blue-900"}\`}>
            {daysLeft === 1
              ? "Trial ends tomorrow"
              : \`Trial ends in \${daysLeft} days\`}
          </h4>
          <p className={\`mt-1 text-sm \${isUrgent ? "text-amber-800" : "text-blue-800"}\`}>
            {isUrgent
              ? "Don't lose access to premium features. Upgrade now to keep your subscription active."
              : "You're on a trial. Upgrade anytime to continue using all features."}
          </p>
          <button
            onClick={onUpgrade}
            className={\`mt-3 inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium \${
              isUrgent
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
            }\`}
          >
            Upgrade Now
          </button>
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="rounded p-1 opacity-70 transition-opacity hover:opacity-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
`}function Nt(){return`export { PricingTable } from "./pricing-table";
export { UpgradeButton } from "./upgrade-button";
export { UsageMeter } from "./usage-meter";
export { CurrentPlanBadge } from "./current-plan";
export { BillingPortalButton } from "./billing-portal-button";
export { SubscriptionGate } from "./subscription-gate";
export { TrialBanner } from "./trial-banner";
`}import v from"chalk";import Y from"ora";import W from"fs-extra";import K from"path";async function Be(){console.log(v.blue.bold(`
\u{1F50D} @drew/billing verify
`)),console.log(v.gray(`Checking your billing setup...
`));let e=[],o=Y("Checking environment variables...").start();try{let d=K.join(process.cwd(),".env.local");if(!await W.pathExists(d))e.push({name:"Environment File",status:"fail",message:".env.local not found"}),o.fail();else{let m=await W.readFile(d,"utf-8"),f=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"].filter(w=>!m.includes(w));f.length>0?(e.push({name:"Environment Variables",status:"fail",message:`Missing: ${f.join(", ")}`}),o.fail()):(e.push({name:"Environment Variables",status:"pass",message:"All required variables present"}),o.succeed())}}catch{e.push({name:"Environment Variables",status:"fail",message:"Could not read .env file"}),o.fail()}let n=Y("Checking Stripe connection...").start();try{let d=(await import("stripe")).default,m=await new d(process.env.STRIPE_SECRET_KEY,{apiVersion:"2023-10-16"}).accounts.retrieve();e.push({name:"Stripe API",status:"pass",message:`Connected to ${m.settings?.dashboard?.display_name||"Stripe account"}`}),n.succeed()}catch{e.push({name:"Stripe API",status:"fail",message:"Could not connect to Stripe API"}),n.fail()}let t=Y("Checking database...").start();try{let d=await W.pathExists(K.join(process.cwd(),"drizzle.config.ts")),g=await W.pathExists(K.join(process.cwd(),"drizzle/schema.ts"));d&&g?(e.push({name:"Database Setup",status:"pass",message:"Drizzle ORM configured"}),t.succeed()):(e.push({name:"Database Setup",status:"warn",message:"Database configuration not detected"}),t.warn())}catch{e.push({name:"Database Setup",status:"warn",message:"Could not verify database setup"}),t.warn()}let s=Y("Checking API routes...").start();try{let d=["api/checkout/route.ts","api/webhooks/stripe/route.ts","api/entitlements/[userId]/route.ts"],g=K.join(process.cwd(),"app"),m=[];for(let b of d){let f=K.join(g,b);await W.pathExists(f)||m.push(b)}m.length>0?(e.push({name:"API Routes",status:"warn",message:`Missing routes: ${m.length}`}),s.warn()):(e.push({name:"API Routes",status:"pass",message:"All required routes present"}),s.succeed())}catch{e.push({name:"API Routes",status:"warn",message:"Could not verify API routes"}),s.warn()}let r=Y("Checking SDK...").start();try{let d=await W.readJson(K.join(process.cwd(),"package.json"));d.dependencies?.stripe||d.devDependencies?.stripe?(e.push({name:"Stripe SDK",status:"pass",message:"stripe SDK installed"}),r.succeed()):(e.push({name:"Stripe SDK",status:"fail",message:"Stripe SDK not found in dependencies"}),r.fail())}catch{e.push({name:"SDK Installation",status:"fail",message:"Could not check package.json"}),r.fail()}console.log(v.blue.bold(`
\u{1F4CA} Summary
`));let l=e.filter(d=>d.status==="pass").length,h=e.filter(d=>d.status==="fail").length;e.forEach(d=>{let g=d.status==="pass"?v.green("\u2713"):d.status==="fail"?v.red("\u2717"):v.yellow("\u26A0"),m=d.status==="pass"?v.green:d.status==="fail"?v.red:v.yellow;console.log(`${g} ${m(d.name)}`),console.log(v.gray(`  ${d.message}`))}),console.log(),h===0?(console.log(v.green.bold("\u2705 All checks passed!")),console.log(v.gray("Your billing setup looks good."))):h>0&&l>0?(console.log(v.yellow.bold("\u26A0\uFE0F  Some checks failed")),console.log(v.gray("Review the issues above to complete your setup."))):(console.log(v.red.bold("\u274C Setup incomplete")),console.log(v.gray("Run: npx drew-billing-cli init"))),console.log(),console.log(v.gray("Next steps:")),console.log(v.gray("  \u2022 Start dev server: npm run dev")),console.log(v.gray("  \u2022 Start webhook listener: stripe listen --forward-to localhost:3000/api/webhooks/stripe")),console.log(v.gray("  \u2022 View docs: https://github.com/drewsephski/monetize/tree/main/packages/cli#readme")),console.log()}import S from"chalk";import Rt from"ora";import Me from"fs-extra";import Lt from"path";async function Fe(e){console.log(S.blue.bold(`
\u{1F3D6}\uFE0F  @drew/billing sandbox
`));let o=Lt.join(process.cwd(),".env.local"),n="";try{n=await Me.readFile(o,"utf-8")}catch{}let t;if(e.enable)t=!0;else if(e.disable)t=!1;else{let r=n.match(/BILLING_SANDBOX_MODE=(true|false)/);t=!(r?r[1]==="true":!1)}let s=Rt(t?"Enabling sandbox mode...":"Disabling sandbox mode...").start();try{n.includes("BILLING_SANDBOX_MODE=")?n=n.replace(/BILLING_SANDBOX_MODE=(true|false)/,`BILLING_SANDBOX_MODE=${t}`):n+=`
# Sandbox mode - no real charges
BILLING_SANDBOX_MODE=${t}
`,await Me.writeFile(o,n),s.succeed()}catch(r){s.fail("Failed to update sandbox mode"),console.log(r),process.exit(1)}t?(console.log(S.green.bold(`
\u2705 Sandbox mode ENABLED
`)),console.log(S.gray("What this means:")),console.log(S.gray("  \u2022 No real charges will be processed")),console.log(S.gray("  \u2022 Stripe test mode API keys used")),console.log(S.gray("  \u2022 Webhooks simulated locally")),console.log(S.gray("  \u2022 Usage tracked but not billed")),console.log(),console.log(S.yellow("Perfect for development and testing!"))):(console.log(S.yellow.bold(`
\u26A0\uFE0F  Sandbox mode DISABLED
`)),console.log(S.gray("What this means:")),console.log(S.gray("  \u2022 Real charges will be processed")),console.log(S.gray("  \u2022 Stripe live mode API keys required")),console.log(S.gray("  \u2022 Production webhooks active")),console.log(),console.log(S.red("Make sure you have live Stripe keys configured!"))),console.log(),console.log(S.gray("Switch back anytime:")),console.log(S.cyan("  npx drew-billing-cli sandbox")),console.log()}import c from"chalk";import B from"fs-extra";import D from"path";async function ze(){console.log(c.blue.bold(`
\u{1F464} drew-billing-cli whoami
`));try{let f=await B.readJson(D.join(process.cwd(),"package.json"));console.log(c.gray("Project:"),c.white(f.name||"Unknown")),console.log(c.gray("Version:"),c.white(f.version||"Unknown"))}catch{console.log(c.gray("Project:"),c.yellow("Could not read package.json"))}let e=D.join(process.cwd(),".env.local"),o={};try{(await B.readFile(e,"utf-8")).split(`
`).forEach(w=>{let k=w.match(/^([A-Z_]+)=(.+)$/);k&&(o[k[1]]=k[2].replace(/^["']/,"").replace(/["']$/,""))})}catch{}console.log(),console.log(c.gray("Environment:"));let n=o.STRIPE_SECRET_KEY||"",t=n.startsWith("sk_test_"),s=n.startsWith("sk_live_");t?console.log(c.gray("  Stripe:"),c.yellow("TEST MODE")):s?console.log(c.gray("  Stripe:"),c.green("LIVE MODE \u26A0\uFE0F")):console.log(c.gray("  Stripe:"),c.red("Not configured"));let r=o.BILLING_SANDBOX_MODE==="true";console.log(c.gray("  Sandbox:"),r?c.green("Enabled"):c.gray("Disabled"));let l=o.NEXT_PUBLIC_BILLING_API_URL||o.BILLING_API_URL;console.log(c.gray("  API URL:"),l||c.red("Not set"));try{let f=await B.readJson(D.join(process.cwd(),"package.json")),w=f.dependencies?.["@drew/billing-sdk"]||f.devDependencies?.["@drew/billing-sdk"];w?console.log(c.gray("  SDK:"),w):console.log(c.gray("  SDK:"),c.red("Not installed"))}catch{}console.log();let h=D.join(process.cwd(),"components/billing");try{let w=(await B.readdir(h)).filter(k=>k.endsWith(".tsx"));w.length>0?(console.log(c.gray("Installed Components:")),w.forEach(k=>{console.log(c.gray("  \u2022"),k.replace(".tsx",""))})):(console.log(c.gray("Components:"),c.yellow("None installed")),console.log(c.gray("  Install with: npx drew-billing-cli add <component>")))}catch{console.log(c.gray("Components:"),c.yellow("None installed"))}console.log();let d=await B.pathExists(D.join(process.cwd(),"drizzle.config.ts"));console.log(c.gray("Database:"),d?c.green("Configured"):c.yellow("Not configured"));let g=D.join(process.cwd(),"app/api"),m=await B.pathExists(D.join(g,"checkout/route.ts")),b=await B.pathExists(D.join(g,"webhooks/stripe/route.ts"));console.log(c.gray("API Routes:")),console.log(c.gray("  /api/checkout"),m?c.green("\u2713"):c.red("\u2717")),console.log(c.gray("  /api/webhooks/stripe"),b?c.green("\u2713"):c.red("\u2717")),console.log(),console.log(c.gray("Commands:")),console.log(c.gray("  init       Initialize billing")),console.log(c.gray("  add        Add UI components")),console.log(c.gray("  verify     Verify setup")),console.log(c.gray("  sandbox    Toggle sandbox mode")),console.log()}import y from"chalk";async function We(e){console.log(y.blue.bold(`
\u{1F4CA} Telemetry Settings
`));let o=q();if(e.enable){Ne(),console.log(y.green("\u2705 Anonymous telemetry enabled")),console.log(y.gray(`
We collect:`)),console.log(y.gray("  \u2022 Command usage (init, add, verify, etc.)")),console.log(y.gray("  \u2022 Performance metrics (timing)")),console.log(y.gray("  \u2022 Error reports (no stack traces with PII)")),console.log(y.gray(`
We NEVER collect:`)),console.log(y.gray("  \u2022 Personal information")),console.log(y.gray("  \u2022 Stripe keys or API credentials")),console.log(y.gray("  \u2022 Code or project details")),console.log(y.gray("  \u2022 IP addresses")),z("telemetry_enabled");return}if(e.disable){Re(),console.log(y.yellow("\u274C Anonymous telemetry disabled")),console.log(y.gray("You can re-enable anytime with: npx drew-billing-cli telemetry --enable"));return}console.log(y.white("Current status:")),console.log(`  Enabled: ${o.enabled?y.green("Yes"):y.red("No")}`),o.machineId&&console.log(`  Machine ID: ${y.gray(o.machineId)}`),o.optedInAt&&console.log(`  Decision date: ${y.gray(o.optedInAt)}`),console.log(y.gray(`
Usage:`)),console.log(y.gray("  npx drew-billing-cli telemetry --enable   # Enable telemetry")),console.log(y.gray("  npx drew-billing-cli telemetry --disable  # Disable telemetry")),console.log(y.gray(`  npx drew-billing-cli telemetry            # Show status
`)),o.optedInAt||(console.log(y.blue("\u{1F4A1} Why enable telemetry?")),console.log(y.gray("Anonymous data helps us improve the CLI and catch bugs faster.")),console.log(y.gray(`No personal information is ever collected.
`)))}import x from"chalk";import{readFileSync as H,existsSync as M}from"fs";import{join as A}from"path";import{execa as Dt}from"execa";async function Ke(){console.log(x.blue.bold(`
\u{1F50D} @drew/billing doctor
`)),console.log(x.gray(`Running diagnostics...
`));let e=[];e.push(await At()),e.push(await jt()),e.push(await Ut()),e.push(await $t()),e.push(await Ot()),e.push(await Bt()),e.push(await Mt()),Ft(e)}async function At(){let e=A(process.cwd(),".env.local"),o=A(process.cwd(),".env.example"),n="";M(e)?n=H(e,"utf-8"):M(A(process.cwd(),".env"))&&(n=H(A(process.cwd(),".env"),"utf-8"));let t=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY","STRIPE_WEBHOOK_SECRET"],s=t.filter(l=>!n.includes(l));if(s.length===0)return{name:"Environment Variables",status:"pass",message:"All required variables configured"};let r=M(o);return{name:"Environment Variables",status:"fail",message:`Missing: ${s.join(", ")}`,fix:r?"cp .env.example .env.local && edit with your Stripe keys":`Create .env.local with:
${t.map(l=>`${l}=...`).join(`
`)}`}}async function jt(){try{let e=new AbortController,o=setTimeout(()=>e.abort(),2e3),n=await fetch("http://localhost:3000/api/health",{signal:e.signal}).catch(()=>null);return clearTimeout(o),n?.ok?{name:"API Connectivity",status:"pass",message:"Billing API responding at localhost:3000"}:{name:"API Connectivity",status:"warn",message:"Dev server not running or API not accessible",fix:"Start dev server: npm run dev"}}catch{return{name:"API Connectivity",status:"warn",message:"Could not connect to localhost:3000",fix:"Start dev server: npm run dev"}}}async function Ut(){let e=A(process.cwd(),".env.local"),o="";if(M(e)){let t=H(e,"utf-8").match(/STRIPE_WEBHOOK_SECRET=(.+)/);t&&(o=t[1].trim())}return!o||o==="whsec_..."?{name:"Webhook Configuration",status:"fail",message:"Webhook secret not configured",fix:`1. Run: stripe listen --forward-to http://localhost:3000/api/stripe/webhook
2. Copy webhook secret to .env.local`}:o.startsWith("whsec_")?{name:"Webhook Configuration",status:"pass",message:"Webhook secret configured"}:{name:"Webhook Configuration",status:"warn",message:"Webhook secret format looks unusual",fix:"Verify STRIPE_WEBHOOK_SECRET starts with 'whsec_'"}}async function $t(){try{if(!M(A(process.cwd(),"drizzle.config.ts")))return{name:"Database Connection",status:"fail",message:"No Drizzle config found",fix:"Run: npx drew-billing-cli init to set up database"};try{return await Dt("npx",["drizzle-kit","check"],{cwd:process.cwd(),timeout:1e4,reject:!1}),{name:"Database Connection",status:"pass",message:"Database configuration found"}}catch{return{name:"Database Connection",status:"warn",message:"Database config exists but connection not verified",fix:"Run: npx drizzle-kit push to sync schema"}}}catch{return{name:"Database Connection",status:"warn",message:"Could not verify database connection"}}}async function Ot(){let e=A(process.cwd(),".env.local"),o="";if(M(e)){let t=H(e,"utf-8").match(/STRIPE_SECRET_KEY=(.+)/);t&&(o=t[1].trim())}return o?o.startsWith("sk_test_")?{name:"Stripe Configuration",status:"pass",message:"Test mode Stripe key configured"}:o.startsWith("sk_live_")?{name:"Stripe Configuration",status:"warn",message:"\u26A0\uFE0F Live Stripe key detected",fix:"Use test keys for development: https://dashboard.stripe.com/test/apikeys"}:{name:"Stripe Configuration",status:"fail",message:"Invalid Stripe key format",fix:"Key should start with sk_test_ or sk_live_"}:{name:"Stripe Configuration",status:"fail",message:"STRIPE_SECRET_KEY not found",fix:"Add STRIPE_SECRET_KEY=sk_test_... to .env.local"}}async function Bt(){let e=A(process.cwd(),"package.json");if(!M(e))return{name:"Dependencies",status:"fail",message:"No package.json found",fix:"Run: npm init"};try{let o=JSON.parse(H(e,"utf-8")),n={...o.dependencies,...o.devDependencies},s=["stripe","drizzle-orm"].filter(r=>!n[r]);return s.length===0?{name:"Dependencies",status:"pass",message:"All required packages installed"}:{name:"Dependencies",status:"fail",message:`Missing: ${s.join(", ")}`,fix:`npm install ${s.join(" ")}`}}catch{return{name:"Dependencies",status:"warn",message:"Could not parse package.json"}}}async function Mt(){let e=await X();return e.name==="nextjs"?{name:"Framework Support",status:"pass",message:`Next.js ${e.version||""} detected`}:{name:"Framework Support",status:"warn",message:`${e.name} detected (limited support)`,fix:"Next.js is fully supported. Other frameworks have basic support."}}function Ft(e){let o=e.filter(s=>s.status==="pass").length,n=e.filter(s=>s.status==="fail").length,t=e.filter(s=>s.status==="warn").length;console.log(x.white.bold(`Results:
`));for(let s of e){let r=s.status==="pass"?x.green("\u2713"):s.status==="fail"?x.red("\u2717"):x.yellow("\u26A0");console.log(`${r} ${x.white(s.name)}`),console.log(`  ${x.gray(s.message)}`),s.fix&&console.log(`  ${x.cyan("Fix:")} ${s.fix}`),console.log()}console.log(x.white.bold("Summary:")),console.log(`  ${x.green(`${o} passing`)}`),n>0&&console.log(`  ${x.red(`${n} failing`)}`),t>0&&console.log(`  ${x.yellow(`${t} warnings`)}`),n===0&&t===0?console.log(x.green.bold(`
\u2705 All checks passed! Your billing setup looks good.
`)):n===0?console.log(x.yellow(`
\u26A0\uFE0F  Some warnings - review above.
`)):(console.log(x.red(`
\u274C ${n} issue(s) need attention. Run the suggested fixes above.
`)),console.log(x.gray(`Need help? https://github.com/drewsephski/monetize/issues
`)))}import a from"chalk";import F from"inquirer";import G from"ora";import{execa as Ve}from"execa";import zt from"fs-extra";import Wt from"path";async function qe(e){console.log(a.blue.bold(`
\u{1F517} Stripe Webhook Setup Wizard
`)),console.log(a.gray("This wizard helps you set up Stripe webhooks correctly.")),console.log(a.gray(`Webhooks are REQUIRED for production to keep subscription data in sync.
`));let o=process.cwd();await zt.pathExists(Wt.join(o,"vercel.json"));let n=G("Checking environment...").start(),t=!!process.env.STRIPE_SECRET_KEY,s=!!process.env.STRIPE_WEBHOOK_SECRET;if(n.succeed("Environment check complete"),console.log(a.blue(`
\u{1F4CB} Current Status:`)),console.log(`  Stripe Secret Key: ${t?a.green("\u2713 Set"):a.red("\u2717 Missing")}`),console.log(`  Webhook Secret: ${s?a.green("\u2713 Set"):a.red("\u2717 Missing")}`),console.log(),!t){console.log(a.red("\u274C STRIPE_SECRET_KEY not found in environment.")),console.log(a.gray(`Run: npx drew-billing-cli init  to set up your Stripe keys first.
`));return}let r=await F.prompt([{type:"list",name:"deploymentStage",message:"What's your deployment status?",choices:[{name:"\u{1F5A5}\uFE0F  Local development only (use Stripe CLI for testing)",value:"local"},{name:"\u{1F680} Deployed to Vercel (production webhook setup)",value:"production"},{name:"\u{1F4CB} Show me the complete deployment checklist",value:"checklist"}],default:"local"}]);if(r.deploymentStage==="checklist"){qt();return}r.deploymentStage==="local"?await Kt(o):await Vt(o)}async function Kt(e){console.log(a.blue(`
\u{1F5A5}\uFE0F  Local Development Webhook Setup
`));let o=G("Checking for Stripe CLI...").start();try{await Ve("stripe",["--version"]),o.succeed("Stripe CLI found")}catch{o.fail("Stripe CLI not found"),console.log(a.yellow(`
\u26A0\uFE0F  Stripe CLI is required for local webhook testing.`)),console.log(a.gray("Install it:")),console.log(a.gray("  macOS: brew install stripe/stripe-cli/stripe")),console.log(a.gray("  Windows: scoop install stripe")),console.log(a.gray(`  Other: https://docs.stripe.com/stripe-cli
`));return}let n=G("Checking Stripe CLI login status...").start();try{await Ve("stripe",["config","--list"]),n.succeed("Stripe CLI authenticated")}catch{n.fail("Not logged in to Stripe CLI"),console.log(a.yellow(`
\u26A0\uFE0F  Please login first:`)),console.log(a.gray(`  stripe login
`));return}console.log(a.green(`
\u2705 Ready to test webhooks locally!
`)),console.log(a.blue("Next steps:")),console.log("1. Start your Next.js dev server:"),console.log(a.gray("   npm run dev")),console.log(),console.log("2. In a new terminal, forward webhooks to your local server:"),console.log(a.gray("   stripe listen --forward-to localhost:3000/api/billing/webhook")),console.log(),console.log("3. The CLI will output a webhook signing secret."),console.log("   Add it to your .env.local as STRIPE_WEBHOOK_SECRET"),console.log(),console.log("4. Test a checkout flow - the webhook will fire automatically."),console.log();let{setSecret:t}=await F.prompt([{type:"confirm",name:"setSecret",message:"Do you have a webhook secret from stripe listen?",default:!1}]);if(t){let{secret:s}=await F.prompt([{type:"input",name:"secret",message:"Paste your webhook secret (whsec_...):",validate:l=>l.startsWith("whsec_")?!0:"Must start with whsec_"}]),r=G("Updating .env.local...").start();await V({STRIPE_WEBHOOK_SECRET:s}),r.succeed("Webhook secret saved to .env.local")}console.log(a.gray(`
\u{1F4A1} Tip: Use 'stripe trigger checkout.session.completed' to test webhooks manually.
`))}async function Vt(e){console.log(a.blue(`
\u{1F680} Production Webhook Setup
`)),console.log(a.yellow("\u26A0\uFE0F  Important: You must deploy to Vercel FIRST to get a production URL.")),console.log(a.gray(`Without a deployed URL, you can't configure Stripe webhooks.
`));let{hasDeployed:o}=await F.prompt([{type:"confirm",name:"hasDeployed",message:"Have you deployed your app to Vercel?",default:!1}]);if(!o){console.log(a.blue(`
\u{1F4CB} Deployment Steps:`)),console.log(),console.log("1. Push your code to GitHub:"),console.log(a.gray("   git add .")),console.log(a.gray("   git commit -m 'Initial commit'")),console.log(a.gray("   git push origin main")),console.log(),console.log("2. Connect to Vercel:"),console.log(a.gray("   - Go to https://vercel.com/new")),console.log(a.gray("   - Import your GitHub repository")),console.log(a.gray("   - Add environment variables from .env.local")),console.log(),console.log("3. Once deployed, copy your production URL:"),console.log(a.gray("   https://your-app.vercel.app")),console.log(),console.log(`4. Run this wizard again and select 'Deployed to Vercel'
`);return}let{productionUrl:n}=await F.prompt([{type:"input",name:"productionUrl",message:"Enter your production URL (e.g., https://your-app.vercel.app):",validate:r=>r?r.startsWith("https://")?!0:"Must start with https://":"URL is required"}]),t=`${n}/api/billing/webhook`;console.log(a.blue(`
\u{1F517} Configure this webhook endpoint in your Stripe Dashboard:`)),console.log(a.gray(`   URL: ${t}`)),console.log(),console.log("1. Go to: https://dashboard.stripe.com/webhooks"),console.log("2. Click 'Add endpoint'"),console.log(`3. Enter URL: ${t}`),console.log("4. Select these events:"),console.log(a.gray("   - checkout.session.completed")),console.log(a.gray("   - customer.subscription.created")),console.log(a.gray("   - customer.subscription.updated")),console.log(a.gray("   - customer.subscription.deleted")),console.log(a.gray("   - invoice.paid")),console.log(a.gray("   - invoice.payment_failed")),console.log("5. Click 'Add endpoint'"),console.log("6. Copy the 'Signing secret' (whsec_...)"),console.log();let{hasSecret:s}=await F.prompt([{type:"confirm",name:"hasSecret",message:"Do you have the webhook signing secret from Stripe Dashboard?",default:!1}]);if(s){let{secret:r}=await F.prompt([{type:"input",name:"secret",message:"Paste your webhook signing secret (whsec_...):",validate:h=>h.startsWith("whsec_")?!0:"Must start with whsec_"}]),l=G("Updating environment...").start();await V({STRIPE_WEBHOOK_SECRET:r}),l.succeed("Webhook secret saved"),console.log(a.yellow(`
\u26A0\uFE0F  Remember to add STRIPE_WEBHOOK_SECRET to your Vercel environment variables!`)),console.log(a.gray(`   Vercel Dashboard \u2192 Project \u2192 Settings \u2192 Environment Variables
`))}console.log(a.green(`
\u2705 Production webhook setup complete!`)),console.log(a.gray(`Test a checkout flow to verify everything works.
`))}function qt(){console.log(a.blue.bold(`
\u{1F4CB} Complete Production Deployment Checklist
`)),console.log(a.yellow("Phase 1: Local Development")),console.log("[ ] Run: npx drew-billing-cli init"),console.log("[ ] Set up local database (Neon or local Postgres)"),console.log("[ ] Run: npm run dev"),console.log("[ ] Install Stripe CLI: brew install stripe/stripe-cli/stripe"),console.log("[ ] Login to Stripe CLI: stripe login"),console.log("[ ] Forward webhooks: stripe listen --forward-to localhost:3000/api/billing/webhook"),console.log("[ ] Add webhook secret to .env.local"),console.log("[ ] Test checkout flow locally"),console.log(),console.log(a.yellow("Phase 2: Deploy to Vercel")),console.log("[ ] Push code to GitHub"),console.log("[ ] Create Vercel project: https://vercel.com/new"),console.log("[ ] Add environment variables in Vercel Dashboard:"),console.log(a.gray("    - STRIPE_SECRET_KEY")),console.log(a.gray("    - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")),console.log(a.gray("    - NEXT_PUBLIC_STRIPE_PRICE_PRO")),console.log(a.gray("    - NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE")),console.log(a.gray("    - DATABASE_URL")),console.log("[ ] Deploy and copy production URL"),console.log(),console.log(a.yellow("Phase 3: Configure Production Webhook")),console.log("[ ] Go to: https://dashboard.stripe.com/webhooks"),console.log("[ ] Add endpoint with production URL + /api/billing/webhook"),console.log("[ ] Select events: checkout.session.completed, customer.subscription.*, invoice.*"),console.log("[ ] Copy signing secret"),console.log("[ ] Add STRIPE_WEBHOOK_SECRET to Vercel environment variables"),console.log("[ ] Redeploy Vercel project to apply new env vars"),console.log(),console.log(a.yellow("Phase 4: Production Testing")),console.log("[ ] Test checkout with real card (then refund)"),console.log("[ ] Verify webhook events appear in logs"),console.log("[ ] Check database records subscription data"),console.log("[ ] Test subscription cancellation"),console.log(),console.log(a.green(`\u2728 Once all checks pass, you're ready for launch!
`))}var Qt=Gt(import.meta.url),Zt=Xt(Qt),eo=JSON.parse(Ht(Jt(Zt,"../package.json"),"utf-8")),T=new Yt;T.name("drew-billing-cli").description("CLI for drew-billing - Add subscriptions to your app in 10 minutes").version(eo.version);T.command("init").description("Initialize @drew/billing in your Next.js project").option("--skip-stripe","Skip Stripe product creation").option("--template <type>","Template type (saas, api, usage, ai-credits)","saas").option("--yes","Skip prompts and use defaults").action(je);T.command("add <component>").description("Add a billing component (pricing-table, upgrade-button, usage-meter)").option("--path <path>","Custom installation path").action(Oe);T.command("verify").description("Verify your billing setup is working correctly").action(Be);T.command("sandbox").description("Toggle sandbox mode for testing without real charges").option("--enable","Enable sandbox mode").option("--disable","Disable sandbox mode").action(Fe);T.command("whoami").description("Show current billing configuration").action(ze);T.command("telemetry").description("Manage anonymous usage telemetry").option("--enable","Enable telemetry").option("--disable","Disable telemetry").action(We);T.command("doctor").description("Diagnose billing setup issues").action(Ke);T.command("setup-webhook").description("Guide for setting up Stripe webhooks (local or production)").option("--production","Production webhook setup mode").option("--skip-install","Skip Stripe CLI installation check").action(qe);process.argv.length===2&&(console.log(te.blue.bold(`
\u26A1 drew-billing-cli
`)),console.log(`Add subscriptions to your app in 10 minutes.
`),console.log(te.gray("Quick start:")),console.log(`  npx drew-billing-cli init
`),console.log(te.gray("Commands:")),console.log("  init           Initialize billing in your project"),console.log("  add            Add prebuilt UI components"),console.log("  verify         Verify your setup"),console.log("  sandbox        Toggle sandbox mode"),console.log("  whoami         Show current configuration"),console.log("  doctor         Diagnose setup issues"),console.log("  setup-webhook  Guide for Stripe webhook setup"),console.log(`  telemetry      Manage usage telemetry
`),console.log(te.gray("Documentation:")),console.log(`  https://github.com/drewsephski/monetize
`));T.parse();
//# sourceMappingURL=index.js.map