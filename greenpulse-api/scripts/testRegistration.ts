import { createApp } from "../src/app";
import { prisma } from "../src/config/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "../src/utils/schemas";
import { signToken } from "../src/middleware/auth";

async function runRegistrationTests() {
  console.log("==================================================");
  console.log("  GREENPULSE REGISTRATION & SECURITY TEST SUITE  ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  🟢 PASS: ${message}`);
      passed++;
    } else {
      console.error(`  🔴 FAIL: ${message}`);
      failed++;
    }
  }

  const app = createApp();

  async function callApi(path: string, options: { method?: string; body?: any; headers?: Record<string, string> } = {}) {
    return new Promise<{ status: number; body: any }>((resolve) => {
      const server = app.listen(0, async () => {
        const addr = server.address() as any;
        const port = addr.port;
        try {
          const res = await fetch(`http://localhost:${port}${path}`, {
            method: options.method || "GET",
            headers: {
              "Content-Type": "application/json",
              ...(options.headers || {}),
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
          });
          const text = await res.text();
          let json = {};
          try {
            json = JSON.parse(text);
          } catch {
            json = { text };
          }
          server.close();
          resolve({ status: res.status, body: json });
        } catch (err) {
          server.close();
          resolve({ status: 500, body: { error: String(err) } });
        }
      });
    });
  }

  try {
    const timestamp = Date.now();
    const testEmailA = `admin_${timestamp}@comp-a.com`;
    const testEmailB = `admin_${timestamp}@comp-b.com`;
    const passwordA = "securePass123";

    console.log("\n1. Testing Zod Input Validation Schemas...");
    const invalidEmailValidation = registerSchema.safeParse({
      companyName: "Test Co",
      name: "User",
      email: "not-an-email",
      password: "securePass123",
    });
    assert(!invalidEmailValidation.success, "Invalid email format rejected by Zod schema");

    const weakPasswordValidation = registerSchema.safeParse({
      companyName: "Test Co",
      name: "User",
      email: "user@test.com",
      password: "123",
    });
    assert(!weakPasswordValidation.success, "Weak password (<6 chars) rejected by Zod schema");

    const validPayloadValidation = registerSchema.safeParse({
      companyName: "Acme Enterprise",
      name: "Admin User",
      email: testEmailA,
      password: passwordA,
    });
    assert(validPayloadValidation.success, "Valid payload accepted by Zod schema");

    console.log("\n2. Testing HTTP Input Validation Endpoint (/api/auth/register)...");
    const invalidEmailRes = await callApi("/api/auth/register", {
      method: "POST",
      body: { companyName: "Test Co", name: "User", email: "not-an-email", password: "securePass123" },
    });
    assert(invalidEmailRes.status === 400, "Invalid email format rejected with HTTP 400");

    const weakPasswordRes = await callApi("/api/auth/register", {
      method: "POST",
      body: { companyName: "Test Co", name: "User", email: "user@test.com", password: "123" },
    });
    assert(weakPasswordRes.status === 400, "Weak password (<6 chars) rejected with HTTP 400");

    console.log("\n3. Testing Password Hashing & JWT Security Architecture...");
    const hashedPass = await bcrypt.hash(passwordA, 10);
    const passMatches = await bcrypt.compare(passwordA, hashedPass);
    assert(passMatches, "Bcrypt password hashing and verification functional");

    const mockToken = signToken({ userId: "usr-123", companyId: "cmp-123", email: testEmailA });
    assert(Boolean(mockToken) && mockToken.split(".").length === 3, "JWT token generation matches standard 3-part format");

    console.log("\n4. Testing Live Database Integration & Company Scoping...");
    let isDbConnected = false;
    try {
      await prisma.$connect();
      isDbConnected = true;
      console.log("  🟢 Database connection established.");
    } catch {
      console.log("  ℹ️ Local Postgres server at 5432 not active during build test environment. Database connection skipped.");
    }

    if (isDbConnected) {
      console.log("\nRunning live DB integration test suite...");
      const regResA = await callApi("/api/auth/register", {
        method: "POST",
        body: { companyName: `Company A ${timestamp}`, name: "Admin A", email: testEmailA, password: passwordA },
      });
      assert(regResA.status === 201, "Registration returns HTTP 201 Created");
      assert(Boolean(regResA.body.token), "Registration returns valid JWT token");
      assert(regResA.body.user?.email === testEmailA.toLowerCase(), "User email matches lowercase normalized email");

      const userInDbA = await prisma.user.findUnique({
        where: { email: testEmailA.toLowerCase() },
        include: { company: true },
      });
      assert(Boolean(userInDbA), "User record created in database");
      assert(userInDbA?.company.name === `Company A ${timestamp}`, "User-Company relationship created atomically");

      const dupRes = await callApi("/api/auth/register", {
        method: "POST",
        body: { companyName: "Company Dup", name: "Dup Admin", email: testEmailA, password: passwordA },
      });
      assert(dupRes.status === 400, "Duplicate email rejected with HTTP 400");

      const loginRes = await callApi("/api/login", {
        method: "POST",
        body: { email: testEmailA, password: passwordA },
      });
      assert(loginRes.status === 200, "Login succeeds with registered user credentials");

      const regResB = await callApi("/api/auth/register", {
        method: "POST",
        body: { companyName: `Company B ${timestamp}`, name: "Admin B", email: testEmailB, password: "passwordB123" },
      });
      const tokenA = regResA.body.token;
      const tokenB = regResB.body.token;

      const enrollResA = await callApi("/api/devices/enroll", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { name: "Laptop-A", deviceType: "laptop", serialNumber: `SN-A-${timestamp}` },
      });
      assert(enrollResA.status === 201, "Company A enrolled Device A");
      const deviceIdA = enrollResA.body.device.id;

      const listB = await callApi("/api/devices", {
        method: "GET",
        headers: { Authorization: `Bearer ${tokenB}` },
      });
      assert(listB.body.total === 0, "Company B cannot list Company A devices");

      const getDeviceB = await callApi(`/api/devices/${deviceIdA}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${tokenB}` },
      });
      assert(getDeviceB.status === 404, "Company B querying Company A device gets HTTP 404 (Isolation Enforcement)");

      await prisma.telemetryReading.deleteMany({ where: { deviceId: deviceIdA } });
      await prisma.deviceHealthPoint.deleteMany({ where: { deviceId: deviceIdA } });
      await prisma.device.deleteMany({ where: { id: deviceIdA } });
      await prisma.user.deleteMany({ where: { email: { in: [testEmailA.toLowerCase(), testEmailB.toLowerCase()] } } });
      await prisma.company.deleteMany({
        where: { name: { in: [`Company A ${timestamp}`, `Company B ${timestamp}`] } },
      });
    }

    console.log("\n==================================================");
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("Test execution exception:", err);
    process.exit(1);
  }
}

runRegistrationTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
