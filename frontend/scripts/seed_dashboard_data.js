const Database = require("better-sqlite3");

const db = new Database("dev.db");
const now = new Date();

function isoDaysAgo(days) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const projects = [
  {
    id: "seed_proj_commerce_suite",
    name: "Commerce Suite",
    projectCode: "commerce-suite",
    description: "Seeded ecommerce mocks",
    baseUrl: null,
    createdAt: isoDaysAgo(6),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "seed_proj_campus_ops",
    name: "Campus Ops",
    projectCode: "campus-ops",
    description: "Seeded campus operations mocks",
    baseUrl: null,
    createdAt: isoDaysAgo(5),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "seed_proj_fintech_lab",
    name: "Fintech Lab",
    projectCode: "fintech-lab",
    description: "Seeded fintech mocks",
    baseUrl: null,
    createdAt: isoDaysAgo(4),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "seed_proj_ai_agent_hub",
    name: "AI Agent Hub",
    projectCode: "ai-agent-hub",
    description: "Seeded AI agent workflow mocks",
    baseUrl: null,
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(0),
  },
  {
    id: "seed_proj_health_portal",
    name: "Health Portal",
    projectCode: "health-portal",
    description: "Seeded healthcare platform mocks",
    baseUrl: null,
    createdAt: isoDaysAgo(2),
    updatedAt: isoDaysAgo(0),
  },
];

