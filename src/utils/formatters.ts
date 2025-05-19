// Format a number as currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

// Parse a string that might contain abbreviations like "1M" or "100K"
export const parseMoneyInput = (input: string): number => {
  if (!input) return 0;
  
  // Remove any non-numeric characters except K, M, B, and decimal points
  const cleanInput = input.toString().replace(/[^0-9KMBkmb.]/g, '');
  
  // If the input is empty after cleaning, return 0
  if (!cleanInput) return 0;
  
  // Handle abbreviations
  const upperInput = cleanInput.toUpperCase();
  
  if (upperInput.includes('K')) {
    // Convert K (thousands)
    return parseFloat(upperInput.replace('K', '')) * 1000;
  } else if (upperInput.includes('M')) {
    // Convert M (millions)
    return parseFloat(upperInput.replace('M', '')) * 1000000;
  } else if (upperInput.includes('B')) {
    // Convert B (billions)
    return parseFloat(upperInput.replace('B', '')) * 1000000000;
  } else {
    // Regular number
    return parseFloat(cleanInput);
  }
};