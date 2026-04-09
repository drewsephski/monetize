# Resend Email Setup Guide

Drew Billing uses [Resend](https://resend.com) for transactional emails (license keys, receipts, etc.).

## Quick Setup (5 minutes)

### 1. Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Sign up with your email or GitHub
3. Verify your email address

### 2. Get Your API Key

1. In the Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it: `Drew Billing Production`
4. Select **Sending access** permission
5. Copy the key (starts with `re_`)

### 3. Add to Environment Variables

```bash
# Add to your .env file
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=billing@monetize-two.vercel.app
```

### 4. Verify Your Domain (Recommended)

For production, verify your domain so emails don't go to spam:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter: `monetize-two.vercel.app` (or your custom domain)
4. Follow DNS setup instructions:
   - Add the SPF record to your DNS
   - Add the DKIM record to your DNS
   - Add the DMARC record to your DNS
5. Wait for verification (usually instant, up to 24 hours)

If using Vercel, you can manage DNS in your Vercel dashboard under **Domains**.

### 5. Test Email Sending

```bash
# Test the email integration
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

Or run the built-in test:

```bash
bun run test:email
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | Your Resend API key (starts with `re_`) |
| `RESEND_FROM_EMAIL` | Yes | Sender address (must be verified domain) |

## Free Tier Limits

Resend's free tier includes:

- **3,000 emails/month**
- **100 emails/day**
- Perfect for startups and testing

Upgrade to paid when you exceed these limits.

## Troubleshooting

### Emails not sending

- Check `RESEND_API_KEY` is set correctly
- Verify the from email domain is verified (or use onboarding domain)
- Check server logs for error messages

### Emails going to spam

- Complete domain verification (SPF, DKIM, DMARC)
- Use a recognizable from name: `Drew Billing <billing@yourdomain.com>`
- Avoid spam trigger words in subject lines

### API Key issues

- Ensure key has "Sending access" not just "Sending and access"
- Don't commit API keys to git (use environment variables)

## Testing Without Domain Verification

During development, you can send to your own Resend account email without verification:

```typescript
// In development only
const testEmail = 'your-email@resend.com'; // The email you used to sign up
await sendLicenseEmail({
  to: testEmail,
  licenseKey: 'TEST-KEY',
  tier: 'pro',
});
```

## Production Checklist

- [ ] Resend account created
- [ ] API key generated
- [ ] API key added to production environment
- [ ] Domain verified (recommended)
- [ ] Test email sent successfully
- [ ] Email received in inbox (not spam)

## Next Steps

Once Resend is configured, proceed to [Stripe Webhook Setup](./SETUP_STRIPE.md).
