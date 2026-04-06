const eslintConfig = [
  {
    ignores: [".next/**", "dist/**", "node_modules/**"],
  },
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];

export default eslintConfig;
