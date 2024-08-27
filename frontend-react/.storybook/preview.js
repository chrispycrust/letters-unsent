/** @type { import('@storybook/react').Preview } */

// what you want to pass to every single story, global dependency injection

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
