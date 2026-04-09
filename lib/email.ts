import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'billing@monetize-two.vercel.app';

interface LicenseEmailParams {
  to: string;
  licenseKey: string;
  tier: string;
  customerName?: string;
}

function getTierDisplayName(tier: string): string {
  const tierNames: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    team: 'Team',
    enterprise: 'Enterprise',
  };
  return tierNames[tier.toLowerCase()] || tier;
}

function getTierFeatures(tier: string): string[] {
  const features: Record<string, string[]> = {
    free: [
      '1,000 API calls per month',
      '1 active project',
      'Basic billing features',
      'Community support',
    ],
    pro: [
      '10,000 API calls per month',
      '5 active projects',
      'All billing features',
      'Email support',
      'Usage analytics',
    ],
    team: [
      '100,000 API calls per month',
      '20 active projects',
      'Team license sharing',
      'Custom integrations',
      'Priority support',
    ],
    enterprise: [
      'Unlimited API calls',
      'Unlimited projects',
      'SSO & user management',
      'SLA guarantee',
      'White-glove setup',
    ],
  };
  return features[tier.toLowerCase()] || features.free;
}

export async function sendLicenseEmail({
  to,
  licenseKey,
  tier,
  customerName,
}: LicenseEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    const tierName = getTierDisplayName(tier);
    const features = getTierFeatures(tier);

    const { data, error } = await resend.emails.send({
      from: `Drew Billing <${FROM_EMAIL}>`,
      to,
      subject: `Your Drew Billing SDK License Key - ${tierName} Plan`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Drew Billing License</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1c1917; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #b8860b; }
    .logo { font-size: 24px; font-weight: bold; color: #b8860b; }
    .content { padding: 30px 0; }
    .license-box { background: #fafaf9; border: 2px solid #e7e5e4; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .license-key { font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #1c1917; background: white; padding: 15px; border-radius: 6px; border: 1px dashed #b8860b; word-break: break-all; }
    .features { background: #f5f5f4; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .features h3 { margin-top: 0; color: #44403c; }
    .features ul { margin: 10px 0; padding-left: 20px; }
    .features li { margin: 8px 0; color: #57534e; }
    .cta { text-align: center; margin: 30px 0; }
    .cta a { display: inline-block; background: #b8860b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
    .footer { text-align: center; padding: 20px 0; color: #78716c; font-size: 14px; border-top: 1px solid #e7e5e4; margin-top: 30px; }
    .code-block { background: #1c1917; color: #e7e5e4; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; overflow-x: auto; }
    .code-block code { color: #22c55e; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">⚡ Drew Billing</div>
  </div>
  
  <div class="content">
    <h2>Thank you for your purchase${customerName ? `, ${customerName}` : ''}!</h2>
    
    <p>Your Drew Billing SDK license is ready. Here's everything you need to get started:</p>
    
    <div class="license-box">
      <p style="margin: 0 0 10px 0; color: #78716c; font-size: 14px;">Your License Key</p>
      <div class="license-key">${licenseKey}</div>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #a8a29e;">Copy and save this key securely</p>
    </div>
    
    <div class="features">
      <h3>${tierName} Plan Features</h3>
      <ul>
        ${features.map(f => `<li>✓ ${f}</li>`).join('')}
      </ul>
    </div>
    
    <h3>Quick Start</h3>
    <p>Install the SDK in your project:</p>
    <div class="code-block">
      <code>npm install @drew/billing-sdk</code>
    </div>
    
    <p style="margin-top: 20px;">Set your license key:</p>
    <div class="code-block">
      <code>export DREW_BILLING_LICENSE_KEY="${licenseKey}"</code>
    </div>
    
    <div class="cta">
      <a href="/docs">View Documentation →</a>
    </div>
    
    <p style="font-size: 14px; color: #78716c;">
      <strong>Need help?</strong> Reply to this email or visit our 
      <a href="https://github.com/drewsephski/monetize/issues">support page</a>.
    </p>
  </div>
  
  <div class="footer">
    <p>Drew Billing SDK License</p>
    <p style="font-size: 12px;">This license key is tied to your account. Do not share it publicly.</p>
  </div>
</body>
</html>
      `,
      text: `
Thank you for purchasing Drew Billing SDK!

Your License Key: ${licenseKey}
Plan: ${tierName}

Features:
${features.map(f => `- ${f}`).join('\n')}

Quick Start:
1. Install: npm install @drew/billing-sdk
2. Set your license key: export DREW_BILLING_LICENSE_KEY="${licenseKey}"

Documentation: See your documentation at /docs
Support: https://github.com/drewsephski/monetize/issues
      `,
    });

    if (error) {
      console.error('Failed to send license email:', error);
      return { success: false, error: error.message };
    }

    console.log(`License email sent to ${to}, email ID:`, data?.id);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error sending license email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendLicenseRegeneratedEmail({
  to,
  licenseKey,
}: Omit<LicenseEmailParams, 'tier' | 'customerName'>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    const { error } = await resend.emails.send({
      from: `Drew Billing <${FROM_EMAIL}>`,
      to,
      subject: 'Your Drew Billing License Key Has Been Regenerated',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1c1917; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #b8860b; }
    .license-box { background: #fafaf9; border: 2px solid #e7e5e4; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .license-key { font-family: monospace; font-size: 18px; font-weight: bold; color: #1c1917; background: white; padding: 15px; border-radius: 6px; border: 1px dashed #b8860b; word-break: break-all; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h2>License Key Regenerated</h2>
  </div>
  
  <p>Your Drew Billing SDK license key has been regenerated. Your old key is no longer active.</p>
  
  <div class="warning">
    <strong>⚠️ Important:</strong> Update your environment variables with the new key immediately.
  </div>
  
  <div class="license-box">
    <p style="margin: 0 0 10px 0; color: #78716c;">Your New License Key</p>
    <div class="license-key">${licenseKey}</div>
  </div>
  
  <p>Update your environment:</p>
  <pre style="background: #1c1917; color: #e7e5e4; padding: 15px; border-radius: 6px;">
export DREW_BILLING_LICENSE_KEY="${licenseKey}"
  </pre>
</body>
</html>
      `,
      text: `
Your Drew Billing license key has been regenerated.

NEW LICENSE KEY: ${licenseKey}

IMPORTANT: Your old key is no longer active. Update your environment variables immediately.

export DREW_BILLING_LICENSE_KEY="${licenseKey}"
      `,
    });

    if (error) {
      console.error('Failed to send regenerated email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
