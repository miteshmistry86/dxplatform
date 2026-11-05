import "server-only";
import { getDb, schema } from "@dx/db";

export async function audit(
  actorUserId: string,
  action: string,
  entity: string,
  entityId?: string,
  data?: Record<string, unknown>,
) {
  await getDb().insert(schema.auditLog).values({ actorUserId, action, entity, entityId, data });
}
