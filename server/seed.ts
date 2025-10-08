import { db } from "./db";
import { tenants } from "@shared/schema";

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // Check if tenants already exist
    const existingTenants = await db.select().from(tenants);
    if (existingTenants.length > 0) {
      console.log("✅ Database already seeded");
      return;
    }

    // Insert default tenants
    const defaultTenants = [
      {
        name: "Superuser",
        slug: "superuser",
        description: "Admin & System Management",
        erpnextUrl: "http://localhost:8080",
        erpnextApiKey: "175aafefd8c448f",
        erpnextApiSecret: "1b2b919c1580ade",
        saleorUrl: "http://localhost:8000",
        saleorToken: "4xtNglUY26s6lDOptk0oUeT66bqxbt",
        isActive: true
      },
      {
        name: "SudoTechServe",
        slug: "sudotechserve",
        description: "Agency & SaaS Operations",
        erpnextUrl: "http://localhost:8080",
        erpnextApiKey: "175aafefd8c448f",
        erpnextApiSecret: "1b2b919c1580ade",
        saleorUrl: "http://localhost:8000",
        saleorToken: "4xtNglUY26s6lDOptk0oUeT66bqxbt",
        isActive: true
      },
      {
        name: "SwitchToSwag",
        slug: "switchtoswag", 
        description: "E-commerce & Design Studio",
        erpnextUrl: "http://localhost:8080",
        erpnextApiKey: "175aafefd8c448f",
        erpnextApiSecret: "1b2b919c1580ade",
        saleorUrl: "http://localhost:8000",
        saleorToken: "4xtNglUY26s6lDOptk0oUeT66bqxbt",
        isActive: true
      },
      {
        name: "StrongTermStrategy",
        slug: "strongtermstrategy",
        description: "Procurement & Manufacturing",
        erpnextUrl: "http://localhost:8080",
        erpnextApiKey: "175aafefd8c448f",
        erpnextApiSecret: "1b2b919c1580ade",
        saleorUrl: "http://localhost:8000",
        saleorToken: "4xtNglUY26s6lDOptk0oUeT66bqxbt",
        isActive: true
      }
    ];

    await db.insert(tenants).values(defaultTenants);
    console.log("✅ Default tenants created");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Database seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Database seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };
