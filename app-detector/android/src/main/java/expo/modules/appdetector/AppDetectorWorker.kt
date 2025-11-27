package expo.modules.appdetector

import android.app.usage.UsageStatsManager
import android.content.Context
import android.util.Log
import androidx.work.Worker
import androidx.work.WorkerParameters

class AppDetectorWorker(
  context: Context,
  params: WorkerParameters
) : Worker(context, params) {
  
  override fun doWork(): Result {
    try {
      val monitoredApps = inputData.getStringArray("monitoredApps")?.toList() ?: return Result.success()
      
      if (monitoredApps.isEmpty()) {
        return Result.success()
      }
      
      // Get current foreground app
      val usageStatsManager = applicationContext
        .getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
        ?: return Result.success()
      
      val time = System.currentTimeMillis()
      val stats = usageStatsManager.queryUsageStats(
        UsageStatsManager.INTERVAL_DAILY,
        time - 5000,
        time
      )
      
      val currentApp = stats?.maxByOrNull { it.lastTimeUsed }?.packageName ?: ""
      
      if (currentApp in monitoredApps) {
        // Trigger notification via EventEmitter
        // Note: This is a simplified version. In production, you'd use
        // expo-notifications module or send an event to React Native
        Log.d("AppDetector", "Detected monitored app: $currentApp")
        
        // For now, we'll trigger via a broadcast or event
        // The React Native side will handle the actual notification
        triggerNotificationEvent(currentApp)
      }
      
      return Result.success()
    } catch (e: Exception) {
      Log.e("AppDetector", "Error in worker", e)
      return Result.retry()
    }
  }
  
  private fun triggerNotificationEvent(packageName: String) {
    // Send broadcast that React Native can listen to
    val intent = android.content.Intent("com.targetz.app.APP_DETECTED")
    intent.putExtra("packageName", packageName)
    applicationContext.sendBroadcast(intent)
  }
}

