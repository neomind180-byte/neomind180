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
 * IMPORTANT: Field order MUST match the PayFast documentation exactly.
 * Documentation: https://developers.payfast.co.za/docs#step_2_signature
 */
export function generatePayFastSignature(data: any, passphrase?: string): string {
  // Define the strict order required by PayFast
  const orderedKeys = [
    'merchant_id',
    'merchant_key',
    'return_url',
    'cancel_url',
    'notify_url',
    'name_first',
    'name_last',
    'email_address',
    'm_payment_id',
    'amount',
    'item_name',
    'custom_str1',
    'custom_str2',
    'custom_str3',
    'subscription_type',
    'frequency',
    'cycles'
  ];

  // Build payload based on ordered keys, skipping empty/undefined values
  const payloadParts: string[] = [];
  
  for (const key of orderedKeys) {
    const rawValue = data[key];
    if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
      const value = String(rawValue).trim();
      // Percent encode and replace %20 with +
      const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
      payloadParts.push(`${key}=${encodedValue}`);
    }
  }

  let finalString = payloadParts.join('&');
  
  if (passphrase) {
    finalString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  // Debug logging
  if (process.env.NODE_ENV !== 'production' || process.env.PAYFAST_IS_SANDBOX === 'true') {
     console.log('[PayFast] Signature String:', finalString);
  }

  return crypto.createHash('md5').update(finalString).digest('hex');
}

/**
 * Validates the PayFast ITN signature
 * @param params The POST body received from PayFast
 * @param passphrase The PayFast passphrase
 * @returns boolean
 */
export function validatePayFastSignature(params: any, passphrase?: string): boolean {
  if (!params.signature) return false;

  const signature = params.signature;
  const data = { ...params };
  delete data.signature;

  // For ITN, PayFast doesn't sort. The order is exactly how it's sent.
  // Actually, documentation says it's alphabetical order for MD5.
  const checkSignature = generatePayFastSignature(data, passphrase);

  return checkSignature === signature;
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
