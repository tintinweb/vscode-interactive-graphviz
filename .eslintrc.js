module.exports = {
  ignorePatterns: ["content/", "node_modules/", "dist/", "content/graphvizSvg/"],
  env: {
    browser: true,
    es2021: true,
  },
  globals: {
    React: true,
    JSX: true,
  },
  extends: [
    "airbnb-base",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
  ],
  rules: {
    indent: ["error", 2],
    quotes: ["error", "double"],
    "import/no-import-module-exports": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
    "import/no-unresolved": [
      "error",
      {
        ignore: [
          "vscode",
        ],
      },
    ],
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },
};
