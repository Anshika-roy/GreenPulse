# 📊 GreenPulse Cybersecurity Dataset Feature Separability Report

## 1. Executive Summary & Diagnostic Findings

* **Dataset Size**: 10,000 Total Telemetry Samples
* **Classes Audited**: `normal`, `brute_force`, `malware`, `data_exfiltration`, `anomalous_network_activity`
* **Feature Count**: 23 Numeric & Binary Features

---

## 2. Class-Wise Feature Statistics (Mean, Median, Min, Max, Std)

### Feature: `login_attempts`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 6.32 | 6.00 | 1.00 | 12.00 | 3.33 |
| **`brute_force`** | 48.73 | 49.00 | 8.00 | 90.00 | 24.08 |
| **`malware`** | 6.36 | 6.00 | 1.00 | 12.00 | 3.43 |
| **`data_exfiltration`** | 6.59 | 7.00 | 1.00 | 12.00 | 3.49 |
| **`anomalous_network_activity`** | 6.54 | 6.00 | 1.00 | 12.00 | 3.48 |

### Feature: `failed_logins`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 1.73 | 2.00 | 0.00 | 6.00 | 1.48 |
| **`brute_force`** | 34.64 | 33.00 | 3.00 | 89.00 | 19.54 |
| **`malware`** | 1.40 | 1.00 | 0.00 | 3.00 | 1.10 |
| **`data_exfiltration`** | 1.39 | 1.00 | 0.00 | 3.00 | 1.09 |
| **`anomalous_network_activity`** | 1.39 | 1.00 | 0.00 | 3.00 | 1.10 |

### Feature: `login_failure_rate`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 0.35 | 0.25 | 0.00 | 1.00 | 0.33 |
| **`brute_force`** | 0.70 | 0.70 | 0.36 | 0.99 | 0.16 |
| **`malware`** | 0.29 | 0.20 | 0.00 | 1.00 | 0.29 |
| **`data_exfiltration`** | 0.28 | 0.20 | 0.00 | 1.00 | 0.30 |
| **`anomalous_network_activity`** | 0.28 | 0.20 | 0.00 | 1.00 | 0.29 |

### Feature: `login_velocity`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 1.57 | 1.51 | 0.10 | 5.51 | 1.08 |
| **`brute_force`** | 24.59 | 25.18 | 3.51 | 44.96 | 11.87 |
| **`malware`** | 1.56 | 1.51 | 0.10 | 5.65 | 1.09 |
| **`data_exfiltration`** | 1.54 | 1.49 | 0.10 | 5.11 | 1.08 |
| **`anomalous_network_activity`** | 1.60 | 1.52 | 0.10 | 6.24 | 1.06 |

### Feature: `new_user_login`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 0.12 | 0.00 | 0.00 | 1.00 | 0.32 |
| **`brute_force`** | 0.50 | 0.00 | 0.00 | 1.00 | 0.50 |
| **`malware`** | 0.12 | 0.00 | 0.00 | 1.00 | 0.33 |
| **`data_exfiltration`** | 0.12 | 0.00 | 0.00 | 1.00 | 0.32 |
| **`anomalous_network_activity`** | 0.12 | 0.00 | 0.00 | 1.00 | 0.32 |

### Feature: `new_country`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 0.05 | 0.00 | 0.00 | 1.00 | 0.22 |
| **`brute_force`** | 0.34 | 0.00 | 0.00 | 1.00 | 0.47 |
| **`malware`** | 0.05 | 0.00 | 0.00 | 1.00 | 0.22 |
| **`data_exfiltration`** | 0.04 | 0.00 | 0.00 | 1.00 | 0.20 |
| **`anomalous_network_activity`** | 0.05 | 0.00 | 0.00 | 1.00 | 0.21 |

