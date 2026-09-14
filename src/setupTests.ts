// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom does not implement the IntersectionObserver API, which framer-motion's
// useInView() depends on. Provide a lightweight stub so components using it
// don't crash when tests render them.
class IntersectionObserverMock {
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

(global as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
  IntersectionObserverMock as unknown as typeof IntersectionObserver;