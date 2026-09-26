import fs from "fs";
import path from "path";
import { CyberTelemetryEvent, generateCyberDataset } from "./generateCyberDataset";

/**
 * GreenPulse AI Multiclass Threat Detection Classifier Training Pipeline
 * 
 * Dataset: 10,000 Synthetic Cybersecurity Telemetry Samples
 * Classes (5): normal, brute_force, malware, data_exfiltration, anomalous_network_activity
 * Features (16): numeric authentication, network, and process features
 * Split: 80% Stratified Training (8,000 samples) / 20% Testing (2,000 samples)
 */

const CLASS_NAMES = ["normal", "brute_force", "malware", "data_exfiltration", "anomalous_network_activity"] as const;
type ThreatClass = typeof CLASS_NAMES[number];

const FEATURE_NAMES = [
  "login_attempts",
  "failed_logins",
  "login_failure_rate",
  "login_velocity",
  "new_user_login",
  "new_country",
  "new_ip",
  "requests_per_min",
  "bytes_sent_mb",
  "bytes_received_mb",
  "bytes_ratio",
  "external_connection_count",
  "unusual_port_activity",
  "dns_query_count",
  "domain_reputation_score",
  "cpu_usage_percent",
  "ram_usage_percent",
  "process_count",
  "unsigned_process_count",
  "hidden_process_count",
  "privilege_escalation_attempt",
  "cmd_powershell_execution",
  "file_modification_rate",
];

function extractFeatures(sample: CyberTelemetryEvent): number[] {
  return [
    sample.login_attempts,
    sample.failed_logins,
    sample.login_failure_rate,
    sample.login_velocity,
    sample.new_user_login,
    sample.new_country,
    sample.new_ip,
    sample.requests_per_min,
    sample.bytes_sent_mb,
    sample.bytes_received_mb,
    sample.bytes_ratio,
    sample.external_connection_count,
    sample.unusual_port_activity,
    sample.dns_query_count,
    sample.domain_reputation_score,
    sample.cpu_usage_percent,
    sample.ram_usage_percent,
    sample.process_count,
    sample.unsigned_process_count,
    sample.hidden_process_count,
    sample.privilege_escalation_attempt,
    sample.cmd_powershell_execution,
    sample.file_modification_rate,
  ];
}

