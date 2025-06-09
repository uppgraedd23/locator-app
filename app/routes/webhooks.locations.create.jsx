import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {

  const { payload } = await authenticate.webhook(request);

  console.log("payload----->>>>",payload);

  if (!payload || !payload.name || !payload.id) {
    return new Response("Invalid payload", { status: 400 });
  }


  return new Response();
}; 