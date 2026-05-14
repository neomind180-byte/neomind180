import crypto from 'crypto';

export interface PayFastData {
  merchant_id: string;
  merchant_key: string;
  return_url?: string;
  cancel_url?: string;
  notify_url?: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  m_payment_id?: string;
  amount: string;
  item_name: string;
  item_description?: string;
  custom_str1?: string; // User ID
  custom_str2?: string; // Plan ID
  custom_str3?: string; // Billing Period
  [key: string]: string | undefined;
}

/**
 * Generates an MD5 signature for PayFast.
 * IMPORTANT: PayFast uses two different sorting methods:
 * 1. Checkout Form: Strict Document Order.
 * 2. ITN/API: Alphabetical Order.
 */
export function generatePayFastSignature(data: any, passphrase?: string, isItn = false): string {
  const payloadParts: string[] = [];

  if (isItn) {
    // 1. ITN/API Signature (Alphabetical)
    const keys = Object.keys(data)
      .filter(k => k !== 'signature' && data[k] !== undefined && data[k] !== '')
      .sort();

    for (const key of keys) {
      const value = String(data[key]).trim();
      // PHP urlencode exact match
      const encodedValue = encodeURIComponent(value)
        .replace(/%20/g, '+')
        .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
        .replace(/~/g, '%7E');
      payloadParts.push(`${key}=${encodedValue}`);
    }
  } else {
    // 2. Checkout Form Signature (Strict Official Order)
    const orderedKeys = [
      'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
      'name_first', 'name_last', 'email_address', 'm_payment_id', 'amount',
      'item_name', 'custom_str1', 'custom_str2', 'custom_str3', 'custom_str4', 'custom_str5',
      'subscription_type', 'billing_date', 'recurring_amount', 'frequency', 'cycles'
    ];

    for (const key of orderedKeys) {
      const rawValue = data[key];
      if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
        const value = String(rawValue).trim();
        // PHP urlencode exact match
        const encodedValue = encodeURIComponent(value)
          .replace(/%20/g, '+')
          .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
          .replace(/~/g, '%7E');
        payloadParts.push(`${key}=${encodedValue}`);
      }
    }
  }

  let finalString = payloadParts.join('&');
  
  if (passphrase) {
    const encodedPass = encodeURIComponent(passphrase.trim()).replace(/%20/g, '+');
    finalString += `&passphrase=${encodedPass}`;
  }

  // Always log signature string to help debug mismatches
  console.log(`[PayFast] Signature Mode: ${isItn ? 'ITN' : 'FORM'}`);
  console.log('[PayFast] Signature String:', finalString);
  console.log('[PayFast] Signature Hash:', crypto.createHash('md5').update(finalString).digest('hex'));

  return crypto.createHash('md5').update(finalString).digest('hex');
}

/**
 * Validates the PayFast ITN signature
 * @param params The POST body received from PayFast
 * @param passphrase The PayFast passphrase
 */
export function validatePayFastSignature(params: any, passphrase?: string): boolean {
  if (!params.signature) return false;
  // ITN signature validation MUST use Alphabetical order (isItn = true)
  const incomingSignature = params.signature;
  const calculatedSignature = generatePayFastSignature(params, passphrase, true);
  return incomingSignature === calculatedSignature;
}

/**
 * Fetches the PayFast Merchant ID and Key from environment variables
 */
export function getPayFastConfig() {
  const isSandbox = process.env.PAYFAST_IS_SANDBOX === 'true';
  const merchantId = process.env.PAYFAST_MERCHANT_ID || (isSandbox ? '10004002' : '');
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || (isSandbox ? 'q1cd2rdny4a53' : '');
  const passphrase = process.env.PAYFAST_PASSPHRASE || (isSandbox ? 'payfast' : '');
  
  if (isSandbox) {
    return {
      merchantId,
      merchantKey,
      passphrase,
      baseUrl: 'https://sandbox.payfast.co.za/eng/process',
      isSandbox: true
    };
  }

  return {
    merchantId,
    merchantKey,
    passphrase,
    baseUrl: 'https://www.payfast.co.za/eng/process',
    isSandbox: false
  };
}
