// Build-time helpers for GitHub Pages deployment

export const isBuildingForGitHubPages = () => {
  // During build, process.env is available
  if (typeof process !== 'undefined' && process.env) {
    return process.env.GITHUB_PAGES === 'true' || process.env.VITE_DEMO_MODE === 'true';
  }
  
  // During runtime, use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.GITHUB_PAGES === 'true' || import.meta.env.VITE_DEMO_MODE === 'true';
  }
  
  // Fallback: check if we're on github.io domain
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname.includes('github.io');
  }
  
  return false;
};

export const getDemoModeForBuild = () => {
  // Force demo mode for GitHub Pages builds
  if (isBuildingForGitHubPages()) {
    return true;
  }
  
  // Otherwise check environment variable
  return import.meta.env?.VITE_DEMO_MODE === 'true';
};