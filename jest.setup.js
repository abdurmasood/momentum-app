import '@testing-library/jest-dom'

// Mock getComputedStyle for tests
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop) => {
      // Mock CSS variable values for testing
      const mockValues = {
        // Add mock values here if needed for testing
      }
      return mockValues[prop] || ''
    },
  }),
})