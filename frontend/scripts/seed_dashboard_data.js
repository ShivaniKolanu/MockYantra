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
