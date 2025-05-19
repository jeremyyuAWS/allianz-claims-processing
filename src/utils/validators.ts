// Form validation utility functions

/**
 * Checks if a string is a valid email address
 * @param email The email string to validate
 * @returns Boolean indicating if the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Checks if a string is a valid phone number
 * @param phone The phone string to validate
 * @returns Boolean indicating if the phone number is valid
 */
export const isValidPhone = (phone: string): boolean => {
  // Simple validation for US phone numbers - accepts various formats
  const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * Checks if a string is a valid routing number
 * @param routingNumber The routing number to validate
 * @returns Boolean indicating if the routing number is valid
 */
export const isValidRoutingNumber = (routingNumber: string): boolean => {
  // Check if it's a 9-digit number
  if (!/^\d{9}$/.test(routingNumber)) {
    return false;
  }
  
  // Implement the checksum algorithm for routing numbers
  // Each digit is multiplied by a weight (3, 7, or 1)
  // The sum should be divisible by 10
  const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(routingNumber[i]) * weights[i];
  }
  
  return sum % 10 === 0;
};

/**
 * Checks if a string is a valid account number
 * @param accountNumber The account number to validate
 * @returns Boolean indicating if the account number is valid
 */
export const isValidAccountNumber = (accountNumber: string): boolean => {
  // Simple validation - most US account numbers are 8-17 digits
  return /^\d{8,17}$/.test(accountNumber);
};

/**
 * Checks if a string is a valid policy number
 * @param policyNumber The policy number to validate
 * @returns Boolean indicating if the policy number is valid
 */
export const isValidPolicyNumber = (policyNumber: string): boolean => {
  // Simple validation for Allianz policy numbers
  return /^[A-Za-z0-9-]{5,20}$/.test(policyNumber);
};

/**
 * Formats a phone number for display
 * @param phone The phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
};

/**
 * Format a date string to a human-readable format
 * @param dateString Date string in ISO format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Validate a form field and return an error message if invalid
 * @param name Field name
 * @param value Field value
 * @param required Is the field required?
 * @returns Error message or empty string if valid
 */
export const validateField = (name: string, value: string, required: boolean = true): string => {
  // Skip validation if the field is not required and is empty
  if (!required && (!value || value.trim() === '')) {
    return '';
  }
  
  // Required field validation
  if (required && (!value || value.trim() === '')) {
    return `${name} is required`;
  }
  
  // Specific field validations
  switch (name.toLowerCase()) {
    case 'email':
      return isValidEmail(value) ? '' : 'Please enter a valid email address';
    
    case 'phone':
    case 'phone number':
      return isValidPhone(value) ? '' : 'Please enter a valid phone number';
    
    case 'routing number':
      return isValidRoutingNumber(value) ? '' : 'Please enter a valid 9-digit routing number';
    
    case 'account number':
      return isValidAccountNumber(value) ? '' : 'Please enter a valid account number (8-17 digits)';
    
    case 'policy number':
      return isValidPolicyNumber(value) ? '' : 'Please enter a valid policy number';
    
    default:
      return '';
  }
};