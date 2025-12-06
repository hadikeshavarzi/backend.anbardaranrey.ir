import type { Endpoint } from "payload";

export const InventoryEndpoints: Endpoint[] = [
  {
    path: "/inventory/stock/:productId",     // ← ← ← FIX صحیح
    method: "get",
    handler: async (req) => {
      const payload = req.payload;

      const productId = req.routeParams?.productId as string | undefined;
      const ownerIdParam = req.query?.owner as string | undefined;

      if (!productId) {
        return Response.json(
          { message: "productId الزامی است" },
          { status: 400 }
        );
      }

      const product = parseInt(productId, 10);
      const where: any = { product: { equals: product } };

      if (ownerIdParam) {
        where.owner = { equals: parseInt(ownerIdParam, 10) };
      }

      const stockRes = await payload.find({
        collection: "inventorystock",
        where,
        limit: 1,
      });

      const stock = stockRes.docs[0];

      return Response.json(
        {
          product,
          owner: ownerIdParam ? parseInt(ownerIdParam, 10) : null,
          qtyOnHand: stock?.qtyOnHand ?? 0,
          weightOnHand: stock?.weightOnHand ?? 0,
          qtyIn: stock?.qtyIn ?? 0,
          qtyOut: stock?.qtyOut ?? 0,
          weightIn: stock?.weightIn ?? 0,
          weightOut: stock?.weightOut ?? 0,
        },
        { status: 200 }
      );
    },
  },
];
