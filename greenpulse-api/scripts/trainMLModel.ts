import fs from "fs";
import path from "path";

/**
 * GreenPulse Baseline ML Model Training & Evaluation Pipeline
 * 
 * Dataset: Deterministic Synthetic Hardware Telemetry Dataset (2,000 samples, fixed seed)
 * Features: cpu_usage_percent, ram_usage_percent, cpu_temperature_c, storage_usage_percent, ssd_wear_percent, battery_health_percent, health_score
 * Algorithm: L2-Regularized Logistic Regression with StandardScaler
 * Split: 80% Stratified Training / 20% Held-Out Testing
 */

// Seeded LCG PRNG for 100% deterministic synthetic dataset generation
class LCG {
  private seed: number;
  constructor(seed: number = 42) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
  gaussian(mean = 0, std = 1): number {
    const u1 = Math.max(1e-15, this.next());
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * std;
  }
}

export interface TelemetrySample {
  cpu_usage_percent: number;
  ram_usage_percent: number;
  cpu_temperature_c: number;
  storage_usage_percent: number;
  ssd_wear_percent: number;
  battery_health_percent: number;
  health_score: number;
  failure: number; // 0 = Healthy, 1 = Failure Risk
}

const FEATURE_NAMES = [
  "cpu_usage_percent",
  "ram_usage_percent",
  "cpu_temperature_c",
  "storage_usage_percent",
  "ssd_wear_percent",
  "battery_health_percent",
  "health_score",
];

function generateSyntheticDataset(sampleCount: number = 2000): TelemetrySample[] {
  const prng = new LCG(42);
  const dataset: TelemetrySample[] = [];

  for (let i = 0; i < sampleCount; i++) {
    const cpu_usage_percent = Math.min(100, Math.max(5, Math.round(prng.gaussian(48, 18))));
    const ram_usage_percent = Math.min(100, Math.max(10, Math.round(prng.gaussian(58, 16))));
    const cpu_temperature_c = Math.min(105, Math.max(35, Math.round(42 + cpu_usage_percent * 0.45 + prng.gaussian(0, 5))));
    const storage_usage_percent = Math.min(99, Math.max(15, Math.round(prng.next() * 84 + 15)));
    const ssd_wear_percent = Math.min(98, Math.max(1, Math.round(prng.next() * 95 + 2)));
    const battery_health_percent = Math.min(100, Math.max(25, Math.round(100 - prng.next() * 65)));
    
    // Composite health score
    const health_score = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          battery_health_percent * 0.3 +
          (100 - ssd_wear_percent) * 0.3 +
          (100 - Math.max(0, cpu_temperature_c - 50) * 1.5) * 0.2 +
          (100 - ram_usage_percent) * 0.1 +
          (100 - storage_usage_percent) * 0.1
        )
      )
    );

    // Physics-of-failure logit formula tuned for ~20% failure risk distribution
    const z =
      -2.2 +
      0.035 * cpu_temperature_c +
      0.045 * ssd_wear_percent -
      0.040 * battery_health_percent -
      0.030 * health_score +
      prng.gaussian(0, 0.3);

    const prob = 1 / (1 + Math.exp(-z));
    const failure = prob >= 0.5 ? 1 : 0;

    dataset.push({
      cpu_usage_percent,
      ram_usage_percent,
      cpu_temperature_c,
      storage_usage_percent,
      ssd_wear_percent,
      battery_health_percent,
      health_score,
      failure,
    });
  }

  return dataset;
}

