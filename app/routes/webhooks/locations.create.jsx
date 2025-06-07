import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { payload } = await authenticate.webhook(request);

  if (!payload || !payload.name || !payload.id) {
    return new Response("Invalid payload", { status: 400 });
  }

  await db.store.create({
    data: {
      name: payload.name,
      url: String(payload.id),
      address1: payload.address1 || null,
      address2: payload.address2 || null,
      city: payload.city || null,
      zip: payload.zip || null,
      province: payload.province || null,
      country: payload.country || null,
      phone: payload.phone || null,
      country_code: payload.country_code || null,
      country_name: payload.country_name || null,
      active: payload.active,
      legacy: payload.legacy,
      admin_graphql_api_id: payload.admin_graphql_api_id || null,
    },
  });

  return new Response();
}; 