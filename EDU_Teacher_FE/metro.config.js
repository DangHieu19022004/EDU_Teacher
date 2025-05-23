// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Expo Router yêu cầu bật tính năng này
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
