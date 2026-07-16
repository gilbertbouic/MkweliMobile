package com.mkwelimobile

import android.app.Application
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

/**
 * Stock React Native Application entry point.
 * Kept deliberately simple — no third-party SDK init at startup —
 * so devices without Google Play Services (and low-memory phones)
 * can open the app reliably.
 */
class MainApplication : Application(), ReactApplication {

  companion object {
    private const val TAG = "MainApplication"
  }

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here.
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    try {
      loadReactNative(this)
    } catch (t: Throwable) {
      // Log and rethrow so logcat still shows a clear FATAL, but we have a marker.
      Log.e(TAG, "React Native failed to initialize", t)
      throw t
    }
  }
}
