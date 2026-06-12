const config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-color)",
        "primary-dark": "var(--primary-dark)",
        secondary: "var(--secondary-color)",
        "text-dark": "var(--text-dark)",
        "text-light": "var(--text-light)",
        white: "var(--white)",
      },
    },
  },
  plugins: [],
};

export default config;
