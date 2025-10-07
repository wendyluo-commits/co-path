import { z } from 'zod';

// 请求 Schema
export const ReadingRequestSchema = z.object({
  question: z.string().min(1, "问题不能为空").max(500, "问题太长"),
  spread: z.enum(["single", "situation-action-outcome", "five-card"]),
  seed: z.number().optional(),
  lang: z.enum(["zh", "en"]).default("zh"),
  tone: z.enum(["gentle", "direct"]).default("gentle"),
  // 支持预选的牌（从抽牌页面传来）
  cards: z.array(z.object({
    name: z.string(),
    suit: z.string(),
    number: z.number(),
    orientation: z.enum(["upright", "reversed"]),
    position: z.string(),
    keywords: z.array(z.string()).optional()
  })).optional()
});

// 卡牌 Schema
export const CardSchema = z.object({
  name: z.string(),
  suit: z.enum(["Major", "Cups", "Wands", "Swords", "Pentacles"]),
  number: z.number().int().min(0).max(21),
  position: z.string().optional(),
  orientation: z.enum(["upright", "reversed"]),
  keywords: z.array(z.string()),
  interpretation: z.string().min(40, "解释内容太短"),
  advice: z.string().min(30, "建议内容太短")
});

// 塔罗解读结果 Schema
export const TarotReadingSchema = z.object({
  spread: z.enum(["single", "situation-action-outcome", "five-card"]),
  question: z.string(),
  cards: z.array(CardSchema).min(1, "至少需要一张牌"),
  overall: z.string().min(60, "整体总结太短"),
  action_steps: z.array(z.string()).min(3, "至少需要3个行动步骤").max(6, "行动步骤不能超过6个"),
  safety_note: z.string(),
  tone: z.enum(["gentle", "direct"])
});

// 混合格式的解读结果 Schema - 保留原有卡牌结构，添加新的解读内容
export const MixedTarotReadingSchema = z.object({
  // 保留原有的基础字段
  spread: z.enum(["single", "situation-action-outcome", "five-card"]),
  question: z.string(),
  tone: z.enum(["gentle", "direct"]),
  
  // 保留原有的卡牌结构（用于图片显示）
  cards: z.array(CardSchema).min(1, "至少需要一张牌"),
  
  // 添加新的解读内容结构
  readingResultsTitle: z.string(),
  readingResults: z.array(z.object({
    heading: z.string(),
    body: z.string(),
    bodyFull: z.string().nullable(),
    truncated: z.boolean(),
    tip: z.string()
  })),
  separatorDecorations: z.array(z.object({
    type: z.string(),
    positionAfterSection: z.number()
  })),
  keyMessages: z.object({
    label: z.string(),
    decorationImageUrl: z.string().nullable(),
    title: z.string(),
    body: z.string(),
    bodyFull: z.string().nullable(),
    truncated: z.boolean()
  }),
  button: z.object({
    text: z.string(),
    action: z.string(),
    styleHint: z.enum(["primary", "dark", "contrast"])
  }),
  layoutHints: z.object({
    maxBodyLines: z.number(),
    cardCount: z.number(),
    decorations: z.array(z.object({
      type: z.string(),
      xPct: z.number(),
      yPct: z.number(),
      opacity: z.number().nullable()
    }))
  }),
  
  // 保留原有的其他字段
  overall: z.string().min(60, "整体总结太短"),
  action_steps: z.array(z.string()).min(3, "至少需要3个行动步骤").max(6, "行动步骤不能超过6个"),
  safety_note: z.string()
});

// OpenAI Structured Outputs 的 JSON Schema - 混合格式
export const TarotReadingJSONSchema = {
  type: "object",
  properties: {
    spread: { type: "string", enum: ["single", "situation-action-outcome", "five-card"] },
    question: { type: "string" },
    tone: { type: "string", enum: ["gentle", "direct"] },
    cards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          suit: { type: "string", enum: ["Major", "Cups", "Wands", "Swords", "Pentacles"] },
          number: { type: "integer", minimum: 0, maximum: 21 },
          position: { type: "string" },
          orientation: { type: "string", enum: ["upright", "reversed"] },
          keywords: { type: "array", items: { type: "string" } },
          interpretation: { type: "string", minLength: 40 },
          advice: { type: "string", minLength: 30 }
        },
        required: ["name", "suit", "number", "position", "orientation", "keywords", "interpretation", "advice"],
        additionalProperties: false
      },
      minItems: 1
    },
    readingResultsTitle: { type: "string" },
    readingResults: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          body: { type: "string" },
          bodyFull: { type: ["string", "null"] },
          truncated: { type: "boolean" },
          tip: { type: "string" }
        },
        required: ["heading", "body", "bodyFull", "truncated", "tip"],
        additionalProperties: false
      }
    },
    separatorDecorations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          positionAfterSection: { type: "number" }
        },
        required: ["type", "positionAfterSection"],
        additionalProperties: false
      }
    },
    keyMessages: {
      type: "object",
      properties: {
        label: { type: "string" },
        decorationImageUrl: { type: ["string", "null"] },
        title: { type: "string" },
        body: { type: "string" },
        bodyFull: { type: ["string", "null"] },
        truncated: { type: "boolean" }
      },
      required: ["label", "decorationImageUrl", "title", "body", "bodyFull", "truncated"],
      additionalProperties: false
    },
    button: {
      type: "object",
      properties: {
        text: { type: "string" },
        action: { type: "string" },
        styleHint: { type: "string", enum: ["primary", "dark", "contrast"] }
      },
      required: ["text", "action", "styleHint"],
      additionalProperties: false
    },
    layoutHints: {
      type: "object",
      properties: {
        maxBodyLines: { type: "number" },
        cardCount: { type: "number" },
        decorations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              xPct: { type: "number" },
              yPct: { type: "number" },
              opacity: { type: ["number", "null"] }
            },
            required: ["type", "xPct", "yPct", "opacity"],
            additionalProperties: false
          }
        }
      },
      required: ["maxBodyLines", "cardCount", "decorations"],
      additionalProperties: false
    },
    overall: { type: "string", minLength: 60 },
    action_steps: { 
      type: "array", 
      items: { type: "string" }, 
      minItems: 3, 
      maxItems: 6 
    },
    safety_note: { type: "string" }
  },
  required: ["spread", "question", "tone", "cards", "readingResultsTitle", "readingResults", "separatorDecorations", "keyMessages", "button", "layoutHints", "overall", "action_steps", "safety_note"],
  additionalProperties: false
} as const;

// 类型导出
export type ReadingRequest = z.infer<typeof ReadingRequestSchema>;
export type TarotCard = z.infer<typeof CardSchema>;
export type TarotReading = z.infer<typeof TarotReadingSchema>;
export type MixedTarotReading = z.infer<typeof MixedTarotReadingSchema>;

// 牌阵位置定义
export const SPREAD_POSITIONS = {
  single: ["当前状况"],
  "situation-action-outcome": ["现状/瓶颈", "行动/策略", "结果/走向"],
  "five-card": ["过去", "现在", "未来", "建议", "结果"]
} as const;

export type SpreadType = keyof typeof SPREAD_POSITIONS;
