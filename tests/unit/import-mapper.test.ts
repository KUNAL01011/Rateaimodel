import { describe, it, expect } from "vitest";
import { mapRowToToolPayload } from "@/services/import.service";

describe("import mapper — mapRowToToolPayload", () => {
  const base = {
    Slug: "gpt-4o",
    Name: "GPT-4o",
    "Short Description": "OpenAI flagship multimodal model",
    "Tool Type": "llm",
    Provider: "OpenAI",
    "Pricing Type": "paid",
  };

  it("maps a well-formed row with no errors", () => {
    const { payload, providerName, errors } = mapRowToToolPayload(base);
    expect(errors).toHaveLength(0);
    expect(providerName).toBe("OpenAI");
    expect(payload.slug).toBe("gpt-4o");
    expect(payload.name).toBe("GPT-4o");
    expect(payload.toolType).toBe("llm_model");
    expect(payload.pricingType).toBe("subscription");
  });

  it("maps tool-type and pricing aliases", () => {
    expect(mapRowToToolPayload({ ...base, "Tool Type": "image" }).payload.toolType).toBe("image_model");
    expect(mapRowToToolPayload({ ...base, "Tool Type": "agent" }).payload.toolType).toBe("agent_framework");
    expect(mapRowToToolPayload({ ...base, "Pricing Type": "free" }).payload.pricingType).toBe("free");
    expect(mapRowToToolPayload({ ...base, "Pricing Type": "Open Source Free" }).payload.pricingType).toBe("open_source_free");
  });

  it("coerces Yes/No capability flags to booleans", () => {
    const { payload } = mapRowToToolPayload({
      ...base,
      "Has API": "Yes",
      "Open Source": "No",
      "Function Calling": "yes",
    });
    expect(payload.hasApi).toBe(true);
    expect(payload.isOpenSource).toBe(false);
    expect(payload.supportsFunctionCalling).toBe(true);
  });

  it("converts context window from K tokens to tokens", () => {
    const { payload } = mapRowToToolPayload({ ...base, "Context Window (K tokens)": "128" });
    expect(payload.contextWindowTokens).toBe(128000);
  });

  it("merges input/output modalities and maps use cases", () => {
    const { payload } = mapRowToToolPayload({
      ...base,
      "Modalities (Input)": "Text, Image",
      "Modalities (Output)": "Text",
      "Use Cases": "Coding, Writing",
    });
    const mods = payload.modalities.map((m: any) => m.modality);
    expect(mods).toContain("text");
    expect(mods).toContain("image");
    const text = payload.modalities.find((m: any) => m.modality === "text");
    expect(text.isInput).toBe(true);
    expect(text.isOutput).toBe(true);
    const useCases = payload.useCaseCoverage.map((u: any) => u.useCase);
    expect(useCases).toContain("coding_general");
    expect(useCases).toContain("long_form_writing");
  });

  it("parses loose dates to ISO strings", () => {
    const { payload } = mapRowToToolPayload({ ...base, "Training Cutoff": "2024-04" });
    expect(payload.trainingDataCutoff).toMatch(/^2024-04-01T/);
  });

  it("reports errors for missing required fields and unknown enums", () => {
    const { errors } = mapRowToToolPayload({ Name: "", "Tool Type": "spaceship", "Pricing Type": "" });
    expect(errors.join(" ")).toMatch(/Missing Name/);
    expect(errors.join(" ")).toMatch(/Unknown Tool Type/);
    expect(errors.join(" ")).toMatch(/Unknown Pricing Type/);
  });

  it("falls back to a slug derived from the name", () => {
    const { payload } = mapRowToToolPayload({ ...base, Slug: "", Name: "Claude 3.5 Sonnet" });
    expect(payload.slug).toBe("claude-3-5-sonnet");
  });
});
