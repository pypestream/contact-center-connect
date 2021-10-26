// eslint-disable-next-line no-undef
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  ignorePatterns: ["**/dist/*"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "eslint:recommended",
    "prettier",
  ],
  rules: {
    "no-console": "error",
  },
};
