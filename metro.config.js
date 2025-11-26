
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Store the original resolver
const defaultResolver = config.resolver.resolveRequest;

// Configure resolver for platform-specific files
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts || [])],
  platforms: ['ios', 'android', 'web', 'native'],
  resolveRequest: (context, moduleName, platform) => {
    // Block Stripe imports on web by returning a mock module
    if (platform === 'web' && moduleName.includes('@stripe/stripe-react-native')) {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'app/mocks/stripe-mock.js'),
      };
    }
    
    // Use the default resolver for everything else
    if (defaultResolver) {
      return defaultResolver(context, moduleName, platform);
    }
    
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
