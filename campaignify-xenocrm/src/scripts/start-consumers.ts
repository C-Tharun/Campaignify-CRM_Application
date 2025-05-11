import { startCustomerConsumer, startOrderConsumer } from "../lib/redis.js";

async function main() {
  console.log("Starting Redis consumers...");

  // Start customer consumer
  startCustomerConsumer().catch((error) => {
    console.error("Customer consumer error:", error);
  });

  // Start order consumer
  startOrderConsumer().catch((error) => {
    console.error("Order consumer error:", error);
  });

  console.log("Redis consumers started successfully");
}

main().catch((error) => {
  console.error("Failed to start consumers:", error);
  process.exit(1);
}); 