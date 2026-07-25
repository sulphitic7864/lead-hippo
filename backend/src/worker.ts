import "dotenv/config";

import { claimJob, completeJob, failJob } from "./services/job.service.js";
import {
  fulfillPurchase,
  notifyContact,
} from "./services/fulfillment.service.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log("Lead Hippo worker started");

  while (true) {
    const job = await claimJob();

    if (!job) {
      await sleep(1500);
      continue;
    }

    try {
      const payload = job.payload as any;

      if (job.job_type === "FULFILL_PURCHASE")
        await fulfillPurchase(Number(payload.purchaseId));

      if (job.job_type === "RESEND_REPORT")
        await fulfillPurchase(Number(payload.purchaseId), true);

      if (job.job_type === "CONTACT_NOTIFICATION")
        await notifyContact(Number(payload.contactId));

      await completeJob(job.id);

    } catch (error) {
      console.error("Job failed", job.id, error);
      await failJob(job as any, error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});