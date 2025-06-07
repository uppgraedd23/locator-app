import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  console.log("request----->>>>",request);
  const { payload } = await authenticate.webhook(request);

  // payload: https://shopify.dev/docs/api/admin-rest/2023-10/resources/location#[object]
  // Пример: { id, name, address1, ... }

  console.log("payload----->>>>",payload);

  if (!payload || !payload.name || !payload.id) {
    return new Response("Invalid payload", { status: 400 });
  }

  // Пример: url можно формировать как `/admin/locations/{id}` или хранить id
  // await db.store.create({
  //   data: {
  //     name: payload.name,
  //     url: String(payload.id), // или другой уникальный идентификатор, если нужен реальный url
  //   },
  // });

  return new Response();
}; 