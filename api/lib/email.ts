import nodemailer from "nodemailer";
import { env } from "./env";

// Email configuration - uses env.ts (reads from .env file)
const SMTP_HOST = env.smtpHost;
const SMTP_PORT = env.smtpPort;
const SMTP_USER = env.smtpUser;
const SMTP_PASS = env.smtpPass;
const FROM_EMAIL = env.fromEmail;
const ADMIN_EMAIL = env.adminEmail;

// In-memory email log (for testing when SMTP is not configured)
export const emailLogs: any[] = [];

interface MerchantEmailData {
  id: number;
  businessName: string;
  businessNameAr: string;
  category: string;
  city: string;
  country: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  businessRegistrationPhoto?: string | null;
  ownerIdPhoto?: string | null;
  halalCertificate?: string | null;
  logo?: string | null;
}

function getTransporter() {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransporter({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  // Mock transporter - logs email instead of sending
  return null;
}

export async function sendMerchantRegistrationEmail(merchant: MerchantEmailData): Promise<{ success: boolean; message: string }> {
  const subject = `🏪 طلب تسجيل متجر جديد — ${merchant.businessNameAr}`;
  const reviewLink = `https://euroarabmarket.com/admin/merchants?id=${merchant.id}`;
  const fallbackLink = `https://euro-arab-market.onrender.com/admin/merchants?id=${merchant.id}`;

  // Arabic email body
  const arabicBody = `
مرحباً فريق سندباد،

تم استلام طلب تسجيل متجر جديد:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 معلومات المتجر:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• اسم المتجر: ${merchant.businessNameAr}
• Business Name: ${merchant.businessName}
• التصنيف: ${merchant.category}
• المدينة: ${merchant.city}
• العنوان: ${merchant.address || "غير محدد"}
• الهاتف: ${merchant.phone || "غير محدد"}
• البريد الإلكتروني: ${merchant.email || "غير محدد"}
• الموقع: ${merchant.website || "غير محدد"}

📝 الوصف:
${merchant.descriptionAr || merchant.description || "لا يوجد وصف"}

📎 المرفقات:
• السجل التجاري: ${merchant.businessRegistrationPhoto || "غير مرفق"}
• هوية المالك: ${merchant.ownerIdPhoto || "غير مرفق"}
• شهادة الحلال: ${merchant.halalCertificate || "غير مرفق"}
• شعار المتجر: ${merchant.logo || "غير مرفق"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 رابط مراجعة الطلب:
${reviewLink}
(أو: ${fallbackLink})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  // English email body
  const englishBody = `
Hello Sindbad Team,

A new merchant registration has been received:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Store Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Store Name: ${merchant.businessNameAr} / ${merchant.businessName}
• Category: ${merchant.category}
• City: ${merchant.city}, ${merchant.country}
• Address: ${merchant.address || "Not provided"}
• Phone: ${merchant.phone || "Not provided"}
• Email: ${merchant.email || "Not provided"}
• Website: ${merchant.website || "Not provided"}

Description:
${merchant.description || merchant.descriptionAr || "No description"}

Attachments:
• Business Registration: ${merchant.businessRegistrationPhoto || "Not attached"}
• Owner ID: ${merchant.ownerIdPhoto || "Not attached"}
• Halal Certificate: ${merchant.halalCertificate || "Not attached"}
• Logo: ${merchant.logo || "Not attached"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Review Link: ${reviewLink}
(Fallback: ${fallbackLink})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  const htmlBody = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;}
.container{max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;}
.header{background:linear-gradient(135deg,#0a1628,#1a2744);color:#c9a227;padding:20px;text-align:center;}
.header h1{margin:0;font-size:24px;}
.content{padding:20px;}
.section{margin-bottom:20px;border-right:3px solid #c9a227;padding-right:15px;}
.section h3{color:#1a5f4a;margin-bottom:10px;}
.field{margin-bottom:8px;}
.field-label{font-weight:bold;color:#555;}
.field-value{color:#333;}
.doc-link{display:inline-block;background:#c9a227;color:#0a1628;padding:8px 15px;border-radius:5px;text-decoration:none;margin:5px;font-size:12px;}
.no-doc{color:#999;font-style:italic;}
.review-link{display:block;background:#1a5f4a;color:#fff;text-align:center;padding:15px;border-radius:5px;text-decoration:none;margin:20px 0;font-weight:bold;}
.footer{text-align:center;padding:15px;background:#f9f9f9;color:#999;font-size:12px;}
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🏪 طلب تسجيل متجر جديد</h1>
    <p style="color:#fff;margin:5px 0;">سندباد — دليلك العربي في أوروبا</p>
  </div>
  <div class="content">
    <div class="section">
      <h3>📋 معلومات المتجر</h3>
      <div class="field"><span class="field-label">اسم المتجر:</span> <span class="field-value">${merchant.businessNameAr}</span></div>
      <div class="field"><span class="field-label">Business Name:</span> <span class="field-value">${merchant.businessName}</span></div>
      <div class="field"><span class="field-label">التصنيف:</span> <span class="field-value">${merchant.category}</span></div>
      <div class="field"><span class="field-label">المدينة:</span> <span class="field-value">${merchant.city}, ${merchant.country}</span></div>
      <div class="field"><span class="field-label">العنوان:</span> <span class="field-value">${merchant.address || "غير محدد"}</span></div>
      <div class="field"><span class="field-label">الهاتف:</span> <span class="field-value">${merchant.phone || "غير محدد"}</span></div>
      <div class="field"><span class="field-label">البريد:</span> <span class="field-value">${merchant.email || "غير محدد"}</span></div>
      ${merchant.website ? `<div class="field"><span class="field-label">الموقع:</span> <span class="field-value">${merchant.website}</span></div>` : ""}
    </div>
    <div class="section">
      <h3>📝 الوصف</h3>
      <p>${merchant.descriptionAr || merchant.description || "لا يوجد وصف"}</p>
    </div>
    <div class="section">
      <h3>📎 المرفقات</h3>
      ${merchant.businessRegistrationPhoto ? `<a class="doc-link" href="${merchant.businessRegistrationPhoto}">📄 السجل التجاري</a>` : "<span class='no-doc'>📄 السجل التجاري: غير مرفق</span>"}<br/>
      ${merchant.ownerIdPhoto ? `<a class="doc-link" href="${merchant.ownerIdPhoto}">🆔 هوية المالك</a>` : "<span class='no-doc'>🆔 هوية المالك: غير مرفق</span>"}<br/>
      ${merchant.halalCertificate ? `<a class="doc-link" href="${merchant.halalCertificate}">✅ شهادة الحلال</a>` : "<span class='no-doc'>✅ شهادة الحلال: غير مرفق</span>"}<br/>
      ${merchant.logo ? `<a class="doc-link" href="${merchant.logo}">🎨 شعار المتجر</a>` : "<span class='no-doc'>🎨 شعار المتجر: غير مرفق</span>"}
    </div>
    <a class="review-link" href="${reviewLink}">🔗 مراجعة الطلب في لوحة الإدارة</a>
    <p style="text-align:center;color:#999;font-size:11px;">أو افتح: ${fallbackLink}</p>
  </div>
  <div class="footer">
    سندباد | دليلك العربي في أوروبا | ${new Date().toLocaleDateString("ar-SA")}
  </div>
</div>
</body></html>`;

  const emailData = {
    id: merchant.id,
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject,
    arabicBody,
    englishBody,
    htmlBody,
    sentAt: new Date().toISOString(),
    merchantId: merchant.id,
  };

  // Always log the email
  emailLogs.push(emailData);
  console.log(`[EMAIL] Merchant registration notification logged for ID ${merchant.id}: ${merchant.businessNameAr}`);

  // Try to send via SMTP if configured
  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"سندباد" <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject,
        text: arabicBody + "\n\n" + englishBody,
        html: htmlBody,
      });
      console.log(`[EMAIL] Sent successfully to ${ADMIN_EMAIL}`);
      return { success: true, message: "Email sent successfully" };
    } catch (e: any) {
      console.error(`[EMAIL] SMTP error: ${e.message}`);
      return { success: false, message: `SMTP failed: ${e.message}. Email logged for review.` };
    }
  }

  // No SMTP configured - email is logged only
  console.log(`[EMAIL] SMTP not configured. Email logged for review.`);
  return { success: true, message: "Email logged (SMTP not configured). To enable real email, set SMTP_HOST, SMTP_USER, SMTP_PASS env vars." };
}

// Get recent email logs
export function getEmailLogs(limit: number = 50): any[] {
  return emailLogs.slice(-limit).reverse();
}