export function trainAndEvaluateModel() {
  console.log("==================================================");
  console.log("  GREENPULSE ML PREDICTIVE MODEL TRAINING PIPELINE");
  console.log("==================================================");

  const dataset = generateSyntheticDataset(2000);
  const totalFailures = dataset.filter((d) => d.failure === 1).length;
  console.log(`📊 Generated Synthetic Dataset: ${dataset.length} samples (${totalFailures} failures, ${(totalFailures / dataset.length * 100).toFixed(1)}% positive class ratio)`);

  // Stratified 80/20 train/test split
  const zeros = dataset.filter((d) => d.failure === 0);
  const ones = dataset.filter((d) => d.failure === 1);

  const trainZerosCount = Math.floor(zeros.length * 0.8);
  const trainOnesCount = Math.floor(ones.length * 0.8);

  const trainData = [...zeros.slice(0, trainZerosCount), ...ones.slice(0, trainOnesCount)];
  const testData = [...zeros.slice(trainZerosCount), ...ones.slice(trainOnesCount)];

  console.log(`✂️ Stratified Split: ${trainData.length} training samples (80%), ${testData.length} test samples (20%)`);

  // Extract feature matrices X and label vectors y
  const extractFeatures = (samples: TelemetrySample[]) =>
    samples.map((s) => [
      s.cpu_usage_percent,
      s.ram_usage_percent,
      s.cpu_temperature_c,
      s.storage_usage_percent,
      s.ssd_wear_percent,
      s.battery_health_percent,
      s.health_score,
    ]);

  const X_train_raw = extractFeatures(trainData);
  const y_train = trainData.map((s) => s.failure);

  const X_test_raw = extractFeatures(testData);
  const y_test = testData.map((s) => s.failure);

  // Compute StandardScaler (mean and std per feature on training set)
  const numFeatures = FEATURE_NAMES.length;
  const means: number[] = new Array(numFeatures).fill(0);
  const stds: number[] = new Array(numFeatures).fill(0);

  for (let j = 0; j < numFeatures; j++) {
    const sum = X_train_raw.reduce((acc, row) => acc + row[j], 0);
    means[j] = sum / X_train_raw.length;
    const varSum = X_train_raw.reduce((acc, row) => acc + Math.pow(row[j] - means[j], 2), 0);
    stds[j] = Math.sqrt(varSum / X_train_raw.length) || 1;
  }

  const transform = (X: number[][]) =>
    X.map((row) => row.map((val, j) => (val - means[j]) / stds[j]));

  const X_train = transform(X_train_raw);
  const X_test = transform(X_test_raw);

  // Train L2-Regularized Logistic Regression using Gradient Descent
  let weights = new Array(numFeatures).fill(0);
  let intercept = 0;

  const lr = 0.05;
  const lambda = 0.01; // L2 penalty
  const epochs = 500;

  for (let epoch = 0; epoch < epochs; epoch++) {
    let dW = new Array(numFeatures).fill(0);
    let db = 0;

    for (let i = 0; i < X_train.length; i++) {
      let z = intercept;
      for (let j = 0; j < numFeatures; j++) {
        z += weights[j] * X_train[i][j];
      }
      const pred = 1 / (1 + Math.exp(-z));
      const error = pred - y_train[i];

      for (let j = 0; j < numFeatures; j++) {
        dW[j] += error * X_train[i][j];
      }
      db += error;
    }

    const N = X_train.length;
    for (let j = 0; j < numFeatures; j++) {
      weights[j] -= lr * (dW[j] / N + lambda * weights[j]);
    }
    intercept -= lr * (db / N);
  }

  console.log("⚙️ Model Training Complete (Gradient Descent with L2 Regularization, 500 Epochs)");

  // Evaluate on Held-Out Test Set (400 samples)
  let tp = 0, fp = 0, tn = 0, fn = 0;
  const testProbs: { prob: number; actual: number }[] = [];

  for (let i = 0; i < X_test.length; i++) {
    let z = intercept;
    for (let j = 0; j < numFeatures; j++) {
      z += weights[j] * X_test[i][j];
    }
    const prob = 1 / (1 + Math.exp(-z));
    const predLabel = prob >= 0.5 ? 1 : 0;
    const actualLabel = y_test[i];

    testProbs.push({ prob, actual: actualLabel });

    if (predLabel === 1 && actualLabel === 1) tp++;
    else if (predLabel === 1 && actualLabel === 0) fp++;
    else if (predLabel === 0 && actualLabel === 0) tn++;
    else if (predLabel === 0 && actualLabel === 1) fn++;
  }

  const accuracy = (tp + tn) / (tp + tn + fp + fn);
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  // Calculate ROC-AUC via threshold integration
  testProbs.sort((a, b) => b.prob - a.prob);
  const totalP = ones.length - trainOnesCount;
  const totalN = zeros.length - trainZerosCount;

  let auc = 0;
  let prevFPR = 0;
  let prevTPR = 0;
  let curTP = 0;
  let curFP = 0;

  for (let i = 0; i < testProbs.length; i++) {
    if (testProbs[i].actual === 1) curTP++;
    else curFP++;

    const fpr = curFP / totalN;
    const tpr = curTP / totalP;

    auc += ((fpr - prevFPR) * (tpr + prevTPR)) / 2;
    prevFPR = fpr;
    prevTPR = tpr;
  }

  console.log("\n📈 HELD-OUT TEST SET EVALUATION METRICS:");
  console.log(`   - Accuracy:  ${(accuracy * 100).toFixed(2)}%`);
  console.log(`   - Precision: ${(precision * 100).toFixed(2)}%`);
  console.log(`   - Recall:    ${(recall * 100).toFixed(2)}%`);
  console.log(`   - F1 Score:  ${(f1Score * 100).toFixed(2)}%`);
  console.log(`   - ROC-AUC:   ${auc.toFixed(4)}`);
  console.log("   - Confusion Matrix:");
  console.log(`       [ True Negative: ${tn},  False Positive: ${fp} ]`);
  console.log(`       [ False Negative: ${fn}, True Positive: ${tp} ]`);

  // Export Artifacts
  const modelsDir = path.join(__dirname, "../models");
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }

  const modelArtifact = {
    modelName: "greenpulse-risk-v1",
    modelVersion: "1.0.0",
    trainedAt: new Date().toISOString(),
    algorithm: "StandardScaler + L2-Regularized Logistic Regression",
    datasetInfo: {
      type: "Deterministic Synthetic Telemetry Dataset",
      totalSamples: 2000,
      trainSplit: 1600,
      testSplit: 400,
      randomSeed: 42,
    },
    featureNames: FEATURE_NAMES,
    scaler: { means, stds },
    model: { weights, intercept },
    evaluationMetrics: {
      accuracy: Number(accuracy.toFixed(4)),
      precision: Number(precision.toFixed(4)),
      recall: Number(recall.toFixed(4)),
      f1Score: Number(f1Score.toFixed(4)),
      rocAuc: Number(auc.toFixed(4)),
      confusionMatrix: { tn, fp, fn, tp },
    },
  };

  const featureSchemaArtifact = {
    schemaVersion: "1.0.0",
    features: FEATURE_NAMES.map((name, index) => ({
      name,
      type: "float",
      mean: Number(means[index].toFixed(2)),
      std: Number(stds[index].toFixed(2)),
      weight: Number(weights[index].toFixed(4)),
    })),
  };

  fs.writeFileSync(
    path.join(modelsDir, "greenpulse-risk-v1.json"),
    JSON.stringify(modelArtifact, null, 2)
  );

  fs.writeFileSync(
    path.join(modelsDir, "feature_schema.json"),
    JSON.stringify(featureSchemaArtifact, null, 2)
  );

  const modelCardContent = `# GreenPulse Device Risk Model Card (v1.0.0)

## Model Details
- **Name**: \`greenpulse-risk-v1\`
- **Model Type**: Logistic Regression with \`StandardScaler\` normalization
- **Trained Date**: ${new Date().toISOString().slice(0, 10)}
- **Primary Task**: Binary prediction of enterprise device failure risk from hardware telemetry.

## Training & Testing Dataset
- **Dataset**: Synthetic Telemetry Dataset generated with fixed seed (\`42\`) simulating hardware degradation curves.
- **Dataset Size**: 2,000 total samples (1,600 train / 400 test, stratified split).

## Held-Out Test Set Performance
- **Accuracy**: ${(accuracy * 100).toFixed(2)}%
- **Precision**: ${(precision * 100).toFixed(2)}%
- **Recall**: ${(recall * 100).toFixed(2)}%
- **F1 Score**: ${(f1Score * 100).toFixed(2)}%
- **ROC-AUC**: ${auc.toFixed(4)}
- **Confusion Matrix**:
  - True Positives (TP): ${tp}
  - True Negatives (TN): ${tn}
  - False Positives (FP): ${fp}
  - False Negatives (FN): ${fn}

## Learned Feature Importances (Model Weights)
${FEATURE_NAMES.map((name, i) => `- **${name}**: weight = \`${weights[i].toFixed(4)}\` (mean = ${means[i].toFixed(2)}, std = ${stds[i].toFixed(2)})`).join("\n")}
- **Intercept**: \`${intercept.toFixed(4)}\`

## Limitations
- Model is trained on synthetic telemetry distributions; real enterprise hardware edge cases (e.g. rare driver crashes) require fine-tuning on real production telemetry logs.
`;

  fs.writeFileSync(path.join(modelsDir, "MODEL_CARD.md"), modelCardContent);

  console.log("\n💾 Model artifacts successfully saved to:");
  console.log("   - models/greenpulse-risk-v1.json");
  console.log("   - models/feature_schema.json");
  console.log("   - models/MODEL_CARD.md");

  return modelArtifact;
}

if (process.argv[1]?.includes("trainMLModel")) {
  trainAndEvaluateModel();
}
