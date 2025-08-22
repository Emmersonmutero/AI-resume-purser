/**
 * Utility function for conditionally joining CSS classes
 * Similar to clsx but lightweight and tailored for our needs
 */
export function cn(...inputs) {
  const classes = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (Array.isArray(input)) {
      const result = cn(...input);
      if (result) classes.push(result);
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) {
          classes.push(key);
        }
      }
    }
  }
  
  return classes.join(' ');
}

/**
 * Utility for creating conditional CSS classes with better DX
 * Usage: cva('base classes', { variants: {...}, defaultVariants: {...} })
 */
export function cva(base, config = {}) {
  return (props = {}) => {
    const { variants = {}, defaultVariants = {}, compoundVariants = [] } = config;
    const finalProps = { ...defaultVariants, ...props };
    
    let result = base || '';
    
    // Apply variant classes
    for (const [key, value] of Object.entries(finalProps)) {
      if (variants[key] && variants[key][value]) {
        result = cn(result, variants[key][value]);
      }
    }
    
    // Apply compound variants
    for (const compound of compoundVariants) {
      const { class: compoundClass, ...conditions } = compound;
      
      const matches = Object.entries(conditions).every(([key, value]) => {
        return finalProps[key] === value;
      });
      
      if (matches) {
        result = cn(result, compoundClass);
      }
    }
    
    return result;
  };
}