const apis = [
  {
    id: "seed_api_orders",
    projectId: "seed_proj_commerce_suite",
    name: "Orders API",
    method: "GET",
    path: "/commerce-suite/orders",
    isActive: 1,
    description: "List recent ecommerce orders",
    rows: Array.from({ length: 24 }, (_, index) => ({
      orderId: `ORD-${1000 + index}`,
      customerName: ["Ava", "Liam", "Mia", "Noah"][index % 4],
      status: ["processing", "shipped", "delivered"][index % 3],
      total: 89 + index * 7,
      createdAt: isoDaysAgo(index % 7),
    })),
    createdAt: isoDaysAgo(6),
    updatedAt: isoDaysAgo(2),
  },
  {
    id: "seed_api_checkout",
    projectId: "seed_proj_commerce_suite",
    name: "Checkout Sessions",
    method: "POST",
    path: "/commerce-suite/checkout-sessions",
    isActive: 1,
    description: "Create checkout sessions",
    rows: Array.from({ length: 12 }, (_, index) => ({
      sessionId: `CHK-${500 + index}`,
      email: `buyer${index + 1}@shop.dev`,
      currency: "USD",
      cartValue: 45 + index * 11,
      status: ["pending", "completed"][index % 2],
    })),
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "seed_api_inventory",
    projectId: "seed_proj_commerce_suite",
    name: "Inventory API",
    method: "PATCH",
    path: "/commerce-suite/inventory",
    isActive: 0,
    description: "Patch inventory counts",
    rows: Array.from({ length: 18 }, (_, index) => ({
      sku: `SKU-${200 + index}`,
      warehouse: ["ATL", "DAL", "SFO"][index % 3],
      quantity: 20 + index,
      lowStock: index % 5 === 0,
    })),
    createdAt: isoDaysAgo(1),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "seed_api_courses",
    projectId: "seed_proj_campus_ops",
    name: "Courses API",
    method: "GET",
    path: "/campus-ops/courses",
    isActive: 1,
    description: "List course catalog",
    rows: Array.from({ length: 30 }, (_, index) => ({
      courseCode: `CSE-${100 + index}`,
      title: ["Algorithms", "Databases", "Networks", "AI"][index % 4],
      credits: [2, 3, 4][index % 3],
      semester: ["Spring", "Fall"][index % 2],
    })),
    createdAt: isoDaysAgo(5),
    updatedAt: isoDaysAgo(2),
  },
  {
    id: "seed_api_faculty",
    projectId: "seed_proj_campus_ops",
    name: "Faculty Directory",
    method: "GET",
    path: "/campus-ops/faculty",
    isActive: 0,
    description: "Faculty directory listing",
    rows: Array.from({ length: 15 }, (_, index) => ({
      facultyId: `FAC-${300 + index}`,
      fullName: ["Dr Smith", "Dr Lee", "Dr Patel", "Dr Kim"][index % 4],
      department: ["CS", "Math", "Physics"][index % 3],
      tenured: index % 2 === 0,
    })),
    createdAt: isoDaysAgo(2),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "seed_api_wallets",
    projectId: "seed_proj_fintech_lab",
    name: "Wallet Balances",
    method: "GET",
    path: "/fintech-lab/wallets",
    isActive: 1,
    description: "Wallet balance summary",
    rows: Array.from({ length: 22 }, (_, index) => ({
      walletId: `WLT-${700 + index}`,
      owner: `user${index + 1}`,
      currency: ["USD", "EUR", "INR"][index % 3],
      balance: 1500 + index * 133,
    })),
    createdAt: isoDaysAgo(4),
    updatedAt: isoDaysAgo(2),
  },
  {
    id: "seed_api_payouts",
    projectId: "seed_proj_fintech_lab",
    name: "Payout Requests",
    method: "POST",
    path: "/fintech-lab/payout-requests",
    isActive: 1,
    description: "Create payout requests",
    rows: Array.from({ length: 14 }, (_, index) => ({
      requestId: `PAY-${900 + index}`,
      merchant: `merchant-${index + 1}`,
      amount: 250 + index * 35,
      status: ["queued", "approved", "sent"][index % 3],
    })),
    createdAt: isoDaysAgo(2),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "seed_api_risk",
    projectId: "seed_proj_fintech_lab",
    name: "Risk Reviews",
    method: "PUT",
    path: "/fintech-lab/risk-reviews",
    isActive: 0,
    description: "Submit risk review updates",
    rows: Array.from({ length: 10 }, (_, index) => ({
      reviewId: `RSK-${100 + index}`,
      score: 55 + index * 3,
      decision: ["manual_review", "approved", "blocked"][index % 3],
      region: ["US", "EU", "APAC"][index % 3],
    })),
    createdAt: isoDaysAgo(0),
    updatedAt: isoDaysAgo(0),
  },
  // Commerce Suite extras
  {
    id: "seed_api_products",
    projectId: "seed_proj_commerce_suite",
    name: "Product Catalog",
    method: "GET",
    path: "/commerce-suite/products",
    isActive: 1,
    description: "Browse full product catalog",
    rows: Array.from({ length: 20 }, (_, index) => ({
      productId: `PRD-${300 + index}`,
      name: ["Wireless Headset", "Mechanical Keyboard", "USB Hub", "Webcam", "Monitor"][index % 5],
      category: ["Electronics", "Accessories", "Peripherals"][index % 3],
      price: 29 + index * 15,
      inStock: index % 4 !== 0,
    })),
    createdAt: isoDaysAgo(5),
    updatedAt: isoDaysAgo(3),
  },
  {
    id: "seed_api_discounts",
    projectId: "seed_proj_commerce_suite",
    name: "Discount Codes",
    method: "GET",
    path: "/commerce-suite/discount-codes",
    isActive: 1,
    description: "List active discount codes",
    rows: Array.from({ length: 8 }, (_, index) => ({
      code: `SAVE${10 + index * 5}`,
      discountPercent: 10 + index * 5,
      expiresAt: isoDaysAgo(-(index + 1)),
      usageLimit: 100,
      usedCount: index * 12,
    })),
    createdAt: isoDaysAgo(4),
    updatedAt: isoDaysAgo(2),
  },
  // Campus Ops extras
  {
    id: "seed_api_enrollment",
    projectId: "seed_proj_campus_ops",
    name: "Enrollment API",
    method: "POST",
    path: "/campus-ops/enrollment",
    isActive: 1,
    description: "Submit course enrollment requests",
    rows: Array.from({ length: 16 }, (_, index) => ({
      enrollmentId: `ENR-${400 + index}`,
      studentId: `STU-${1000 + index}`,
      courseCode: `CSE-${100 + (index % 10)}`,
      status: ["confirmed", "waitlisted", "pending"][index % 3],
      semester: "Fall 2026",
    })),
    createdAt: isoDaysAgo(4),
    updatedAt: isoDaysAgo(2),
  },
  {
    id: "seed_api_grades",
    projectId: "seed_proj_campus_ops",
    name: "Student Grades",
    method: "GET",
    path: "/campus-ops/grades",
    isActive: 1,
    description: "Fetch student grade reports",
    rows: Array.from({ length: 18 }, (_, index) => ({
      studentId: `STU-${1000 + index}`,
      courseCode: `CSE-${100 + (index % 8)}`,
      grade: ["A", "B+", "B", "A-", "C+"][index % 5],
      credits: [3, 4][index % 2],
      semester: "Spring 2026",
    })),
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(1),
  },
  // Fintech Lab extras
  {
    id: "seed_api_transactions",
    projectId: "seed_proj_fintech_lab",
    name: "Transaction History",
    method: "GET",
    path: "/fintech-lab/transactions",
    isActive: 1,
    description: "Fetch paginated transaction history",
    rows: Array.from({ length: 25 }, (_, index) => ({
      txnId: `TXN-${5000 + index}`,
      amount: 50 + index * 22,
      currency: ["USD", "EUR", "INR"][index % 3],
      type: ["credit", "debit"][index % 2],
      status: ["settled", "pending", "failed"][index % 3],
    })),
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "seed_api_kyc",
    projectId: "seed_proj_fintech_lab",
    name: "KYC Verification",
    method: "POST",
    path: "/fintech-lab/kyc-verification",
    isActive: 1,
    description: "Submit and retrieve KYC status",
    rows: Array.from({ length: 12 }, (_, index) => ({
      kycId: `KYC-${200 + index}`,
      userId: `user-${index + 1}`,
      documentType: ["passport", "driving_license", "national_id"][index % 3],
      status: ["approved", "pending", "rejected"][index % 3],
      verifiedAt: isoDaysAgo(index % 5),
    })),
    createdAt: isoDaysAgo(1),
    updatedAt: isoDaysAgo(0),
  },
  // AI Agent Hub
  {
    id: "seed_api_agent_status",
    projectId: "seed_proj_ai_agent_hub",
    name: "Agent Status",
    method: "GET",
    path: "/ai-agent-hub/agent-status",
    isActive: 1,
    description: "Get current status of running agents",
    rows: Array.from({ length: 10 }, (_, index) => ({
      agentId: `AGT-${100 + index}`,
      name: ["ResearchAgent", "SummaryAgent", "PlannerAgent", "CoderAgent"][index % 4],
      status: ["running", "idle", "completed", "error"][index % 4],
      tasksCompleted: index * 3,
      lastActiveAt: isoDaysAgo(index % 3),
    })),
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "seed_api_tool_calls",
    projectId: "seed_proj_ai_agent_hub",
    name: "Tool Calls Log",
    method: "GET",
    path: "/ai-agent-hub/tool-calls",
    isActive: 1,
    description: "List recent tool call invocations by agents",
    rows: Array.from({ length: 20 }, (_, index) => ({
      callId: `CALL-${800 + index}`,
      agentId: `AGT-${100 + (index % 4)}`,
      tool: ["web_search", "code_exec", "file_read", "api_call"][index % 4],
      status: ["success", "failed", "timeout"][index % 3],
      durationMs: 120 + index * 30,
    })),
    createdAt: isoDaysAgo(2),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "seed_api_memory_store",
    projectId: "seed_proj_ai_agent_hub",
    name: "Memory Store",
    method: "PUT",
    path: "/ai-agent-hub/memory-store",
    isActive: 0,
    description: "Read and write agent memory entries",
    rows: Array.from({ length: 8 }, (_, index) => ({
      memoryId: `MEM-${50 + index}`,
      agentId: `AGT-${100 + (index % 3)}`,
      key: `context_${index}`,
      value: `Stored context value for step ${index}`,
      ttlSeconds: 3600,
    })),
    createdAt: isoDaysAgo(1),
    updatedAt: isoDaysAgo(0),
  },
  // Health Portal
  {
    id: "seed_api_patients",
    projectId: "seed_proj_health_portal",
    name: "Patient Records",
    method: "GET",
    path: "/health-portal/patients",
    isActive: 1,
    description: "Retrieve patient summary records",
    rows: Array.from({ length: 15 }, (_, index) => ({
      patientId: `PAT-${600 + index}`,
      fullName: ["Alice Brown", "Bob Chen", "Carol Das", "David Rao"][index % 4],
      age: 25 + index * 3,
      bloodGroup: ["A+", "B+", "O-", "AB+"][index % 4],
      lastVisit: isoDaysAgo(index % 10),
    })),
    createdAt: isoDaysAgo(2),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "seed_api_appointments",
    projectId: "seed_proj_health_portal",
    name: "Appointment Slots",
    method: "GET",
    path: "/health-portal/appointment-slots",
    isActive: 1,
    description: "List available appointment slots",
    rows: Array.from({ length: 14 }, (_, index) => ({
      slotId: `SLT-${300 + index}`,
      doctorName: ["Dr. Mehta", "Dr. Singh", "Dr. Nair"][index % 3],
      specialty: ["Cardiology", "General", "Neurology"][index % 3],
      date: isoDaysAgo(-(index % 7)),
      available: index % 3 !== 0,
    })),
    createdAt: isoDaysAgo(1),
    updatedAt: isoDaysAgo(0),
  },
  {
    id: "seed_api_prescriptions",
    projectId: "seed_proj_health_portal",
    name: "Prescriptions",
    method: "GET",
    path: "/health-portal/prescriptions",
    isActive: 1,
    description: "Fetch patient prescription history",
    rows: Array.from({ length: 12 }, (_, index) => ({
      rxId: `RX-${400 + index}`,
      patientId: `PAT-${600 + (index % 5)}`,
      medication: ["Amoxicillin", "Metformin", "Lisinopril", "Atorvastatin"][index % 4],
      dosage: ["500mg", "10mg", "20mg", "5mg"][index % 4],
      refillsLeft: index % 4,
    })),
    createdAt: isoDaysAgo(0),
    updatedAt: isoDaysAgo(0),
  },
];

