module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',
  printWidth: 120,
  jsxSingleQuote: false,
  endOfLine: 'auto',
  overrides: [
    {
      files: '*.scss',
      options: {
        singleQuote: false,
      },
    },
  ],
};
