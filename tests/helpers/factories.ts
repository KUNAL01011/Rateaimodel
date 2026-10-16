import { User, Tool, Provider } from "@/models";
import { authHelper } from "@/utils";

/** Create a user and return an auth cookie for them. */
export async function makeUser(
  overrides: Record<string, any> = {}
): Promise<{ user: any; cookie: string }> {
  const user = await User.create({
    email: overrides.email ?? `user-${Date.now()}-${Math.random()}@test.com`,
    username: overrides.username ?? `user_${Math.random().toString(36).slice(2, 8)}`,
    role: overrides.role ?? "user",
    emailVerified: true,
    password: overrides.password ?? "password123",
    ...overrides,
  });
  const token = authHelper.signToken(
    { id: String(user._id) },
    process.env.ACCESS_SECRET!
  );
  return { user, cookie: `accessToken=${token}` };
}

export function makeAdmin() {
  return makeUser({ role: "admin", username: "admin", email: "admin@test.com" });
}

export async function makeProvider(name = "OpenAI") {
  return Provider.create({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    isOpenSource: false,
  });
}

export async function makeTool(overrides: Record<string, any> = {}) {
  const name = overrides.name ?? "GPT-4o";
  return Tool.create({
    slug: overrides.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    shortDescription: overrides.shortDescription ?? "A capable model",
    toolType: overrides.toolType ?? "llm_model",
    pricingType: overrides.pricingType ?? "subscription",
    hasApi: overrides.hasApi ?? true,
    isOpenSource: overrides.isOpenSource ?? false,
    useCaseCoverage: overrides.useCaseCoverage ?? [
      { useCase: "coding_general", confidence: 4 },
    ],
    isFeatured: overrides.isFeatured ?? false,
    ...overrides,
  });
}
