module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  ignorePatterns: ['next-env.d.ts'],
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')]
    }
  }
};
