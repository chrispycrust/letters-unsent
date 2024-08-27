/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding", // can get rid of this after install 
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    // themes for dark mode support 
    // a11ygit 
  ],
  framework: {
    name: "@storybook/react-vite", // should i use webpack or ember etc
    options: {},
  },

  // telemetry?
};
export default config;
