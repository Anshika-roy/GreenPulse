# GreenPulse Device Risk Model Card (v1.0.0)

## Model Details
- **Name**: `greenpulse-risk-v1`
- **Model Type**: Logistic Regression with `StandardScaler` normalization
- **Trained Date**: 2026-09-26
- **Primary Task**: Binary prediction of enterprise device failure risk from hardware telemetry.

## Training & Testing Dataset
- **Dataset**: Synthetic Telemetry Dataset generated with fixed seed (`42`) simulating hardware degradation curves.
- **Dataset Size**: 2,000 total samples (1,600 train / 400 test, stratified split).

## Held-Out Test Set Performance
- **Accuracy**: 96.50%
- **Precision**: 97.30%
- **Recall**: 73.47%
- **F1 Score**: 83.72%
- **ROC-AUC**: 0.9958
- **Confusion Matrix**:
  - True Positives (TP): 36
  - True Negatives (TN): 350
  - False Positives (FP): 1
  - False Negatives (FN): 13

## Learned Feature Importances (Model Weights)
- **cpu_usage_percent**: weight = `0.0758` (mean = 47.66, std = 18.16)
- **ram_usage_percent**: weight = `-0.0292` (mean = 57.88, std = 15.96)
- **cpu_temperature_c**: weight = `0.2085` (mean = 63.43, std = 9.45)
- **storage_usage_percent**: weight = `-0.0937` (mean = 57.48, std = 24.54)
- **ssd_wear_percent**: weight = `0.7318` (mean = 49.09, std = 27.80)
- **battery_health_percent**: weight = `-0.5649` (mean = 67.07, std = 19.04)
- **health_score**: weight = `-0.8929` (mean = 59.78, std = 10.72)
- **Intercept**: `-2.5384`

## Limitations
- Model is trained on synthetic telemetry distributions; real enterprise hardware edge cases (e.g. rare driver crashes) require fine-tuning on real production telemetry logs.
