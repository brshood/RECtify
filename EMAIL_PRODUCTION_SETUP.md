# Email Production Setup Guide

**Purpose**: Configure professional email service for RECtify production deployment

---

## Overview

RECtify currently uses development mode (console logging) for emails. For production, you need a reliable email service with proper authentication (SPF, DKIM, DMARC) to ensure deliverability and prevent emails from going to spam.

---

## Option 1: Gmail Business / Google Workspace (Recommended)

### Pros
- ✅ Professional email addresses (noreply@rectifygo.com)
- ✅ Excellent deliverability
- ✅ Reliable infrastructure
- ✅ Easy SPF/DKIM setup
- ✅ Includes email hosting for team
- ✅ Good support

### Cons
- ⚠️ Costs $6-18 USD per user/month
- ⚠️ Overkill if only needed for transactional emails

### Setup Steps

#### 1. Sign Up for Google Workspace
- Go to https://workspace.google.com
- Choose Business Starter ($6/user/month) or Business Standard ($12/user/month)
- Register with your domain: `rectifygo.com`
- Verify domain ownership

#### 2. Create Service Account
- Create: `noreply@rectifygo.com`
- Create: `support@rectifygo.com`
- Enable 2-Factor Authentication

#### 3. Generate App Password
- Go to Google Account settings for `noreply@rectifygo.com`
- Security → 2-Step Verification → App Passwords
- Select "Mail" and "Other (Custom name)"
- Name it "RECtify Backend"
- **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

#### 4. Configure DNS Records

Add these DNS records at your domain registrar (Namecheap, GoDaddy, etc.):

**MX Records** (for receiving email):
```
Priority  Hostname        Value
1         rectifygo.com   ASPMX.L.GOOGLE.COM
5         rectifygo.com   ALT1.ASPMX.L.GOOGLE.COM
5         rectifygo.com   ALT2.ASPMX.L.GOOGLE.COM
10        rectifygo.com   ALT3.ASPMX.L.GOOGLE.COM
10        rectifygo.com   ALT4.ASPMX.L.GOOGLE.COM
```

**SPF Record** (TXT record):
```
Type   Hostname        Value
TXT    rectifygo.com   v=spf1 include:_spf.google.com ~all
```

**DKIM Record**:
- In Google Admin: Apps → Google Workspace → Gmail → Authenticate email
- Generate DKIM key
- Copy the TXT record and add to DNS:
```
Type   Hostname                      Value
TXT    google._domainkey.rectifygo.com   (value provided by Google)
```

**DMARC Record** (TXT record):
```
Type   Hostname               Value
TXT    _dmarc.rectifygo.com   v=DMARC1; p=quarantine; rua=mailto:dmarc@rectifygo.com; ruf=mailto:dmarc@rectifygo.com; fo=1
```

#### 5. Railway Environment Variables

In Railway backend service, set:
```env
EMAIL_USER=noreply@rectifygo.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=noreply@rectifygo.com
```

#### 6. Test Deliverability
- Restart Railway backend
- Test forgot password feature
- Check email arrives in inbox (not spam)
- Test at https://www.mail-tester.com
  - Send test email to provided address
  - Aim for 9/10 or 10/10 score

---

## Option 2: SendGrid (Best for Transactional Emails)

### Pros
- ✅ Built for transactional emails
- ✅ Excellent deliverability
- ✅ Free tier: 100 emails/day
- ✅ Detailed analytics
- ✅ Simple API
- ✅ Automatic SPF/DKIM

### Cons
- ⚠️ Requires code changes (use sendgrid npm package)
- ⚠️ Paid plans needed for higher volume

### Setup Steps

#### 1. Create SendGrid Account
- Go to https://sendgrid.com/pricing
- Sign up for Free plan (100 emails/day)
- Or Essentials ($19.95/month for 50K emails)

#### 2. Verify Domain
- Go to Settings → Sender Authentication → Domain Authentication
- Add your domain: `rectifygo.com`
- SendGrid will provide DNS records

#### 3. Add DNS Records
SendGrid will provide records like:
```
CNAME  s1._domainkey.rectifygo.com  →  s1.domainkey.u12345.wl.sendgrid.net
CNAME  s2._domainkey.rectifygo.com  →  s2.domainkey.u12345.wl.sendgrid.net
CNAME  em1234.rectifygo.com         →  u12345.wl.sendgrid.net
```

