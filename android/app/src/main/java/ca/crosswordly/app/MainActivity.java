package ca.crosswordly.app;

import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    // Android's own tablet threshold: below it the device is treated as a phone
    private static final int TABLET_MIN_WIDTH_DP = 600;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyOrientationPolicy(getResources().getConfiguration());
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        // Unfolding a foldable or moving to an external display changes the screen size in place
        applyOrientationPolicy(newConfig);
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
}
