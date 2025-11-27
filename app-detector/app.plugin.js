const { withAndroidManifest, withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAppDetector(config) {
  // Android: Add UsageStatsManager permission
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }
    
    // UsageStatsManager permission
    const hasPermission = manifest['uses-permission'].some(
      (perm) => perm.$['android:name'] === 'android.permission.PACKAGE_USAGE_STATS'
    );
    
    if (!hasPermission) {
      manifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.PACKAGE_USAGE_STATS' }
      });
    }
    
    return config;
  });
  
  // Add WorkManager dependency
  config = withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;
    
    if (!buildGradle.includes('androidx.work:work-runtime-ktx')) {
      // Add WorkManager dependency
      const dependenciesMatch = buildGradle.match(/dependencies\s*\{/);
      if (dependenciesMatch) {
        const insertIndex = buildGradle.indexOf('}', dependenciesMatch.index);
        const workManagerDep = '    implementation "androidx.work:work-runtime-ktx:2.9.0"\n';
        config.modResults.contents = 
          buildGradle.slice(0, insertIndex) + 
          workManagerDep + 
          buildGradle.slice(insertIndex);
      }
    }
    
    return config;
  });
  
  return config;
};

