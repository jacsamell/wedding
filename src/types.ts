export interface AnimationOptions {
    threshold?: number;
    rootMargin?: string;
    delay?: number;
}



export interface TimeValues {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export type EasingFunction = (t: number) => number;

export interface ObserverCallback {
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void;
}
