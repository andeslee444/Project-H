// GitHub Pages specific configuration
export const isGitHubPagesBuild = () => {
  // Check multiple conditions to ensure we catch GitHub Pages build
  return (
    import.meta.env.GITHUB_PAGES === 'true' ||
    import.meta.env.VITE_DEMO_MODE === 'true' ||
    (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
  );
};

export const getGitHubPagesConfig = () => {
  return {
    useDemo: true,
    basePath: '/Project-H/',
    supabaseEnabled: false,
    authMode: 'demo' as const
  };
};