export function trainCyberModel() {
  console.log("==================================================");
  console.log("  GREENPULSE 5-CLASS CYBER THREAT MODEL TRAINING  ");
  console.log("==================================================");

  const dataset = generateCyberDataset();

  // 80/20 Stratified Split
  const trainSamples: CyberTelemetryEvent[] = [];
  const testSamples: CyberTelemetryEvent[] = [];

  CLASS_NAMES.forEach((cls) => {
    const classRows = dataset.filter((d) => d.label === cls);
    const trainCount = Math.floor(classRows.length * 0.8);
    trainSamples.push(...classRows.slice(0, trainCount));
    testSamples.push(...classRows.slice(trainCount));
  });

  console.log(`📊 Total Dataset: ${dataset.length} samples`);
  console.log(`✂️ Stratified Split: ${trainSamples.length} training (80%), ${testSamples.length} testing (20%)`);

  const X_train_raw = trainSamples.map(extractFeatures);
  const y_train = trainSamples.map((s) => CLASS_NAMES.indexOf(s.label));

  const X_test_raw = testSamples.map(extractFeatures);
  const y_test = testSamples.map((s) => CLASS_NAMES.indexOf(s.label));

  // Compute StandardScaler
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

  // Train Softmax Multiclass Logistic Regression (One-vs-Rest / Softmax GD)
  const numClasses = CLASS_NAMES.length;
  let weights: number[][] = Array.from({ length: numClasses }, () => new Array(numFeatures).fill(0));
  let intercepts: number[] = new Array(numClasses).fill(0);

  const lr = 0.08;
  const epochs = 400;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const dW: number[][] = Array.from({ length: numClasses }, () => new Array(numFeatures).fill(0));
    const db: number[] = new Array(numClasses).fill(0);

    for (let i = 0; i < X_train.length; i++) {
      const logits = new Array(numClasses).fill(0);
      for (let c = 0; c < numClasses; c++) {
        let z = intercepts[c];
        for (let j = 0; j < numFeatures; j++) {
          z += weights[c][j] * X_train[i][j];
        }
        logits[c] = z;
      }

      // Softmax probabilities
      const maxLogit = Math.max(...logits);
      const exps = logits.map((l) => Math.exp(l - maxLogit));
      const sumExps = exps.reduce((a, b) => a + b, 0);
      const probs = exps.map((e) => e / sumExps);

      const targetClass = y_train[i];

      for (let c = 0; c < numClasses; c++) {
        const error = probs[c] - (c === targetClass ? 1 : 0);
        for (let j = 0; j < numFeatures; j++) {
          dW[c][j] += error * X_train[i][j];
        }
        db[c] += error;
      }
    }

    const N = X_train.length;
    for (let c = 0; c < numClasses; c++) {
      for (let j = 0; j < numFeatures; j++) {
        weights[c][j] -= lr * (dW[c][j] / N + 0.001 * weights[c][j]);
      }
      intercepts[c] -= lr * (db[c] / N);
    }
  }

  console.log("⚙️ Softmax Multiclass Gradient Descent Complete (400 Epochs)");

  // Evaluate on Held-Out Test Set (2,000 samples)
  let correct = 0;
  const confusionMatrix: number[][] = Array.from({ length: numClasses }, () => new Array(numClasses).fill(0));

  for (let i = 0; i < X_test.length; i++) {
    const logits = new Array(numClasses).fill(0);
    for (let c = 0; c < numClasses; c++) {
      let z = intercepts[c];
      for (let j = 0; j < numFeatures; j++) {
        z += weights[c][j] * X_test[i][j];
      }
      logits[c] = z;
    }

    const maxLogit = Math.max(...logits);
    const exps = logits.map((l) => Math.exp(l - maxLogit));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    const probs = exps.map((e) => e / sumExps);

    const predictedClass = probs.indexOf(Math.max(...probs));
    const actualClass = y_test[i];

    confusionMatrix[actualClass][predictedClass]++;
    if (predictedClass === actualClass) correct++;
  }

  const accuracy = (correct / X_test.length) * 100;
  console.log(`\n📈 MULTICLASS THREAT DETECTOR TEST ACCURACY: ${accuracy.toFixed(2)}%`);
  console.log("\n📋 CONFUSION MATRIX (Rows: Actual, Cols: Predicted):");
  console.log("                      " + CLASS_NAMES.map((c) => c.slice(0, 7).padStart(8)).join(""));
  CLASS_NAMES.forEach((cls, r) => {
    const rowStr = confusionMatrix[r].map((v) => String(v).padStart(8)).join("");
    console.log(`   - ${cls.padEnd(16)} |${rowStr}`);
  });

  // Save Artifacts
  const modelsDir = path.join(__dirname, "../models");
  if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });

  const modelArtifact = {
    modelName: "greenpulse-cyber-threat-v1",
    modelVersion: "1.0.0",
    trainedAt: new Date().toISOString(),
    classes: CLASS_NAMES,
    featureNames: FEATURE_NAMES,
    scaler: { means, stds },
    model: { weights, intercepts },
    accuracy: Number(accuracy.toFixed(2)),
  };

  fs.writeFileSync(
    path.join(modelsDir, "greenpulse-cyber-threat-v1.json"),
    JSON.stringify(modelArtifact, null, 2)
  );

  console.log("\n💾 Model artifact successfully saved to:");
  console.log("   - models/greenpulse-cyber-threat-v1.json");
}

if (process.argv[1]?.includes("trainCyberModel")) {
  trainCyberModel();
}
