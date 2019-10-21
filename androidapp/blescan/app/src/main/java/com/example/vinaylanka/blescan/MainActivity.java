package com.example.vinaylanka.blescan;

import android.Manifest;
import android.app.AlertDialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.AsyncTask;
import android.speech.RecognizerIntent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.SparseArray;
import android.util.Xml;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.w3c.dom.Text;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class MainActivity extends AppCompatActivity implements SensorEventListener {
    private final static int REQUEST_ENABLE_BT = 1;
    private static final int PERMISSION_REQUEST_COARSE_LOCATION = 1;
    private static final int REQ_CODE_SPEECH_INPUT = 100;
    private float currentDegree = 0f;
    private SensorManager mSensorManager;
    private BluetoothAdapter bluetoothAdapter;
    BluetoothLeScanner btScanner;
    Button startScanningButton;
    Button stopScanningButton;
    Button VoiceButton;
    TextView TextView2;
    TextView TextView3;
    TextView TextView4;
    TextView TextView5;
    TextView textView2;
    TextView textView3;
    String finalData;
    float finaldegree;
    private RequestQueue mRequestQueue;
    //    private Map<String, String> mParams = new HashMap<>();
    String URL = "http://192.168.43.75:8000/api/update-variables";
    Integer rssi1 = 0, rssi2 = 0, rssi3 = 0, rssi4 = 0;
    String wrt1 = "", wrt2 = "", wrt3 = "", wrt4 = "";
    String sentence = "No sentence yet";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        RequestQueue queue = Volley.newRequestQueue(this);
        mSensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        TextView2 = (TextView) findViewById(R.id.TextView2);
        TextView3 = (TextView) findViewById(R.id.TextView3);
        TextView4 = (TextView) findViewById(R.id.TextView4);
        TextView5 = (TextView) findViewById(R.id.TextView5);
        textView2 = (TextView) findViewById(R.id.textView2);
        textView3 = (TextView) findViewById(R.id.textView3);
        VoiceButton = (Button) findViewById(R.id.voiceButton);
        startScanningButton = (Button) findViewById(R.id.StartScanButton);
        startScanningButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                startScanning();
            }
        });

        VoiceButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                startVoiceInput();
            }
        });

        stopScanningButton = (Button) findViewById(R.id.StopScanButton);
        stopScanningButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                stopScanning();
            }
        });
        stopScanningButton.setVisibility(View.INVISIBLE);
        final BluetoothManager bluetoothManager =
                (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        bluetoothAdapter = bluetoothManager.getAdapter();
        btScanner = bluetoothAdapter.getBluetoothLeScanner();

        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
        }
        if (this.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            final AlertDialog.Builder builder = new AlertDialog.Builder(this);
            builder.setTitle("This app needs location access");
            builder.setMessage("Please grant location access so this app can detect peripherals.");
            builder.setPositiveButton(android.R.string.ok, null);
            builder.setOnDismissListener(new DialogInterface.OnDismissListener() {
                @Override
                public void onDismiss(DialogInterface dialog) {
                    requestPermissions(new String[]{Manifest.permission.ACCESS_COARSE_LOCATION}, PERMISSION_REQUEST_COARSE_LOCATION);
                }
            });
            builder.show();
        }
    }

    public ScanCallback leScanCallback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            if (result.getDevice().getAddress().equals("3C:71:BF:6A:48:6E")) {
                rssi1 = result.getRssi();
                byte[] bytes = result.getScanRecord().getBytes();
                String msg = new String(bytes, StandardCharsets.UTF_8);
                wrt1 = msg;
                TextView2.setText("Device Name: " + result.getDevice().getName() + rssi1 + msg + "\n");
                RequestQueue queue = Volley.newRequestQueue(MainActivity.this);
                StringRequest stringRequest = new StringRequest(Request.Method.POST, URL,
                        new Response.Listener<String>() {
                            @Override
                            public void onResponse(String response) {
                                System.out.println(response);
                            }
                        }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        System.out.println(error);
                    }
                }) {
                    @Override
                    protected Map<String, String> getParams() throws AuthFailureError {
                        Map<String, String> params = new HashMap<>();
                        params.put("rssi1", Integer.toString(rssi1));
                        params.put("rssi2", Integer.toString(rssi2));
                        params.put("rssi3", Integer.toString(rssi3));
                        params.put("rssi4", Integer.toString(rssi4));
                        params.put("wrt1", wrt1);
                        params.put("wrt2", wrt2);
                        params.put("wrt3", wrt3);
                        params.put("wrt4", wrt4);
                        params.put("compass",Float.toString(finaldegree));
                        params.put("sentence",sentence);
                        return params;
                    }
                };
                stringRequest.setShouldCache(false);// no caching url...
                stringRequest.setRetryPolicy(
                        new DefaultRetryPolicy(
                                20000,//time to wait for it in this case 20s
                                20,//tryies in case of error
                                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT
                        )
                );
                queue.add(stringRequest);
            } else if (result.getDevice().getAddress().equals("A4:CF:12:74:F9:C2")) {
                rssi2 = result.getRssi();
                byte[] bytes = result.getScanRecord().getBytes();
                String msg = new String(bytes, StandardCharsets.UTF_8);
                wrt2 = msg;
//                System.out.println(wrt2);
                TextView3.setText("Device Name: " + result.getDevice().getName() + rssi2 + msg + "\n");
            } else if (result.getDevice().getAddress().equals("3C:71:BF:6B:E7:EA")) {
                rssi3 = result.getRssi();
                byte[] bytes = result.getScanRecord().getBytes();
                String msg = new String(bytes, StandardCharsets.UTF_8);
                wrt3 = msg;
                TextView4.setText("Device Name: " + result.getDevice().getName() + rssi3 + msg + "\n");
            } else if (result.getDevice().getAddress().equals("24:62:AB:B0:60:0A")) {
                rssi4 = result.getRssi();
                byte[] bytes = result.getScanRecord().getBytes();
                String msg = new String(bytes, StandardCharsets.UTF_8);
                wrt4 = msg;
                TextView5.setText("Device Name: " + result.getDevice().getName() + rssi4 + " Address: " + msg + "\n");
            }
        }

    };

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           String permissions[], int[] grantResults) {
        switch (requestCode) {
            case PERMISSION_REQUEST_COARSE_LOCATION: {
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    System.out.println("coarse location permission granted");
                } else {
                    final AlertDialog.Builder builder = new AlertDialog.Builder(this);
                    builder.setTitle("Functionality limited");
                    builder.setMessage("Since location access has not been granted, this app will not be able to discover beacons when in the background.");
                    builder.setPositiveButton(android.R.string.ok, null);
                    builder.setOnDismissListener(new DialogInterface.OnDismissListener() {

                        @Override
                        public void onDismiss(DialogInterface dialog) {
                        }

                    });
                    builder.show();
                }
                return;
            }
        }

    }

    public void startScanning() {

        System.out.println("start scanning");
        TextView2.setText("");
        startScanningButton.setVisibility(View.INVISIBLE);
        stopScanningButton.setVisibility(View.VISIBLE);
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                ScanSettings scanSettings = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build();
                ScanFilter scanFilter = new ScanFilter.Builder().setDeviceAddress("3C:71:BF:6A:48:6E").build();
                ScanFilter scanFilter1 = new ScanFilter.Builder().setDeviceAddress("A4:CF:12:74:F9:C2").build();
                ScanFilter scanFilter2 = new ScanFilter.Builder().setDeviceAddress("3C:71:BF:6B:E7:EA").build();
                ScanFilter scanFilter3 = new ScanFilter.Builder().setDeviceAddress("24:62:AB:B0:60:0A").build();
                List<ScanFilter> scanFilters = new ArrayList<>();
                scanFilters.add(scanFilter);
                scanFilters.add(scanFilter1);
                scanFilters.add(scanFilter2);
                scanFilters.add(scanFilter3);
                btScanner.startScan(scanFilters, scanSettings, leScanCallback);
            }
        });
    }

    public void stopScanning() {
        System.out.println("stopping scanning");
        TextView2.append("Stopped Scanning");
        startScanningButton.setVisibility(View.VISIBLE);
        stopScanningButton.setVisibility(View.INVISIBLE);
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                btScanner.stopScan(leScanCallback);
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        mSensorManager.registerListener(this, mSensorManager.getDefaultSensor(Sensor.TYPE_ORIENTATION), SensorManager.SENSOR_DELAY_GAME);
    }

    @Override
    protected void onPause() {
        super.onPause();

        // to stop the listener and save battery
        mSensorManager.unregisterListener(this);
    }

    @Override
    public void onSensorChanged(SensorEvent event) {

        // get the angle around the z-axis rotated
        float degree = Math.round(event.values[0]);
        finaldegree = degree;
        textView2.setText(String.valueOf(degree));
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // not in use
    }
    private void startVoiceInput() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Hello, How can I help you?");
        try {
            startActivityForResult(intent, REQ_CODE_SPEECH_INPUT);
        } catch (ActivityNotFoundException a) {

        }
    }
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        switch (requestCode) {
            case REQ_CODE_SPEECH_INPUT: {
                if (resultCode == RESULT_OK && null != data) {
                    ArrayList<String> result = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                    sentence = result.get(0);
                    textView3.setText(sentence);
                }
                break;
            }

        }
    }
}


