package ca.crosswordly.app;

import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    // Android's own tablet threshold: below it the device is treated as a phone
    private static final int TABLET_MIN_WIDTH_DP = 600;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyOrientationPolicy(getResources().getConfiguration());
        // Capacitor's SystemBars plugin queues a "show every bar" as it loads in super.onCreate();
        // queueing the hide after it keeps the status bar off the first frame
        new Handler(Looper.getMainLooper()).post(this::hideStatusBar);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        // Unfolding a foldable or moving to an external display changes the screen size in place
        applyOrientationPolicy(newConfig);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // Older Android versions bring the status bar back after the share sheet or another app
        if (hasFocus) {
            hideStatusBar();
        }
    }

    /**
     * Phones stay portrait, like the iPhone app. Tablets and unfolded foldables rotate freely, like
     * the iPad app; Android 16 ignores orientation locks on large screens anyway.
     */
    private void applyOrientationPolicy(Configuration config) {
        boolean isPhone = config.smallestScreenWidthDp < TABLET_MIN_WIDTH_DP;
        int orientation = isPhone ? ActivityInfo.SCREEN_ORIENTATION_PORTRAIT : ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED;
        if (getRequestedOrientation() != orientation) {
            setRequestedOrientation(orientation);
        }
    }

    /**
     * Hides the status bar, like the iOS app (`UIStatusBarHidden`). A swipe down from the top shows
     * it over the game for a moment. The navigation bar stays, so Back is always one tap away.
     */
    private void hideStatusBar() {
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controller.hide(WindowInsetsCompat.Type.statusBars());
    }
}