### Feature: `new_ip`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 0.20 | 0.00 | 0.00 | 1.00 | 0.40 |
| **`brute_force`** | 0.65 | 1.00 | 0.00 | 1.00 | 0.48 |
| **`malware`** | 0.21 | 0.00 | 0.00 | 1.00 | 0.41 |
| **`data_exfiltration`** | 0.20 | 0.00 | 0.00 | 1.00 | 0.40 |
| **`anomalous_network_activity`** | 0.20 | 0.00 | 0.00 | 1.00 | 0.40 |

### Feature: `requests_per_min`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 36.56 | 35.53 | 5.00 | 114.85 | 21.91 |
| **`brute_force`** | 35.65 | 33.27 | 5.00 | 113.42 | 22.41 |
| **`malware`** | 36.67 | 35.31 | 5.00 | 121.49 | 22.32 |
| **`data_exfiltration`** | 37.03 | 35.70 | 5.00 | 118.65 | 22.33 |
| **`anomalous_network_activity`** | 270.40 | 269.41 | 65.35 | 479.65 | 120.20 |

### Feature: `bytes_sent_mb`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 35.19 | 13.87 | 0.20 | 349.64 | 68.26 |
| **`brute_force`** | 15.31 | 12.93 | 0.20 | 71.72 | 14.39 |
| **`malware`** | 15.00 | 12.47 | 0.20 | 79.71 | 14.23 |
| **`data_exfiltration`** | 626.26 | 636.75 | 35.68 | 1199.15 | 340.53 |
| **`anomalous_network_activity`** | 15.21 | 12.53 | 0.20 | 69.47 | 14.14 |

### Feature: `bytes_received_mb`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 46.76 | 45.02 | 1.00 | 182.18 | 31.69 |
| **`brute_force`** | 45.93 | 43.95 | 1.00 | 177.74 | 31.44 |
| **`malware`** | 47.28 | 45.50 | 1.00 | 153.53 | 32.56 |
| **`data_exfiltration`** | 32.33 | 32.13 | 5.04 | 59.99 | 15.46 |
| **`anomalous_network_activity`** | 47.10 | 45.13 | 1.00 | 151.63 | 32.56 |

### Feature: `bytes_ratio`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 4.50 | 0.33 | 0.00 | 314.45 | 21.72 |
| **`brute_force`** | 1.95 | 0.30 | 0.00 | 55.82 | 6.04 |
| **`malware`** | 2.01 | 0.28 | 0.00 | 55.12 | 6.17 |
| **`data_exfiltration`** | 27.82 | 19.51 | 0.70 | 219.37 | 29.16 |
| **`anomalous_network_activity`** | 2.19 | 0.27 | 0.00 | 68.78 | 6.82 |

### Feature: `external_connection_count`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 8.34 | 8.00 | 1.00 | 29.00 | 5.39 |
| **`brute_force`** | 8.37 | 8.00 | 1.00 | 27.00 | 5.39 |
| **`malware`** | 8.47 | 8.00 | 1.00 | 28.00 | 5.45 |
| **`data_exfiltration`** | 26.08 | 26.00 | 8.00 | 45.00 | 10.89 |
| **`anomalous_network_activity`** | 64.44 | 64.00 | 20.00 | 110.00 | 26.00 |

### Feature: `unusual_port_activity`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 0.14 | 0.00 | 0.00 | 1.00 | 0.35 |
| **`brute_force`** | 0.16 | 0.00 | 0.00 | 1.00 | 0.37 |
| **`malware`** | 0.14 | 0.00 | 0.00 | 1.00 | 0.35 |
| **`data_exfiltration`** | 0.55 | 1.00 | 0.00 | 1.00 | 0.50 |
| **`anomalous_network_activity`** | 0.59 | 1.00 | 0.00 | 1.00 | 0.49 |

### Feature: `dns_query_count`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 84.46 | 81.00 | 10.00 | 302.00 | 53.24 |
| **`brute_force`** | 81.77 | 76.00 | 10.00 | 265.00 | 53.38 |
| **`malware`** | 84.59 | 80.00 | 10.00 | 272.00 | 53.50 |
| **`data_exfiltration`** | 782.13 | 782.00 | 150.00 | 1400.00 | 356.50 |
| **`anomalous_network_activity`** | 661.33 | 666.00 | 220.00 | 1100.00 | 254.96 |

