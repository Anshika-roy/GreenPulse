import json, random
random.seed(42)

first_five = [
    dict(id="dev-001", assetTag="LAP-IT-1021", model="ThinkPad T14 Gen 3", category="laptop",
         healthScore=42, riskLevel="high", issue=dict(code="BATTERY_DEGRADATION", label="Battery Degradation", detectedAt="2025-05-10"),
         aiConfidence=94, recommendation=dict(action="Replace in 14 days", actionType="replace", etaDate="2025-05-31", confidence=94)),
    dict(id="dev-002", assetTag="LAP-IT-0978", model="ThinkBook 15 G4", category="laptop",
         healthScore=55, riskLevel="high", issue=dict(code="SSD_HEALTH_LOW", label="SSD Health Low", detectedAt="2025-05-09"),
         aiConfidence=89, recommendation=dict(action="Backup & Replace", actionType="backup-replace", etaDate="2025-06-02", confidence=89)),
    dict(id="dev-003", assetTag="LAP-IT-0546", model="ThinkPad X1 Carbon", category="laptop",
         healthScore=58, riskLevel="high", issue=dict(code="OVERHEATING", label="Overheating Detected", detectedAt="2025-05-11"),
         aiConfidence=91, recommendation=dict(action="Clean & Check Fan", actionType="clean-check", etaDate="2025-05-28", confidence=91)),
    dict(id="dev-004", assetTag="LAP-IT-0882", model="ThinkPad E14 Gen 2", category="laptop",
         healthScore=70, riskLevel="medium", issue=dict(code="RAM_ERRORS", label="RAM Errors", detectedAt="2025-05-08"),
         aiConfidence=72, recommendation=dict(action="Run Diagnostics", actionType="diagnostics", etaDate="2025-06-05", confidence=72)),
    dict(id="dev-005", assetTag="LAP-IT-0771", model="Legion 5 Pro", category="laptop",
         healthScore=75, riskLevel="medium", issue=dict(code="FAN_NOISE", label="Fan Noise High", detectedAt="2025-05-12"),
         aiConfidence=68, recommendation=dict(action="Schedule Service", actionType="schedule-service", etaDate="2025-06-06", confidence=68)),
]

models = ["ThinkPad T14 Gen 3","ThinkBook 15 G4","ThinkPad X1 Carbon","ThinkPad E14 Gen 2","Legion 5 Pro",
          "MacBook Air M2","Dell Latitude 5440","HP EliteBook 840","Dell XPS 13","HP ProBook 450",
          "Surface Laptop 5","ThinkCentre M90","Dell OptiPlex 7020"]
categories = ["laptop","laptop","laptop","laptop","desktop","laptop","laptop","laptop","laptop","laptop","laptop","desktop","desktop"]
issues = [
    ("BATTERY_DEGRADATION","Battery Degradation","replace","Replace in {n} days"),
    ("SSD_HEALTH_LOW","SSD Health Low","backup-replace","Backup & Replace"),
    ("OVERHEATING","Overheating Detected","clean-check","Clean & Check Fan"),
    ("RAM_ERRORS","RAM Errors","diagnostics","Run Diagnostics"),
    ("FAN_NOISE","Fan Noise High","schedule-service","Schedule Service"),
    ("DISPLAY_FLICKER","Display Flicker","diagnostics","Run Diagnostics"),
    ("KEYBOARD_FAULT","Keyboard Fault","schedule-service","Schedule Service"),
    ("SLOW_BOOT","Slow Boot Times","monitor","Monitor"),
]
locations = ["Mumbai HQ","Bengaluru Office","Delhi Office","Pune Office","Chennai Office","Hyderabad Office"]
depts = ["Engineering","Sales","Finance","HR","IT Operations","Marketing","Customer Success"]
owners = ["Aditya Rao","Priya Sharma","Karan Mehta","Sneha Iyer","Vikram Singh","Neha Gupta","Arjun Nair","Divya Menon"]

devices = []
for d in first_five:
    d["status"]="active"
    d["healthHistory"]=[max(20, d["healthScore"]+random.randint(-8,8)) for _ in range(10)]
    d["healthHistory"][-1]=d["healthScore"]
    d["owner"]={"name": random.choice(owners), "department": random.choice(depts)}
    d["location"]=random.choice(locations)
    d["purchaseDate"]="2022-03-15"
    d["warrantyExpiresAt"]="2025-06-30"
    d["lastCheckedAt"]="2025-05-18T06:00:00Z"
    devices.append(d)

for i in range(6, 39):
    idx = i-1
    model_idx = idx % len(models)
    issue_code, issue_label, action_type, action_tmpl = random.choice(issues)
    health = random.randint(35, 96)
    risk = "high" if health < 60 else ("medium" if health < 80 else "low")
    conf = random.randint(55, 98)
    eta_days = random.choice([7,14,21,30,45])
    action_label = action_tmpl.format(n=eta_days) if "{n}" in action_tmpl else action_tmpl
    devices.append(dict(
        id=f"dev-{i:03d}",
        assetTag=f"LAP-IT-{1000+i:04d}" if categories[model_idx]=="laptop" else f"DSK-IT-{1000+i:04d}",
        model=models[model_idx],
        category=categories[model_idx],
        status=random.choice(["active","active","active","in-repair"]),
        healthScore=health,
        riskLevel=risk,
        issue=dict(code=issue_code, label=issue_label, detectedAt="2025-05-%02d" % random.randint(1,17)),
        aiConfidence=conf,
        recommendation=dict(action=action_label, actionType=action_type, etaDate="2025-06-%02d" % random.randint(1,28), confidence=conf),
        owner={"name": random.choice(owners), "department": random.choice(depts)},
        location=random.choice(locations),
        purchaseDate="2022-01-10",
        warrantyExpiresAt="2025-09-30",
        healthHistory=[max(15,health+random.randint(-10,10)) for _ in range(10)],
        lastCheckedAt="2025-05-18T06:00:00Z",
    ))

print(json.dumps(devices, indent=2))
