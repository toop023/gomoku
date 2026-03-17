const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  config.resolver.alias = {
    ...config.resolver.alias,
    '@': './src',
  };
  
  return config;
})();
