export const pulse = (element: HTMLElement, duration: number = 600) => {
  element.classList.add('animate-pulse');
  setTimeout(() => {
    element.classList.remove('animate-pulse');
  }, duration);
};

export const shake = (element: HTMLElement, duration: number = 600) => {
  element.style.animation = `shake ${duration}ms`;
  setTimeout(() => {
    element.style.animation = '';
  }, duration);
};

export const bounce = (element: HTMLElement, duration: number = 800) => {
  element.style.animation = `bounce ${duration}ms`;
  setTimeout(() => {
    element.style.animation = '';
  }, duration);
};

export interface AnimationConfig {
  type: 'pulse' | 'shake' | 'bounce' | 'fade-in' | 'slide-up';
  duration?: number;
  delay?: number;
  element: HTMLElement;
}

export const applyAnimation = (config: AnimationConfig) => {
  const { type, duration = 600, delay = 0, element } = config;
  
  if (!element) return;
  
  setTimeout(() => {
    switch (type) {
      case 'pulse':
        pulse(element, duration);
        break;
      case 'shake':
        shake(element, duration);
        break;
      case 'bounce':
        bounce(element, duration);
        break;
      case 'fade-in':
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms`;
        // Force a reflow
        element.getBoundingClientRect();
        element.style.opacity = '1';
        break;
      case 'slide-up':
        element.style.transform = 'translateY(20px)';
        element.style.opacity = '0';
        element.style.transition = `transform ${duration}ms, opacity ${duration}ms`;
        // Force a reflow
        element.getBoundingClientRect();
        element.style.transform = 'translateY(0)';
        element.style.opacity = '1';
        break;
    }
  }, delay);
};

export const animateValidation = (element: HTMLElement, isValid: boolean, duration: number = 600) => {
  if (!element) return;
  
  if (isValid) {
    element.style.borderColor = '#10b981'; // Green
    element.style.backgroundColor = '#ecfdf5'; // Light green
  } else {
    element.style.borderColor = '#ef4444'; // Red
    element.style.backgroundColor = '#fef2f2'; // Light red
    shake(element, duration);
  }
  
  // Reset after animation
  setTimeout(() => {
    if (isValid) {
      element.style.borderColor = '';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 1000);
    }
  }, duration);
};