### Feature: `domain_reputation_score`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 8.12 | 8.20 | 3.10 | 10.00 | 1.33 |
| **`brute_force`** | 8.06 | 8.14 | 2.58 | 10.00 | 1.35 |
| **`malware`** | 8.09 | 8.21 | 1.37 | 10.00 | 1.38 |
| **`data_exfiltration`** | 4.53 | 4.56 | 2.50 | 6.50 | 1.14 |
| **`anomalous_network_activity`** | 5.59 | 5.55 | 4.00 | 7.20 | 0.91 |

### Feature: `cpu_usage_percent`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 44.85 | 41.75 | 5.00 | 100.00 | 25.46 |
| **`brute_force`** | 38.51 | 37.74 | 5.00 | 100.00 | 20.97 |
| **`malware`** | 70.79 | 70.77 | 45.05 | 95.97 | 14.69 |
| **`data_exfiltration`** | 38.48 | 37.48 | 5.00 | 100.00 | 21.23 |
| **`anomalous_network_activity`** | 38.19 | 36.88 | 5.00 | 100.00 | 20.62 |

### Feature: `ram_usage_percent`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 56.16 | 55.55 | 15.00 | 100.00 | 21.43 |
| **`brute_force`** | 52.82 | 52.77 | 15.00 | 100.00 | 19.31 |
| **`malware`** | 74.58 | 74.39 | 55.00 | 93.98 | 11.16 |
| **`data_exfiltration`** | 53.11 | 52.98 | 15.00 | 100.00 | 19.34 |
| **`anomalous_network_activity`** | 52.19 | 51.91 | 15.00 | 100.00 | 19.44 |

### Feature: `process_count`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 110.01 | 109.00 | 30.00 | 264.00 | 43.91 |
| **`brute_force`** | 109.51 | 110.00 | 30.00 | 267.00 | 44.33 |
| **`malware`** | 248.84 | 246.00 | 120.00 | 380.00 | 75.49 |
| **`data_exfiltration`** | 109.81 | 109.00 | 30.00 | 261.00 | 43.45 |
| **`anomalous_network_activity`** | 109.17 | 108.50 | 30.00 | 259.00 | 43.72 |

### Feature: `unsigned_process_count`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 0.38 | 0.00 | 0.00 | 3.00 | 0.86 |
| **`brute_force`** | 0.43 | 0.00 | 0.00 | 3.00 | 0.91 |
| **`malware`** | 2.27 | 2.00 | 0.00 | 6.00 | 2.18 |
| **`data_exfiltration`** | 0.40 | 0.00 | 0.00 | 3.00 | 0.89 |
| **`anomalous_network_activity`** | 0.36 | 0.00 | 0.00 | 3.00 | 0.84 |

### Feature: `hidden_process_count`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 0.08 | 0.00 | 0.00 | 1.00 | 0.27 |
| **`brute_force`** | 0.08 | 0.00 | 0.00 | 1.00 | 0.27 |
| **`malware`** | 1.13 | 0.00 | 0.00 | 4.00 | 1.45 |
| **`data_exfiltration`** | 0.09 | 0.00 | 0.00 | 1.00 | 0.28 |
| **`anomalous_network_activity`** | 0.08 | 0.00 | 0.00 | 1.00 | 0.27 |

### Feature: `privilege_escalation_attempt`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 0.05 | 0.00 | 0.00 | 1.00 | 0.22 |
| **`brute_force`** | 0.05 | 0.00 | 0.00 | 1.00 | 0.23 |
| **`malware`** | 0.40 | 0.00 | 0.00 | 1.00 | 0.49 |
| **`data_exfiltration`** | 0.05 | 0.00 | 0.00 | 1.00 | 0.22 |
| **`anomalous_network_activity`** | 0.06 | 0.00 | 0.00 | 1.00 | 0.23 |

