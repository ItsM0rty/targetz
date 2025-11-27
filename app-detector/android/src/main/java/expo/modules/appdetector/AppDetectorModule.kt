package expo.modules.appdetector

import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import androidx.work.*
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.util.concurrent.TimeUnit

class AppDetectorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AppDetector")
    
    // Request usage access permission
    Function("requestUsagePermission") {
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
      intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
      appContext.reactContext?.startActivity(intent)
    }
    
    // Check if permission is granted
    Function("hasUsagePermission") {
      val usageStatsManager = appContext.reactContext
        ?.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
      
      if (usageStatsManager == null) return@Function false
      
      val time = System.currentTimeMillis()
      val stats = usageStatsManager.queryUsageStats(
        UsageStatsManager.INTERVAL_DAILY,
        time - 10000,
        time
      )
      
      return@Function stats != null && stats.isNotEmpty()
    }
    
    // Get current foreground app
    Function("getCurrentApp") {
      val usageStatsManager = appContext.reactContext
        ?.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
      
      if (usageStatsManager == null) return@Function ""
      
      val time = System.currentTimeMillis()
      val stats = usageStatsManager.queryUsageStats(
        UsageStatsManager.INTERVAL_DAILY,
        time - 5000,
        time
      )
      
      return@Function stats?.maxByOrNull { it.lastTimeUsed }?.packageName ?: ""
    }
    
    // Start monitoring apps with WorkManager
    Function("startMonitoring") { monitoredApps: List<String>, promise: Promise ->
      try {
        val context = appContext.reactContext ?: return@Function
        
        // Create input data with monitored apps
        val inputData = Data.Builder()
          .putStringArray("monitoredApps", monitoredApps.toTypedArray())
          .build()
        
        // Create constraints (battery not low, device not idle)
        val constraints = Constraints.Builder()
          .setRequiresBatteryNotLow(true)
          .setRequiresDeviceIdle(false)
          .build()
        
        // Schedule periodic work (minimum 15 minutes for WorkManager, but we'll use 3 seconds for testing)
        // Note: For production, consider using OneTimeWorkRequest with chaining for more frequent checks
        val workRequest = PeriodicWorkRequestBuilder<AppDetectorWorker>(
          15, TimeUnit.MINUTES // WorkManager minimum
        )
          .setConstraints(constraints)
          .setInputData(inputData)
          .addTag("app-detector")
          .build()
        
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
          "app-detector-work",
          ExistingPeriodicWorkPolicy.REPLACE,
          workRequest
        )
        
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("MONITORING_ERROR", e.message, e)
      }
    }
    
    // Stop monitoring
    Function("stopMonitoring") {
      val context = appContext.reactContext
      if (context != null) {
        WorkManager.getInstance(context).cancelUniqueWork("app-detector-work")
      }
    }
  }
}

