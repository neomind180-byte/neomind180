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
 * Generates an MD5 signature for PayFast
 */
export function generatePayFastSignature(data: PayFastData, passphrase?: string): string {
  const keys = Object.keys(data)
    .filter(k => k !== 'signature' && data[k] !== undefined && data[k] !== '')
    .sort();

  const payload = keys
    .map(key => `${key}=${encodeURIComponent(data[key]!).replace(/%20/g, '+')}`)
    .join('&');

  const signatureString = passphrase 
    ? `${payload}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
    : payload;

  // Log payload in sandbox/dev to debug signature mismatches
  if (process.env.NODE_ENV !== 'production' || process.env.PAYFAST_IS_SANDBOX === 'true') {
    console.log('[PayFast] Signature Payload:', signatureString);
  }

  return crypto.createHash('md5').update(signatureString).digest('hex');
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