Add DMARC record manually:
```
TXT  _dmarc.rectifygo.com  →  v=DMARC1; p=quarantine; rua=mailto:dmarc@rectifygo.com
```

#### 4. Create API Key
- Go to Settings → API Keys
- Create API Key with "Full Access" or "Mail Send" only
- **Copy the API key** (starts with `SG.`)

#### 5. Update Backend Code

Install SendGrid:
```bash
cd backend
npm install @sendgrid/mail
```

Update `backend/utils/emailService.js`:
```javascript
const sgMail = require('@sendgrid/mail');

// In initializeTransporter()
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('📧 Using SendGrid for email delivery');
  
  this.transporter = {
    sendMail: async (mailOptions) => {
      const msg = {
        to: mailOptions.to,
        from: mailOptions.from,
        subject: mailOptions.subject,
        html: mailOptions.html,
      };
      const result = await sgMail.send(msg);
      return { messageId: result[0].headers['x-message-id'] };
    }
  };
}
```

#### 6. Railway Environment Variables
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxx
EMAIL_FROM=noreply@rectifygo.com
```

#### 7. Test
- Restart backend
- Test forgot password
- Check SendGrid dashboard for delivery stats

---

## Option 3: AWS SES (Cheapest for High Volume)

### Pros
- ✅ Very cheap ($0.10 per 1,000 emails)
- ✅ Highly scalable
- ✅ Good deliverability
- ✅ AWS ecosystem integration

### Cons
- ⚠️ More complex setup
- ⚠️ Requires AWS account
- ⚠️ Initially in "sandbox mode" (limits sending)

### Setup Steps

#### 1. Create AWS Account
- Go to https://aws.amazon.com/ses
- Sign up for account
- Verify your email or phone

#### 2. Verify Domain in SES
- Go to SES Console → Verified identities → Create identity
- Choose "Domain"
- Enter: `rectifygo.com`
- Enable DKIM signing

#### 3. Add DNS Records
AWS will provide:
```
TXT   _amazonses.rectifygo.com        →  (verification code)
CNAME ses-dkim-1._domainkey.rectifygo.com  →  (DKIM value 1)
CNAME ses-dkim-2._domainkey.rectifygo.com  →  (DKIM value 2)
CNAME ses-dkim-3._domainkey.rectifygo.com  →  (DKIM value 3)
```

Add SPF:
```
TXT  rectifygo.com  →  v=spf1 include:amazonses.com ~all
```

Add DMARC:
```
TXT  _dmarc.rectifygo.com  →  v=DMARC1; p=quarantine; rua=mailto:dmarc@rectifygo.com
```

#### 4. Request Production Access
- By default, SES is in "sandbox mode" (200 emails/day, verified recipients only)
- Request production access: SES Console → Account dashboard → Request production access
- Explain use case (password reset, transactional emails)
- Usually approved within 24 hours

#### 5. Create IAM User
- Go to IAM → Users → Create user
- Name: `rectify-ses-sender`
- Attach policy: `AmazonSESFullAccess`
- Create access key
- **Copy Access Key ID and Secret Access Key**

#### 6. Install AWS SDK
```bash
cd backend
npm install aws-sdk
```

Update `backend/utils/emailService.js` (similar to SendGrid example).

#### 7. Railway Environment Variables
```env
AWS_SES_ACCESS_KEY_ID=AKIAxxxxxxxxx
AWS_SES_SECRET_ACCESS_KEY=xxxxxxxxxxxx
AWS_SES_REGION=us-east-1
EMAIL_FROM=noreply@rectifygo.com
```

---

## DNS Records Reference

### SPF (Sender Policy Framework)
Prevents email spoofing by specifying which servers can send email for your domain.

**Format**: `v=spf1 [mechanisms] [qualifier]`

**Examples**:
```
v=spf1 include:_spf.google.com ~all           # Google Workspace
v=spf1 include:sendgrid.net ~all              # SendGrid
v=spf1 include:amazonses.com ~all             # AWS SES
v=spf1 include:_spf.google.com include:sendgrid.net ~all  # Multiple
```

### DKIM (DomainKeys Identified Mail)
Cryptographically signs emails to prove they're from your domain.

**Setup**: Provider generates keys, you add TXT records to DNS.

### DMARC (Domain-based Message Authentication)
Tells receiving servers what to do with emails that fail SPF/DKIM checks.

**Policy Options**:
- `p=none`: Monitor only (recommended for start)
- `p=quarantine`: Send to spam if fails
- `p=reject`: Reject email if fails

**Example**:
```
v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@rectifygo.com; ruf=mailto:dmarc@rectifygo.com; fo=1
```

---

## Testing Email Deliverability

### 1. Mail-Tester.com
- Send test email to address provided
- Checks SPF, DKIM, DMARC, content, blacklists
- **Target score**: 9/10 or 10/10

### 2. MXToolbox
- https://mxtoolbox.com/SuperTool.aspx
- Check: SPF, DKIM, DMARC, DNS, blacklists

### 3. Google Postmaster Tools
- https://postmaster.google.com
- Monitor Gmail delivery performance
- Track spam rates and reputation

### 4. Manual Tests
- Send to Gmail, Outlook, Yahoo
- Check inbox vs spam folder
- Verify email appearance
- Test all links work

---

## Monitoring Email Deliverability

### Key Metrics
- **Delivery Rate**: % of emails that reach recipients
- **Open Rate**: % of emails opened (if tracking enabled)
- **Bounce Rate**: % of emails rejected (<5% is good)
- **Spam Rate**: % marked as spam (<0.1% is good)

### Tools
- **SendGrid**: Built-in analytics dashboard
- **AWS SES**: CloudWatch metrics
- **Google Workspace**: Email log search
- **Postmark**: Detailed delivery tracking

### Alerts to Set Up
- Bounce rate >5%
- Spam complaints >0.5%
- Daily send volume drops >50%
- Domain blacklisted

---

## Troubleshooting

### Emails Go to Spam
**Causes**:
- ❌ No SPF/DKIM/DMARC
- ❌ Shared IP with bad reputation
- ❌ Spammy content or subject
- ❌ High bounce rate
- ❌ Domain too new

**Fixes**:
- ✅ Configure SPF/DKIM/DMARC correctly
- ✅ Warm up IP gradually
- ✅ Improve email content
- ✅ Clean email list
- ✅ Request dedicated IP (if high volume)

### Emails Not Delivered
**Causes**:
- ❌ DNS not propagated (wait 24-48 hours)
- ❌ Incorrect credentials
- ❌ Sender not verified
- ❌ Rate limits exceeded

**Fixes**:
- ✅ Check DNS with `dig` or `nslookup`
- ✅ Verify credentials in Railway
- ✅ Complete domain verification
- ✅ Upgrade plan or reduce send rate

### Authentication Failures
**Causes**:
- ❌ Wrong app password
- ❌ 2FA not enabled
- ❌ API key invalid

**Fixes**:
- ✅ Regenerate app password
- ✅ Enable 2FA on service account
- ✅ Create new API key

---

## Recommended Solution for RECtify

**For Soft Launch**:
- **Option 1: Google Workspace** ($6/month)
  - Professional addresses
  - Easy setup
  - Excellent deliverability
  - Good for team email too

**For Growth** (>1,000 emails/day):
- **Option 2: SendGrid** ($19.95/month for 50K emails)
  - Purpose-built for transactional emails
  - Great analytics
  - Scalable

**For Enterprise** (>100,000 emails/month):
- **Option 3: AWS SES** (~$10/100K emails)
  - Most cost-effective at scale
  - Highly reliable

---

## Implementation Checklist

### Pre-Launch
- [ ] Choose email service provider
- [ ] Register/verify domain
- [ ] Add DNS records (SPF, DKIM, DMARC)
- [ ] Wait 24-48 hours for DNS propagation
- [ ] Create service account or API key
- [ ] Configure Railway environment variables
- [ ] Restart backend service

### Testing
- [ ] Test forgot password flow
- [ ] Check email arrives in inbox
- [ ] Test from multiple email providers (Gmail, Outlook, Yahoo)
- [ ] Verify email formatting and links
- [ ] Run mail-tester.com test (aim for 9/10+)
- [ ] Check MXToolbox for DNS issues

### Monitoring
- [ ] Set up delivery monitoring dashboard
- [ ] Configure alerts for high bounce/spam rates
- [ ] Monitor first week closely
- [ ] Adjust DMARC policy after confidence established

---

## Contact for Help

**Email Services Support**:
- Google Workspace: https://support.google.com/a
- SendGrid: https://support.sendgrid.com
- AWS SES: https://aws.amazon.com/ses/support

**DNS Help**:
- Your domain registrar's support
- Cloudflare (if using their DNS)

---

**Estimated Setup Time**: 2-4 hours (plus DNS propagation wait)

**Recommended**: Start setup 48 hours before launch to allow DNS propagation.

