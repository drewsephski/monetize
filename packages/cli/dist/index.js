#!/usr/bin/env node
import{Command as Rt}from"commander";import J from"chalk";import o from"chalk";import re from"inquirer";import I from"ora";import P from"fs-extra";import _ from"path";import{execa as A}from"execa";import T from"fs-extra";import D from"path";async function V(){let e=process.cwd(),n=D.join(e,"package.json");if(await T.pathExists(n)){let s=await T.readJson(n),t={...s.dependencies,...s.devDependencies};if(t.next){let r=await T.pathExists(D.join(e,"app")),a=await T.pathExists(D.join(e,"pages"));return{name:"nextjs",version:t.next,type:r?"app":a?"pages":"app"}}if(t.react)return{name:"react",version:t.react};if(t.vue||t["@vue/core"])return{name:"vue",version:t.vue||t["@vue/core"]};if(t.express)return{name:"express",version:t.express}}return await T.pathExists(D.join(e,"next.config.js"))||await T.pathExists(D.join(e,"next.config.ts"))||await T.pathExists(D.join(e,"next.config.mjs"))?{name:"nextjs",type:"app"}:await T.pathExists(D.join(e,"vite.config.ts"))?{name:"react"}:{name:"unknown"}}import ze from"stripe";async function Z(e,n,s){try{let a=await e.prices.search({query:`lookup_key:"${s.lookup_key}"`});if(a.data.length>0){let l=a.data[0],y=await e.products.retrieve(typeof l.product=="string"?l.product:l.product.id);return{productId:y.id,priceId:l.id,name:y.name}}}catch{}let t=await e.products.create(n),r=await e.prices.create({product:t.id,unit_amount:s.unit_amount,currency:s.currency,recurring:s.recurring,lookup_key:s.lookup_key});return{productId:t.id,priceId:r.id,name:t.name}}async function ce(e){let n=new ze(e,{apiVersion:"2023-10-16"}),s=[];try{let t=await Z(n,{name:"Pro",description:"For growing businesses",metadata:{tier:"pro",features:JSON.stringify(["10,000 API calls/mo","Unlimited projects","Priority support","Advanced analytics"])}},{unit_amount:2900,currency:"usd",recurring:{interval:"month"},lookup_key:`pro_monthly_${Date.now()}`});s.push({id:t.productId,name:t.name,priceId:t.priceId})}catch(t){console.warn("Failed to create Pro plan:",t instanceof Error?t.message:String(t))}try{let t=await Z(n,{name:"Enterprise",description:"For large organizations",metadata:{tier:"enterprise",features:JSON.stringify(["Unlimited API calls","Custom integrations","SLA guarantee","Dedicated support"])}},{unit_amount:9900,currency:"usd",recurring:{interval:"month"},lookup_key:`enterprise_monthly_${Date.now()}`});s.push({id:t.productId,name:t.name,priceId:t.priceId})}catch(t){console.warn("Failed to create Enterprise plan:",t instanceof Error?t.message:String(t))}try{let t=await Z(n,{name:"API Calls",description:"Per-call pricing for API usage",metadata:{type:"usage",unit:"api_call"}},{unit_amount:1,currency:"usd",recurring:{interval:"month",usage_type:"metered"},lookup_key:`api_calls_${Date.now()}`});s.push({id:t.productId,name:"API Calls (Usage)",priceId:t.priceId})}catch(t){console.warn("Failed to create Usage plan:",t instanceof Error?t.message:String(t))}if(s.length===0)throw new Error("Failed to create any Stripe products. Check your API key and try again.");return s}import O from"fs-extra";import E from"path";import pe from"chalk";import{globby as Fe}from"globby";import{fileURLToPath as Ke}from"url";var We="https://billing.drew.dev/docs",de="https://github.com/drewsephski/monetize",ue={saas:{appName:"SaaS Starter",eyebrow:"Subscription product",examplesPath:"examples/saas-starter"},api:{appName:"API Product",eyebrow:"Usage-based API",examplesPath:"examples/api-product"},usage:{appName:"AI Credits",eyebrow:"AI credits product",examplesPath:"examples/ai-credits"}},Ve=new Set([".css",".env",".js",".json",".md",".mjs",".ts",".tsx",".txt"]);async function me(e,n,s){let t=Y(e),r=s||process.cwd(),a=Ye(),l=qe(t,n);console.log(pe.blue(`
\u{1F4C4} Installing ${l.__APP_NAME__} template assets...`)),await ge(E.join(a,"common"),r,l),await ge(E.join(a,t),r,l),console.log(pe.green(`\u2705 ${l.__APP_NAME__} template installed
`))}function Y(e){let n=e.trim().toLowerCase();if(n==="ai-credits")return"usage";if(n==="saas"||n==="api"||n==="usage")return n;throw new Error(`Unknown template: ${e}`)}function fe(e){let n=Y(e);return ue[n].appName}function Ye(){let e=Ke(import.meta.url),n=E.resolve(E.dirname(e),"..","..");return E.join(n,"templates")}function qe(e,n){let s=ue[e],t=`${de}/tree/main/${s.examplesPath}`,r=n.find(l=>/pro|growth|studio/i.test(l.name)),a=n.find(l=>/enterprise|scale/i.test(l.name));return{__APP_NAME__:s.appName,__APP_EYEBROW__:s.eyebrow,__DOCS_URL__:We,__GITHUB_URL__:de,__EXAMPLES_URL__:t,__PRO_PRICE_ID__:r?.priceId||"price_placeholder_pro",__ENTERPRISE_PRICE_ID__:a?.priceId||"price_placeholder_enterprise"}}async function ge(e,n,s){if(!await O.pathExists(e))return;let t=await Fe(["**/*"],{cwd:e,dot:!0,onlyFiles:!0});for(let r of t){let a=E.join(e,r),l=E.join(n,r);if(await O.ensureDir(E.dirname(l)),He(a)){let y=await O.readFile(a,"utf8");await O.writeFile(l,Ge(y,s),"utf8");continue}await O.copyFile(a,l)}}function He(e){return Ve.has(E.extname(e))}function Ge(e,n){return Object.entries(n).reduce((s,[t,r])=>s.split(t).join(r),e)}import he from"fs-extra";import Je from"path";async function be(e){let n=Je.join(process.cwd(),".env.local"),s="";try{s=await he.readFile(n,"utf-8")}catch{}for(let[t,r]of Object.entries(e)){let a=`${t}=${r}`;s.includes(`${t}=`)?s=s.replace(new RegExp(`${t}=.*`),a):(s+=s.endsWith(`
`)?"":`
`,s+=`${a}
`)}await he.writeFile(n,s)}import q from"fs-extra";import H from"path";import{execa as Xt}from"execa";async function ye(){let e=process.cwd();return await q.pathExists(H.join(e,"bun.lockb"))||await q.pathExists(H.join(e,"bun.lock"))?"bun":await q.pathExists(H.join(e,"pnpm-lock.yaml"))?"pnpm":await q.pathExists(H.join(e,"yarn.lock"))?"yarn":"npm"}import{createHash as Xe}from"crypto";import{readFileSync as Qe,existsSync as xe,writeFileSync as Ze,mkdirSync as et}from"fs";import{homedir as ke}from"os";import{join as Se}from"path";import rn from"chalk";var ee=Se(ke(),".drew-billing"),te=Se(ee,"telemetry.json"),we=process.env.TELEMETRY_ENDPOINT||"";function ve(){let e=`${ke()}_${process.platform}_${process.arch}`;return Xe("sha256").update(e).digest("hex").substring(0,16)}function z(){try{if(xe(te)){let e=JSON.parse(Qe(te,"utf-8"));return{enabled:e.enabled??!1,machineId:e.machineId||ve(),optedInAt:e.optedInAt}}}catch{}return{enabled:!1,machineId:ve()}}function Pe(e){try{xe(ee)||et(ee,{recursive:!0}),Ze(te,JSON.stringify(e,null,2))}catch{}}function _e(){let e=z();e.enabled=!0,e.optedInAt=new Date().toISOString(),Pe(e)}function Ee(){let e=z();e.enabled=!1,Pe(e)}function tt(){return`cli_${Math.random().toString(36).substring(2,15)}_${Date.now()}`}function U(e,n){let s=z();if(!s.enabled)return;let t={type:e,timestamp:new Date().toISOString(),machineId:s.machineId,sessionId:tt(),cliVersion:"1.0.0",metadata:n};nt(t).catch(()=>{})}function Ie(e,n,s){U(e,{...s,durationMs:n})}async function nt(e){if(!we){process.env.DEBUG==="true"&&console.log("[Telemetry]",e);return}try{await fetch(we,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}catch{}}var ne={CLI_INSTALL:"cli_install",INIT_STARTED:"init_started",INIT_COMPLETED:"init_completed",SANDBOX_STARTED:"sandbox_started",FIRST_CHECKOUT:"first_checkout",FIRST_SUBSCRIPTION:"first_subscription"};function se(e,n){U(`funnel_${e}`,n)}import G from"chalk";import Ce from"inquirer";async function Ne(e,n){console.log(),console.log(G.blue.bold("\u{1F4E3} Quick Feedback")),console.log(G.gray("Your feedback helps us improve.")),console.log();try{let{wasEasy:s}=await Ce.prompt([{type:"confirm",name:"wasEasy",message:"Was this easy to set up?",default:!0}]),t;if(!s){let{feedback:r}=await Ce.prompt([{type:"input",name:"feedback",message:"What was difficult? (optional, 1 sentence)"}]);t=r}U("feedback_collected",{eventType:e,rating:s?"positive":"negative",feedback:t,...n}),console.log(),console.log(s?G.green("\u2728 Thanks! Glad it went smoothly."):G.yellow("\u{1F4DD} Thanks for the feedback \u2014 we'll use it to improve.")),console.log()}catch{}}async function Te(e){console.log(o.blue.bold(`
\u26A1 drew-billing-cli init
`)),se(ne.INIT_STARTED,{template:e.template});let n=Date.now(),s=process.cwd(),t=await it(s),r=await P.pathExists(_.join(s,"package.json")),a="npm",l=_.basename(s),y={name:"nextjs"},c=!1;if(t||!r){console.log(o.yellow("\u{1F4C1} No existing project detected."));let d=e.yes;e.yes||(d=(await re.prompt([{type:"confirm",name:"shouldScaffold",message:"Create a new Next.js project here?",default:!0}])).shouldScaffold),d||(console.log(o.gray(`
Aborted. Please run this in an existing Next.js project directory.
`)),process.exit(0));let g=await lt(s,e.yes);g.success||(console.log(o.red(`
\u274C Failed to scaffold Next.js project.`)),console.log(o.gray(`Please try manually: npx create-next-app@latest .
`)),process.exit(1)),a=g.pkgManager,l=g.projectName,c=!0,y={name:"nextjs",version:"latest"},console.log(o.green(`
\u2705 Created Next.js project: ${l}
`)),await P.pathExists(_.join(s,"package.json"))||(console.log(o.red(`
\u274C Scaffolded project missing package.json`)),process.exit(1))}else{let d=I("Detecting framework...").start(),g=await V();if(y={name:g.name,version:g.version},g.name!=="nextjs"){d.warn(`Detected: ${g.name} (limited support)`),console.log(o.yellow(`
\u26A0\uFE0F  Currently only Next.js is fully supported.`)),console.log(o.gray(`Other frameworks coming soon: React, Vue, Svelte, Express
`));let{continueAnyway:W}=await re.prompt([{type:"confirm",name:"continueAnyway",message:"Continue with manual setup?",default:!1}]);W||(console.log(o.gray(`
Aborted.
`)),process.exit(0))}else d.succeed(`Detected: ${o.green("Next.js")} ${g.version||""}`);a=await ye()}console.log(o.gray(`Using package manager: ${a}
`));let p;e.yes?p={stripeSecretKey:process.env.STRIPE_SECRET_KEY||"",stripePublishableKey:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY||"",webhookSecret:process.env.STRIPE_WEBHOOK_SECRET||"",databaseUrl:process.env.DATABASE_URL||"",template:e.template||"saas",createProducts:!e.skipStripe}:p={...await re.prompt([{type:"input",name:"stripeSecretKey",message:"Stripe Secret Key (sk_test_...):",default:process.env.STRIPE_SECRET_KEY,validate:g=>g.startsWith("sk_test_")||g.startsWith("sk_live_")?!0:"Must start with sk_test_ or sk_live_"},{type:"input",name:"stripePublishableKey",message:"Stripe Publishable Key (pk_test_...):",default:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,validate:g=>g.startsWith("pk_test_")||g.startsWith("pk_live_")?!0:"Must start with pk_test_ or pk_live_"},{type:"input",name:"databaseUrl",message:"Database URL (postgresql://...):",default:process.env.DATABASE_URL,validate:g=>!g||g.trim()===""?"Database URL is required (use your Neon or local Postgres URL)":!g.startsWith("postgresql://")&&!g.startsWith("postgres://")?"Must start with postgresql:// or postgres://":!0},{type:"list",name:"template",message:"Choose your template:",choices:[{name:"SaaS Starter (overview + pricing + dashboard)",value:"saas"},{name:"API Billing (usage-based pricing)",value:"api"},{name:"AI Credits / Usage (credits + top-ups + dashboard)",value:"usage"},{name:"Minimal (just the SDK)",value:"minimal"}],default:e.template||"saas"},{type:"confirm",name:"createProducts",message:"Create Stripe products automatically?",default:!e.skipStripe}]),webhookSecret:""},console.log(o.blue.bold(`
\u{1F4E6} Setting up drew-billing-cli...
`));let u={projectScaffolded:c,dependencies:!1,stripeProducts:!1,database:!1,templates:!1,env:!1},h=[],m=I("Installing core dependencies...").start();try{await ae(["stripe","lucide-react"],a,m,!1,2,s),m.succeed("Core dependencies installed"),u.dependencies=!0}catch(d){m.fail("Failed to install core dependencies");let g=d instanceof Error?d.message:String(d);h.push(`Dependencies: ${g}`),console.log(o.gray(`Run manually: ${a} ${a==="npm"?"install":"add"} stripe lucide-react`))}let b=I("Installing database dependencies...").start();try{await ae(["drizzle-orm","@neondatabase/serverless","drizzle-kit"],a,b,!1,2,s),b.succeed("Database dependencies installed")}catch(d){b.fail("Failed to install database dependencies");let g=d instanceof Error?d.message:String(d);h.push(`DB Dependencies: ${g}`),console.log(o.gray(`Run manually: ${a} ${a==="npm"?"install":"add"} drizzle-orm @neondatabase/serverless drizzle-kit`))}let v=I("Installing dev dependencies...").start();try{await ae(["@types/node","typescript"],a,v,!0,2,s),v.succeed("Dev dependencies installed")}catch{v.warn("Some dev dependencies may need manual installation")}let N=[];if(p.createProducts&&p.stripeSecretKey){let d=I("Creating Stripe products...").start();try{if(!p.stripeSecretKey.startsWith("sk_test_")&&!p.stripeSecretKey.startsWith("sk_live_"))throw new Error("Invalid Stripe secret key format");N=await ce(p.stripeSecretKey),d.succeed(`Created ${N.length} Stripe products`),u.stripeProducts=!0}catch(g){d.fail("Failed to create Stripe products");let W=g instanceof Error?g.message:String(g);h.push(`Stripe products: ${W}`),console.log(o.gray("You can create them manually in the Stripe Dashboard")),console.log(o.gray("Then update the price IDs in your code")),N=[{id:"prod_fallback",name:"Pro",priceId:"price_fallback_pro"},{id:"prod_fallback_2",name:"Enterprise",priceId:"price_fallback_enterprise"}]}}let X=I("Setting up database...").start();try{await ct(s),await pt(s,a,X),X.succeed("Database configured"),u.database=!0}catch(d){X.fail("Database setup failed");let g=d instanceof Error?d.message:String(d);h.push(`Database: ${g}`),console.log(o.gray("You can set up the database later by running:")),console.log(o.gray("  npx drizzle-kit push")),console.log(o.gray(`
Make sure to set DATABASE_URL in your .env.local file`))}let ie=I(`Installing ${p.template} template...`).start();try{await P.ensureDir(_.join(s,"app")),await P.ensureDir(_.join(s,"components")),await me(p.template,N,s),ie.succeed("Template installed"),u.templates=!0}catch(d){ie.fail("Template installation failed");let g=d instanceof Error?d.message:String(d);h.push(`Templates: ${g}`),console.log(o.gray("Try running:")),console.log(o.gray("  npx drew-billing-cli add all"))}let le=I("Updating environment variables...").start();try{let d={STRIPE_SECRET_KEY:p.stripeSecretKey,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:p.stripePublishableKey,STRIPE_WEBHOOK_SECRET:p.webhookSecret||"whsec_... (run: stripe listen --forward-to localhost:3000/api/webhooks/stripe)",DATABASE_URL:p.databaseUrl||"postgresql://username:password@localhost:5432/database_name",BILLING_API_URL:"http://localhost:3000"};await be(d),le.succeed("Environment variables configured"),u.env=!0}catch(d){le.fail("Failed to update .env");let g=d instanceof Error?d.message:String(d);h.push(`Environment: ${g}`)}let Q=Date.now()-n;se(ne.INIT_COMPLETED,{template:p.template,durationMs:Q,framework:y.name,success:Object.values(u).every(d=>d)}),Ie("init_complete",Q);let Oe=p.template==="minimal"?"Minimal SDK":fe(Y(p.template));st({errors:h,pkgManager:a,projectName:l,projectScaffolded:u.projectScaffolded,templateLabel:Oe,templateKey:p.template,dependenciesReady:u.dependencies,sandboxReady:u.templates}),N.length>0&&u.stripeProducts?(console.log(o.gray("Created Stripe products:")),N.forEach(d=>{console.log(o.gray(`  \u2022 ${d.name}: ${d.priceId}`))}),console.log()):N.length>0&&(console.log(o.gray("Placeholder product IDs (update these in your code):")),N.forEach(d=>{console.log(o.gray(`  \u2022 ${d.name}: ${d.priceId}`))}),console.log()),console.log(o.blue("\u{1F4CA} Help improve drew-billing-cli")),console.log(o.gray("Enable anonymous telemetry to help us fix bugs faster.")),console.log(o.gray(`Run: npx drew-billing-cli telemetry --enable
`)),await Ne("init_completed",{template:p.template,framework:y.name,durationMs:Q,results:u})}function st({errors:e,pkgManager:n,projectName:s,projectScaffolded:t,templateLabel:r,templateKey:a,dependenciesReady:l,sandboxReady:y}){let c=at(n,"billing:sandbox"),p=rt(n),u=ot(a),h=[];t&&h.push(`cd ${s}`),l||h.push(p),h.push(c);let m=(b,v)=>`${o.gray(b.padEnd(20))}${o.white(v)}`;console.log(o.green.bold(`
\u25C6 Setup Complete
`)),console.log(m("Created",r)),console.log(m("Template key",a)),console.log(m("Package manager",n)),console.log(m("Dependencies",l?"Installed":`Needs manual step (${p})`)),console.log(m("Sandbox mode",y?"Ready":"Template install incomplete")),console.log(m("First action","Open /pricing and complete checkout")),console.log(o.white(`
Next steps`)),h.forEach((b,v)=>{console.log(o.gray(`${v+1}.`),o.cyan(b))}),console.log(o.white(`
Local URLs`)),Object.entries(u).forEach(([b,v])=>{console.log(o.gray(`- ${b}:`),o.cyan(v))}),e.length>0&&(console.log(o.yellow(`
Warnings`)),e.forEach(b=>{console.log(o.gray(`- ${b}`))})),console.log(),console.log(o.gray("Docs:"),o.underline("https://billing.drew.dev/docs")),console.log(o.gray("Diagnostics:"),o.cyan("npx drew-billing-cli doctor")),console.log(o.gray("Support:"),o.underline("https://github.com/drewsephski/monetize/issues")),console.log()}function rt(e){switch(e){case"bun":return"bun install";case"pnpm":return"pnpm install";case"yarn":return"yarn install";default:return"npm install"}}function at(e,n){switch(e){case"bun":return`bun run ${n}`;case"pnpm":return`pnpm ${n}`;case"yarn":return`yarn ${n}`;default:return`npm run ${n}`}}function ot(e){let n={App:"http://localhost:3000",Pricing:"http://localhost:3000/pricing",Dashboard:"http://localhost:3000/dashboard"};return e==="api"&&(n["API Keys"]="http://localhost:3000/api-keys",n.Usage="http://localhost:3000/usage"),(e==="usage"||e==="ai-credits")&&(n.Usage="http://localhost:3000/usage"),n}async function it(e){try{return(await P.readdir(e)).filter(t=>!t.startsWith(".")&&t!=="node_modules").length===0}catch{return!0}}async function lt(e,n=!1){let s=_.basename(e),t="npm";try{await A("bun",["--version"],{stdio:"pipe"}),t="bun"}catch{try{await A("pnpm",["--version"],{stdio:"pipe"}),t="pnpm"}catch{try{await A("yarn",["--version"],{stdio:"pipe"}),t="yarn"}catch{}}}let r=I(`Creating Next.js project with ${t}...`).start();try{let a=t==="npm"?"npx":t,l=[...t==="npm"?["create-next-app@latest"]:["create","next-app"],".","--typescript","--tailwind","--eslint","--app","--src-dir=false","--import-alias","@/*",...n?["--yes"]:[]];return await A(a,l,{cwd:e,stdio:"pipe",timeout:3e5}),r.succeed("Next.js project created"),{success:!0,pkgManager:t,projectName:s}}catch{if(r.fail("Failed to create Next.js project"),t!=="npm"){r.text="Retrying with npm...",r.start();try{return await A("npx",["create-next-app@latest",".","--typescript","--tailwind","--eslint","--app","--src-dir=false","--import-alias","@/*",...n?["--yes"]:[]],{cwd:e,stdio:"pipe",timeout:3e5}),r.succeed("Next.js project created with npm"),{success:!0,pkgManager:"npm",projectName:s}}catch{return r.fail("All attempts failed"),{success:!1,pkgManager:"npm",projectName:s}}}return{success:!1,pkgManager:t,projectName:s}}}async function ae(e,n,s,t=!1,r=2,a){let l=n==="npm"?"install":"add",y=t?n==="npm"?"--save-dev":"-D":"",c=[l,...e,...y?[y]:[]],p=a||process.cwd();for(let u=1;u<=r;u++)try{s.text=`Installing dependencies (attempt ${u}/${r})...`,await A(n,c,{cwd:p,stdio:"pipe",timeout:12e4});return}catch(h){let m=h instanceof Error?h.message:String(h);if(console.log(o.gray(`  Install attempt ${u} failed: ${m.substring(0,100)}`)),u===r)throw h;await new Promise(b=>setTimeout(b,2e3))}}async function ct(e){let n=_.join(e,"drizzle.config.ts");if(await P.pathExists(n)||await P.pathExists(_.join(e,"drizzle.config.js")))return;await P.writeFile(n,`import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`);let t=_.join(e,"drizzle");await P.ensureDir(t),await P.writeFile(_.join(t,"schema.ts"),`import { pgTable, serial, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

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
`)}async function pt(e,n,s){try{s.text="Running database migrations...",await A("npx",["drizzle-kit","push","--force"],{cwd:e,stdio:"pipe",timeout:6e4,env:{...process.env,SKIP_ENV_VALIDATION:"true"}})}catch(t){let r=t instanceof Error?t.message:String(t);throw r.includes("DATABASE_URL")||r.includes("database")?new Error("DATABASE_URL not configured. Please add it to .env.local"):t}}import S from"chalk";import dt from"ora";import Le from"fs-extra";import Re from"path";var oe={"pricing-table":{name:"PricingTable",description:"Beautiful pricing table with Stripe checkout integration",files:["pricing-table.tsx"]},"upgrade-button":{name:"UpgradeButton",description:"Smart upgrade button with plan comparison",files:["upgrade-button.tsx"]},"usage-meter":{name:"UsageMeter",description:"Real-time usage visualization with limits",files:["usage-meter.tsx"]},"current-plan":{name:"CurrentPlanBadge",description:"Shows current plan with upgrade CTA",files:["current-plan.tsx"]},"billing-portal":{name:"BillingPortalButton",description:"Opens Stripe customer portal",files:["billing-portal-button.tsx"]},"subscription-gate":{name:"SubscriptionGate",description:"Blocks content based on subscription status",files:["subscription-gate.tsx"]},"trial-banner":{name:"TrialBanner",description:"Shows trial status and countdown",files:["trial-banner.tsx"]},all:{name:"All Components",description:"Install all billing components",files:["pricing-table.tsx","upgrade-button.tsx","usage-meter.tsx","current-plan.tsx","billing-portal-button.tsx","subscription-gate.tsx","trial-banner.tsx","index.ts"]}};async function De(e,n){console.log(S.blue.bold(`
\u{1F4E6} drew-billing-cli add
`));let s=Object.keys(oe);s.includes(e)||(console.log(S.red(`Invalid component: ${e}
`)),console.log(S.gray("Available components:")),s.forEach(c=>{if(c==="all")return;let p=oe[c];console.log(S.gray(`  \u2022 ${c}`)+` - ${p.description}`)}),console.log(S.gray("  \u2022 all - Install all components")),console.log(),process.exit(1));let t=oe[e],r=n.path||"components/billing",a=n.cwd||process.cwd(),l=Re.join(a,r);console.log(S.gray(`Installing ${t.name}...
`)),await Le.ensureDir(l);let y=dt("Creating components...").start();try{for(let c of t.files){let p=gt(c);await Le.writeFile(Re.join(l,c),p)}y.succeed(`Installed ${t.name} to ${r}/`)}catch(c){y.fail("Failed to install component"),console.error(c),process.exit(1)}console.log(S.green.bold(`
\u2705 Component installed!
`)),console.log(S.gray("Usage:")),console.log(e==="all"?S.cyan(`import { PricingTable, UpgradeButton } from "${r}";`):S.cyan(`import { ${t.name} } from "${r}/${e.replace("billing-portal","billing-portal-button")}";`)),console.log(),console.log(S.gray("Documentation:"),S.underline("https://github.com/drewsephski/monetize/tree/main/packages/cli#readme")),console.log()}function gt(e){return{"pricing-table.tsx":ut(),"upgrade-button.tsx":mt(),"usage-meter.tsx":ft(),"current-plan.tsx":ht(),"billing-portal-button.tsx":bt(),"subscription-gate.tsx":yt(),"trial-banner.tsx":wt(),"index.ts":vt()}[e]||`// ${e} - Component template
export function Placeholder() { return null; }`}function ut(){return`"use client";

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
`}function mt(){return`"use client";

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
`}function ft(){return`"use client";

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
`}function ht(){return`"use client";

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
`}function bt(){return`"use client";

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
`}function yt(){return`"use client";

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
`}function wt(){return`"use client";

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
`}function vt(){return`export { PricingTable } from "./pricing-table";
export { UpgradeButton } from "./upgrade-button";
export { UsageMeter } from "./usage-meter";
export { CurrentPlanBadge } from "./current-plan";
export { BillingPortalButton } from "./billing-portal-button";
export { SubscriptionGate } from "./subscription-gate";
export { TrialBanner } from "./trial-banner";
`}import w from"chalk";import F from"ora";import M from"fs-extra";import B from"path";async function Ae(){console.log(w.blue.bold(`
\u{1F50D} @drew/billing verify
`)),console.log(w.gray(`Checking your billing setup...
`));let e=[],n=F("Checking environment variables...").start();try{let c=B.join(process.cwd(),".env.local");if(!await M.pathExists(c))e.push({name:"Environment File",status:"fail",message:".env.local not found"}),n.fail();else{let u=await M.readFile(c,"utf-8"),m=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"].filter(b=>!u.includes(b));m.length>0?(e.push({name:"Environment Variables",status:"fail",message:`Missing: ${m.join(", ")}`}),n.fail()):(e.push({name:"Environment Variables",status:"pass",message:"All required variables present"}),n.succeed())}}catch{e.push({name:"Environment Variables",status:"fail",message:"Could not read .env file"}),n.fail()}let s=F("Checking Stripe connection...").start();try{let c=(await import("stripe")).default,u=await new c(process.env.STRIPE_SECRET_KEY,{apiVersion:"2023-10-16"}).accounts.retrieve();e.push({name:"Stripe API",status:"pass",message:`Connected to ${u.settings?.dashboard?.display_name||"Stripe account"}`}),s.succeed()}catch{e.push({name:"Stripe API",status:"fail",message:"Could not connect to Stripe API"}),s.fail()}let t=F("Checking database...").start();try{let c=await M.pathExists(B.join(process.cwd(),"drizzle.config.ts")),p=await M.pathExists(B.join(process.cwd(),"drizzle/schema.ts"));c&&p?(e.push({name:"Database Setup",status:"pass",message:"Drizzle ORM configured"}),t.succeed()):(e.push({name:"Database Setup",status:"warn",message:"Database configuration not detected"}),t.warn())}catch{e.push({name:"Database Setup",status:"warn",message:"Could not verify database setup"}),t.warn()}let r=F("Checking API routes...").start();try{let c=["api/checkout/route.ts","api/webhooks/stripe/route.ts","api/entitlements/[userId]/route.ts"],p=B.join(process.cwd(),"app"),u=[];for(let h of c){let m=B.join(p,h);await M.pathExists(m)||u.push(h)}u.length>0?(e.push({name:"API Routes",status:"warn",message:`Missing routes: ${u.length}`}),r.warn()):(e.push({name:"API Routes",status:"pass",message:"All required routes present"}),r.succeed())}catch{e.push({name:"API Routes",status:"warn",message:"Could not verify API routes"}),r.warn()}let a=F("Checking SDK...").start();try{let c=await M.readJson(B.join(process.cwd(),"package.json"));c.dependencies?.stripe||c.devDependencies?.stripe?(e.push({name:"Stripe SDK",status:"pass",message:"stripe SDK installed"}),a.succeed()):(e.push({name:"Stripe SDK",status:"fail",message:"Stripe SDK not found in dependencies"}),a.fail())}catch{e.push({name:"SDK Installation",status:"fail",message:"Could not check package.json"}),a.fail()}console.log(w.blue.bold(`
\u{1F4CA} Summary
`));let l=e.filter(c=>c.status==="pass").length,y=e.filter(c=>c.status==="fail").length;e.forEach(c=>{let p=c.status==="pass"?w.green("\u2713"):c.status==="fail"?w.red("\u2717"):w.yellow("\u26A0"),u=c.status==="pass"?w.green:c.status==="fail"?w.red:w.yellow;console.log(`${p} ${u(c.name)}`),console.log(w.gray(`  ${c.message}`))}),console.log(),y===0?(console.log(w.green.bold("\u2705 All checks passed!")),console.log(w.gray("Your billing setup looks good."))):y>0&&l>0?(console.log(w.yellow.bold("\u26A0\uFE0F  Some checks failed")),console.log(w.gray("Review the issues above to complete your setup."))):(console.log(w.red.bold("\u274C Setup incomplete")),console.log(w.gray("Run: npx drew-billing-cli init"))),console.log(),console.log(w.gray("Next steps:")),console.log(w.gray("  \u2022 Start dev server: npm run dev")),console.log(w.gray("  \u2022 Start webhook listener: stripe listen --forward-to localhost:3000/api/webhooks/stripe")),console.log(w.gray("  \u2022 View docs: https://github.com/drewsephski/monetize/tree/main/packages/cli#readme")),console.log()}import k from"chalk";import xt from"ora";import je from"fs-extra";import kt from"path";async function $e(e){console.log(k.blue.bold(`
\u{1F3D6}\uFE0F  @drew/billing sandbox
`));let n=kt.join(process.cwd(),".env.local"),s="";try{s=await je.readFile(n,"utf-8")}catch{}let t;if(e.enable)t=!0;else if(e.disable)t=!1;else{let a=s.match(/BILLING_SANDBOX_MODE=(true|false)/);t=!(a?a[1]==="true":!1)}let r=xt(t?"Enabling sandbox mode...":"Disabling sandbox mode...").start();try{s.includes("BILLING_SANDBOX_MODE=")?s=s.replace(/BILLING_SANDBOX_MODE=(true|false)/,`BILLING_SANDBOX_MODE=${t}`):s+=`
# Sandbox mode - no real charges
BILLING_SANDBOX_MODE=${t}
`,await je.writeFile(n,s),r.succeed()}catch(a){r.fail("Failed to update sandbox mode"),console.log(a),process.exit(1)}t?(console.log(k.green.bold(`
\u2705 Sandbox mode ENABLED
`)),console.log(k.gray("What this means:")),console.log(k.gray("  \u2022 No real charges will be processed")),console.log(k.gray("  \u2022 Stripe test mode API keys used")),console.log(k.gray("  \u2022 Webhooks simulated locally")),console.log(k.gray("  \u2022 Usage tracked but not billed")),console.log(),console.log(k.yellow("Perfect for development and testing!"))):(console.log(k.yellow.bold(`
\u26A0\uFE0F  Sandbox mode DISABLED
`)),console.log(k.gray("What this means:")),console.log(k.gray("  \u2022 Real charges will be processed")),console.log(k.gray("  \u2022 Stripe live mode API keys required")),console.log(k.gray("  \u2022 Production webhooks active")),console.log(),console.log(k.red("Make sure you have live Stripe keys configured!"))),console.log(),console.log(k.gray("Switch back anytime:")),console.log(k.cyan("  npx drew-billing-cli sandbox")),console.log()}import i from"chalk";import j from"fs-extra";import L from"path";async function Ue(){console.log(i.blue.bold(`
\u{1F464} drew-billing-cli whoami
`));try{let m=await j.readJson(L.join(process.cwd(),"package.json"));console.log(i.gray("Project:"),i.white(m.name||"Unknown")),console.log(i.gray("Version:"),i.white(m.version||"Unknown"))}catch{console.log(i.gray("Project:"),i.yellow("Could not read package.json"))}let e=L.join(process.cwd(),".env.local"),n={};try{(await j.readFile(e,"utf-8")).split(`
`).forEach(b=>{let v=b.match(/^([A-Z_]+)=(.+)$/);v&&(n[v[1]]=v[2].replace(/^["']/,"").replace(/["']$/,""))})}catch{}console.log(),console.log(i.gray("Environment:"));let s=n.STRIPE_SECRET_KEY||"",t=s.startsWith("sk_test_"),r=s.startsWith("sk_live_");t?console.log(i.gray("  Stripe:"),i.yellow("TEST MODE")):r?console.log(i.gray("  Stripe:"),i.green("LIVE MODE \u26A0\uFE0F")):console.log(i.gray("  Stripe:"),i.red("Not configured"));let a=n.BILLING_SANDBOX_MODE==="true";console.log(i.gray("  Sandbox:"),a?i.green("Enabled"):i.gray("Disabled"));let l=n.NEXT_PUBLIC_BILLING_API_URL||n.BILLING_API_URL;console.log(i.gray("  API URL:"),l||i.red("Not set"));try{let m=await j.readJson(L.join(process.cwd(),"package.json")),b=m.dependencies?.["@drew/billing-sdk"]||m.devDependencies?.["@drew/billing-sdk"];b?console.log(i.gray("  SDK:"),b):console.log(i.gray("  SDK:"),i.red("Not installed"))}catch{}console.log();let y=L.join(process.cwd(),"components/billing");try{let b=(await j.readdir(y)).filter(v=>v.endsWith(".tsx"));b.length>0?(console.log(i.gray("Installed Components:")),b.forEach(v=>{console.log(i.gray("  \u2022"),v.replace(".tsx",""))})):(console.log(i.gray("Components:"),i.yellow("None installed")),console.log(i.gray("  Install with: npx drew-billing-cli add <component>")))}catch{console.log(i.gray("Components:"),i.yellow("None installed"))}console.log();let c=await j.pathExists(L.join(process.cwd(),"drizzle.config.ts"));console.log(i.gray("Database:"),c?i.green("Configured"):i.yellow("Not configured"));let p=L.join(process.cwd(),"app/api"),u=await j.pathExists(L.join(p,"checkout/route.ts")),h=await j.pathExists(L.join(p,"webhooks/stripe/route.ts"));console.log(i.gray("API Routes:")),console.log(i.gray("  /api/checkout"),u?i.green("\u2713"):i.red("\u2717")),console.log(i.gray("  /api/webhooks/stripe"),h?i.green("\u2713"):i.red("\u2717")),console.log(),console.log(i.gray("Commands:")),console.log(i.gray("  init       Initialize billing")),console.log(i.gray("  add        Add UI components")),console.log(i.gray("  verify     Verify setup")),console.log(i.gray("  sandbox    Toggle sandbox mode")),console.log()}import f from"chalk";async function Me(e){console.log(f.blue.bold(`
\u{1F4CA} Telemetry Settings
`));let n=z();if(e.enable){_e(),console.log(f.green("\u2705 Anonymous telemetry enabled")),console.log(f.gray(`
We collect:`)),console.log(f.gray("  \u2022 Command usage (init, add, verify, etc.)")),console.log(f.gray("  \u2022 Performance metrics (timing)")),console.log(f.gray("  \u2022 Error reports (no stack traces with PII)")),console.log(f.gray(`
We NEVER collect:`)),console.log(f.gray("  \u2022 Personal information")),console.log(f.gray("  \u2022 Stripe keys or API credentials")),console.log(f.gray("  \u2022 Code or project details")),console.log(f.gray("  \u2022 IP addresses")),U("telemetry_enabled");return}if(e.disable){Ee(),console.log(f.yellow("\u274C Anonymous telemetry disabled")),console.log(f.gray("You can re-enable anytime with: npx drew-billing-cli telemetry --enable"));return}console.log(f.white("Current status:")),console.log(`  Enabled: ${n.enabled?f.green("Yes"):f.red("No")}`),n.machineId&&console.log(`  Machine ID: ${f.gray(n.machineId)}`),n.optedInAt&&console.log(`  Decision date: ${f.gray(n.optedInAt)}`),console.log(f.gray(`
Usage:`)),console.log(f.gray("  npx drew-billing-cli telemetry --enable   # Enable telemetry")),console.log(f.gray("  npx drew-billing-cli telemetry --disable  # Disable telemetry")),console.log(f.gray(`  npx drew-billing-cli telemetry            # Show status
`)),n.optedInAt||(console.log(f.blue("\u{1F4A1} Why enable telemetry?")),console.log(f.gray("Anonymous data helps us improve the CLI and catch bugs faster.")),console.log(f.gray(`No personal information is ever collected.
`)))}import x from"chalk";import{readFileSync as K,existsSync as $}from"fs";import{join as R}from"path";import{execa as St}from"execa";async function Be(){console.log(x.blue.bold(`
\u{1F50D} @drew/billing doctor
`)),console.log(x.gray(`Running diagnostics...
`));let e=[];e.push(await Pt()),e.push(await _t()),e.push(await Et()),e.push(await It()),e.push(await Ct()),e.push(await Nt()),e.push(await Tt()),Lt(e)}async function Pt(){let e=R(process.cwd(),".env.local"),n=R(process.cwd(),".env.example"),s="";$(e)?s=K(e,"utf-8"):$(R(process.cwd(),".env"))&&(s=K(R(process.cwd(),".env"),"utf-8"));let t=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY","STRIPE_WEBHOOK_SECRET"],r=t.filter(l=>!s.includes(l));if(r.length===0)return{name:"Environment Variables",status:"pass",message:"All required variables configured"};let a=$(n);return{name:"Environment Variables",status:"fail",message:`Missing: ${r.join(", ")}`,fix:a?"cp .env.example .env.local && edit with your Stripe keys":`Create .env.local with:
${t.map(l=>`${l}=...`).join(`
`)}`}}async function _t(){try{let e=new AbortController,n=setTimeout(()=>e.abort(),2e3),s=await fetch("http://localhost:3000/api/health",{signal:e.signal}).catch(()=>null);return clearTimeout(n),s?.ok?{name:"API Connectivity",status:"pass",message:"Billing API responding at localhost:3000"}:{name:"API Connectivity",status:"warn",message:"Dev server not running or API not accessible",fix:"Start dev server: npm run dev"}}catch{return{name:"API Connectivity",status:"warn",message:"Could not connect to localhost:3000",fix:"Start dev server: npm run dev"}}}async function Et(){let e=R(process.cwd(),".env.local"),n="";if($(e)){let t=K(e,"utf-8").match(/STRIPE_WEBHOOK_SECRET=(.+)/);t&&(n=t[1].trim())}return!n||n==="whsec_..."?{name:"Webhook Configuration",status:"fail",message:"Webhook secret not configured",fix:`1. Run: stripe listen --forward-to http://localhost:3000/api/stripe/webhook
2. Copy webhook secret to .env.local`}:n.startsWith("whsec_")?{name:"Webhook Configuration",status:"pass",message:"Webhook secret configured"}:{name:"Webhook Configuration",status:"warn",message:"Webhook secret format looks unusual",fix:"Verify STRIPE_WEBHOOK_SECRET starts with 'whsec_'"}}async function It(){try{if(!$(R(process.cwd(),"drizzle.config.ts")))return{name:"Database Connection",status:"fail",message:"No Drizzle config found",fix:"Run: npx drew-billing-cli init to set up database"};try{return await St("npx",["drizzle-kit","check"],{cwd:process.cwd(),timeout:1e4,reject:!1}),{name:"Database Connection",status:"pass",message:"Database configuration found"}}catch{return{name:"Database Connection",status:"warn",message:"Database config exists but connection not verified",fix:"Run: npx drizzle-kit push to sync schema"}}}catch{return{name:"Database Connection",status:"warn",message:"Could not verify database connection"}}}async function Ct(){let e=R(process.cwd(),".env.local"),n="";if($(e)){let t=K(e,"utf-8").match(/STRIPE_SECRET_KEY=(.+)/);t&&(n=t[1].trim())}return n?n.startsWith("sk_test_")?{name:"Stripe Configuration",status:"pass",message:"Test mode Stripe key configured"}:n.startsWith("sk_live_")?{name:"Stripe Configuration",status:"warn",message:"\u26A0\uFE0F Live Stripe key detected",fix:"Use test keys for development: https://dashboard.stripe.com/test/apikeys"}:{name:"Stripe Configuration",status:"fail",message:"Invalid Stripe key format",fix:"Key should start with sk_test_ or sk_live_"}:{name:"Stripe Configuration",status:"fail",message:"STRIPE_SECRET_KEY not found",fix:"Add STRIPE_SECRET_KEY=sk_test_... to .env.local"}}async function Nt(){let e=R(process.cwd(),"package.json");if(!$(e))return{name:"Dependencies",status:"fail",message:"No package.json found",fix:"Run: npm init"};try{let n=JSON.parse(K(e,"utf-8")),s={...n.dependencies,...n.devDependencies},r=["stripe","drizzle-orm"].filter(a=>!s[a]);return r.length===0?{name:"Dependencies",status:"pass",message:"All required packages installed"}:{name:"Dependencies",status:"fail",message:`Missing: ${r.join(", ")}`,fix:`npm install ${r.join(" ")}`}}catch{return{name:"Dependencies",status:"warn",message:"Could not parse package.json"}}}async function Tt(){let e=await V();return e.name==="nextjs"?{name:"Framework Support",status:"pass",message:`Next.js ${e.version||""} detected`}:{name:"Framework Support",status:"warn",message:`${e.name} detected (limited support)`,fix:"Next.js is fully supported. Other frameworks have basic support."}}function Lt(e){let n=e.filter(r=>r.status==="pass").length,s=e.filter(r=>r.status==="fail").length,t=e.filter(r=>r.status==="warn").length;console.log(x.white.bold(`Results:
`));for(let r of e){let a=r.status==="pass"?x.green("\u2713"):r.status==="fail"?x.red("\u2717"):x.yellow("\u26A0");console.log(`${a} ${x.white(r.name)}`),console.log(`  ${x.gray(r.message)}`),r.fix&&console.log(`  ${x.cyan("Fix:")} ${r.fix}`),console.log()}console.log(x.white.bold("Summary:")),console.log(`  ${x.green(`${n} passing`)}`),s>0&&console.log(`  ${x.red(`${s} failing`)}`),t>0&&console.log(`  ${x.yellow(`${t} warnings`)}`),s===0&&t===0?console.log(x.green.bold(`
\u2705 All checks passed! Your billing setup looks good.
`)):s===0?console.log(x.yellow(`
\u26A0\uFE0F  Some warnings - review above.
`)):(console.log(x.red(`
\u274C ${s} issue(s) need attention. Run the suggested fixes above.
`)),console.log(x.gray(`Need help? https://github.com/drewsephski/monetize/issues
`)))}var C=new Rt;C.name("drew-billing-cli").description("CLI for drew-billing - Add subscriptions to your app in 10 minutes").version("1.0.0");C.command("init").description("Initialize @drew/billing in your Next.js project").option("--skip-stripe","Skip Stripe product creation").option("--template <type>","Template type (saas, api, usage, ai-credits)","saas").option("--yes","Skip prompts and use defaults").action(Te);C.command("add <component>").description("Add a billing component (pricing-table, upgrade-button, usage-meter)").option("--path <path>","Custom installation path").action(De);C.command("verify").description("Verify your billing setup is working correctly").action(Ae);C.command("sandbox").description("Toggle sandbox mode for testing without real charges").option("--enable","Enable sandbox mode").option("--disable","Disable sandbox mode").action($e);C.command("whoami").description("Show current billing configuration").action(Ue);C.command("telemetry").description("Manage anonymous usage telemetry").option("--enable","Enable telemetry").option("--disable","Disable telemetry").action(Me);C.command("doctor").description("Diagnose billing setup issues").action(Be);process.argv.length===2&&(console.log(J.blue.bold(`
\u26A1 drew-billing-cli
`)),console.log(`Add subscriptions to your app in 10 minutes.
`),console.log(J.gray("Quick start:")),console.log(`  npx drew-billing-cli init
`),console.log(J.gray("Commands:")),console.log("  init       Initialize billing in your project"),console.log("  add        Add prebuilt UI components"),console.log("  verify     Verify your setup"),console.log("  sandbox    Toggle sandbox mode"),console.log("  whoami     Show current configuration"),console.log("  doctor     Diagnose setup issues"),console.log(`  telemetry  Manage usage telemetry
`),console.log(J.gray("Documentation:")),console.log(`  https://billing.drew.dev/docs
`));C.parse();
//# sourceMappingURL=index.js.map