import "../src/index.css";
import "../src/App.css";
import "../src/styles/premium-dealership.css";
import "../src/styles/showroom.css";

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    layout: "centered",
    actions: { argTypesRegex: "^on[A-Z].*" },
  },
};

export default preview;