const insertProject = db.prepare(
  "INSERT INTO Project (id, name, projectCode, description, baseUrl, createdAt, updatedAt) VALUES (@id, @name, @projectCode, @description, @baseUrl, @createdAt, @updatedAt)"
);

const insertApi = db.prepare(
  "INSERT INTO Api (id, projectId, name, endpoint, method, isActive, description, responseSchema, createdAt, updatedAt) VALUES (@id, @projectId, @name, @endpoint, @method, @isActive, @description, @responseSchema, @createdAt, @updatedAt)"
);

const removeSeedApis = db.prepare("DELETE FROM Api WHERE id LIKE 'seed_api_%'");
const removeSeedProjects = db.prepare("DELETE FROM Project WHERE id LIKE 'seed_proj_%'");

const run = db.transaction(() => {
  removeSeedApis.run();
  removeSeedProjects.run();

  for (const project of projects) {
    insertProject.run(project);
  }

  for (const api of apis) {
    const sampleData = api.rows;
    const firstRow = sampleData[0] ?? {};
    const schema = {
      type: "object",
      properties: Object.fromEntries(
        Object.keys(firstRow).map((key) => {
          const value = firstRow[key];
          const type = typeof value === "number"
            ? "number"
            : typeof value === "boolean"
              ? "boolean"
              : "string";
          return [key, { type }];
        })
      ),
      required: Object.keys(firstRow),
    };

    insertApi.run({
      id: api.id,
      projectId: api.projectId,
      name: api.name,
      endpoint: `https://api.mockyantra.dev${api.path}`,
      method: api.method,
      isActive: api.isActive,
      description: api.description,
      responseSchema: JSON.stringify({
        schema,
        sampleData,
        endpointPath: api.path,
      }),
      createdAt: api.createdAt,
      updatedAt: api.updatedAt,
    });
  }
});

run();
console.log(`Seeded projects: ${projects.length}, seeded APIs: ${apis.length}`);
