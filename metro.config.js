// Learn more https://docs.expo.dev/guides/monorepos/#metro-configuration
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web build loads a .wasm binary for its worker — Metro doesn't
// treat .wasm as an asset by default, which fails the web bundle.
config.resolver.assetExts.push('wasm');

module.exports = config;