### Feature: `cmd_powershell_execution`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 0.31 | 0.00 | 0.00 | 1.00 | 0.46 |
| **`brute_force`** | 0.30 | 0.00 | 0.00 | 1.00 | 0.46 |
| **`malware`** | 0.71 | 1.00 | 0.00 | 1.00 | 0.45 |
| **`data_exfiltration`** | 0.29 | 0.00 | 0.00 | 1.00 | 0.46 |
| **`anomalous_network_activity`** | 0.28 | 0.00 | 0.00 | 1.00 | 0.45 |

### Feature: `file_modification_rate`

| Threat Class | Mean | Median | Min | Max | Std Dev |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`normal`** | 5.23 | 4.47 | 0.10 | 25.69 | 4.80 |
| **`brute_force`** | 5.22 | 4.67 | 0.10 | 22.97 | 4.66 |
| **`malware`** | 94.93 | 95.09 | 12.03 | 179.95 | 49.73 |
| **`data_exfiltration`** | 5.26 | 4.44 | 0.10 | 23.39 | 4.79 |
| **`anomalous_network_activity`** | 5.48 | 4.58 | 0.10 | 23.29 | 5.01 |

## 3. Single-Feature Predictor Leakage Analysis

Evaluates single-feature Decision Threshold classification accuracy on held-out test data to detect trivially separable features:

| Feature | Target Threat Class | Max Single-Feature Accuracy | Leakage Risk Level |
| :--- | :--- | :---: | :--- |
| `login_attempts` | `brute_force` | **95.62%** | 🚨 HIGH LEAKAGE |
| `failed_logins` | `brute_force` | **95.63%** | 🚨 HIGH LEAKAGE |
| `login_failure_rate` | `brute_force` | **82.21%** | ⚠️ MODERATE |
| `login_velocity` | `brute_force` | **95.99%** | 🚨 HIGH LEAKAGE |
| `new_user_login` | `brute_force` | **81.34%** | ⚠️ MODERATE |
| `new_country` | `brute_force` | **84.42%** | ⚠️ MODERATE |
| `new_ip` | `brute_force` | **77.30%** | ⚠️ MODERATE |
| `requests_per_min` | `anomalous_network_activity` | **96.16%** | 🚨 HIGH LEAKAGE |
| `bytes_sent_mb` | `data_exfiltration` | **95.38%** | 🚨 HIGH LEAKAGE |
| `bytes_received_mb` | `data_exfiltration` | **57.48%** | ✅ HEALTHY OVERLAP |
| `bytes_ratio` | `data_exfiltration` | **88.94%** | ⚠️ MODERATE |
| `external_connection_count` | `anomalous_network_activity` | **93.41%** | 🚨 HIGH LEAKAGE |
| `unusual_port_activity` | `anomalous_network_activity` | **73.47%** | ✅ HEALTHY OVERLAP |
| `dns_query_count` | `data_exfiltration` | **83.46%** | ⚠️ MODERATE |
| `domain_reputation_score` | `data_exfiltration` | **81.46%** | ⚠️ MODERATE |
| `cpu_usage_percent` | `malware` | **75.40%** | ⚠️ MODERATE |
| `ram_usage_percent` | `malware` | **69.83%** | ✅ HEALTHY OVERLAP |
| `process_count` | `malware` | **91.00%** | 🚨 HIGH LEAKAGE |
| `unsigned_process_count` | `malware` | **81.24%** | ⚠️ MODERATE |
| `hidden_process_count` | `malware` | **83.86%** | ⚠️ MODERATE |
| `privilege_escalation_attempt` | `malware` | **85.18%** | ⚠️ MODERATE |
| `cmd_powershell_execution` | `malware` | **70.45%** | ✅ HEALTHY OVERLAP |
| `file_modification_rate` | `malware` | **95.68%** | 🚨 HIGH LEAKAGE |
