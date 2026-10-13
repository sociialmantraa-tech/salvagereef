/**
 * SalvageReef User-Friendly Error Formatter
 * Translates low-level network errors, timeouts, and API codes into beautiful, crystal-clear user messages.
 */

export interface FormattedError {
  type: 'timeout' | 'network' | 'duplicate_email' | 'duplicate_gst' | 'rate_limit' | 'validation' | 'server' | 'general';
  title: string;
  description: string;
  actionType?: 'login' | 'retry' | 'review_step1' | 'contact';
  actionLabel?: string;
  actionUrl?: string;
}

export function formatApiError(err: any): FormattedError {
  if (!err) {
    return {
      type: 'general',
      title: 'Action Notice',
      description: 'An unexpected issue occurred. Please check your information and try again.',
      actionType: 'retry',
      actionLabel: 'Try Again',
    };
  }

  const status = err.response?.status;
  const rawMsg = String(
    err.response?.data?.message ||
    err.response?.data?.errors?.email?.[0] ||
    err.response?.data?.errors?.gst_number?.[0] ||
    err.message ||
    ''
  ).trim();
  const lowerMsg = rawMsg.toLowerCase();
  const errCode = String(err.code || '').toUpperCase();

  // 1. Timeout (ECONNABORTED or message contains timeout / exceeded)
  if (errCode === 'ECONNABORTED' || lowerMsg.includes('timeout') || lowerMsg.includes('exceeded')) {
    return {
      type: 'timeout',
      title: 'Upload Timed Out',
      description: 'The server took longer than expected to receive or process your uploaded documents. Your form details are safely preserved — please check your internet connection and try submitting again.',
      actionType: 'retry',
      actionLabel: 'Retry Submission',
    };
  }

  // 2. Network Offline or Connection Interrupted
  if (
    lowerMsg.includes('network error') ||
    errCode === 'ERR_NETWORK' ||
    (!err.response && !status && (lowerMsg.includes('failed to fetch') || lowerMsg.includes('load failed')))
  ) {
    return {
      type: 'network',
      title: 'Network Connection Interrupted',
      description: 'Unable to connect to the SalvageReef secure server. Please verify your internet connection and try again.',
      actionType: 'retry',
      actionLabel: 'Retry Connection',
    };
  }

  // 3. Email Already Registered
  if (
    lowerMsg.includes('email') &&
    (lowerMsg.includes('already') || lowerMsg.includes('registered') || lowerMsg.includes('exists') || lowerMsg.includes('taken'))
  ) {
    return {
      type: 'duplicate_email',
      title: 'Email Address Already Registered',
      description: 'An account is already linked with this email address. Please sign in to your existing account or use a different email address.',
      actionType: 'login',
      actionLabel: 'Sign In to Account →',
      actionUrl: '/login',
    };
  }

  // 4. GST Number Already Registered
  if (
    lowerMsg.includes('gst') &&
    (lowerMsg.includes('already') || lowerMsg.includes('registered') || lowerMsg.includes('exists') || lowerMsg.includes('taken'))
  ) {
    return {
      type: 'duplicate_gst',
      title: 'GST Number Already Registered',
      description: rawMsg || 'An account with this GST Number is already registered on SalvageReef. If this is your company, please sign in or contact SalvageReef Support.',
      actionType: 'login',
      actionLabel: 'Sign In to Account →',
      actionUrl: '/login',
    };
  }

  // 5. Rate Limit (429)
  if (status === 429 || lowerMsg.includes('rate limit') || lowerMsg.includes('too many')) {
    return {
      type: 'rate_limit',
      title: 'Too Many Requests',
      description: 'Too many requests were received from your connection in a short window. Please wait a few minutes before trying again.',
      actionType: 'retry',
      actionLabel: 'Wait & Retry',
    };
  }

  // 6. Validation (422)
  if (status === 422) {
    return {
      type: 'validation',
      title: 'Please Verify Details',
      description: rawMsg || 'Some required information is missing or invalid. Please review the highlighted fields in the form.',
      actionType: 'review_step1',
      actionLabel: 'Review Details',
    };
  }

  // 7. Server Error (500, 502, 503, 504)
  if (status && status >= 500) {
    return {
      type: 'server',
      title: 'Temporary Server Notice',
      description: 'Our server encountered a temporary delay while saving your registration. Your entered information is preserved. Please click retry below.',
      actionType: 'retry',
      actionLabel: 'Retry Submission',
    };
  }

  // 8. General fallback
  return {
    type: 'general',
    title: 'Submission Notice',
    description: rawMsg || 'Registration could not be completed. Please check your information and try again.',
    actionType: 'retry',
    actionLabel: 'Try Again',
  };
}
