import type { ObserverCallback } from './types';

export const $$ = <T extends Element = Element>(selector: string): NodeListOf<T> => 
    document.querySelectorAll<T>(selector);

export const $ = <T extends HTMLElement = HTMLElement>(selector: string): T | null => 
    document.querySelector<T>(selector);

export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    return (...args: Parameters<T>) => {
        if (!timeout) {
            func(...args);
            timeout = setTimeout(() => {
                timeout = null;
            }, wait);
        }
    };
};

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export const createObserver = (
    callback: ObserverCallback,
    options: IntersectionObserverInit = {}
): IntersectionObserver => {
    const defaultOptions: IntersectionObserverInit = {
        threshold: 0.1,
        rootMargin: '0px'
    };
    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

export const easing = {
    easeOutQuart: (t: number): number => 1 - Math.pow(1 - t, 4),
    easeInOutCubic: (t: number): number => 
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeOutExpo: (t: number): number => 
        t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
} as const;

export const clamp = (min: number, value: number, max: number): number => 
    Math.min(Math.max(min, value), max);

export const lerp = (start: number, end: number, amount: number): number => 
    start + (end - start) * amount;
