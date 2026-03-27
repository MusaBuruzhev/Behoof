const STORAGE_KEY = 'behoof_comparison';

const comparisonAPI = {
  getComparison: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  addToComparison: (productId) => {
    const comparison = comparisonAPI.getComparison();
    if (!comparison.includes(productId)) {
      comparison.push(productId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparison));
    }
    return comparison;
  },

  removeFromComparison: (productId) => {
    let comparison = comparisonAPI.getComparison();
    comparison = comparison.filter(id => id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comparison));
    return comparison;
  },

  clearComparison: () => {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  },

  isInComparison: (productId) => {
    return comparisonAPI.getComparison().includes(productId);
  },
};

export default comparisonAPI;
