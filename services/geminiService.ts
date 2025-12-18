
import { GoogleGenAI, Type } from "@google/genai";
import { CryptoTrendData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const fetchTrendingCrypto = async (): Promise<{ data: CryptoTrendData[], sources: any[] }> => {
  const prompt = `你是一个顶级加密货币猎手，专门挖掘那些在 15 分钟级别走出 15 根以上（持续约 4 小时以上）独立阳线、且完全脱离 BTC 走势的强势 Alpha 币种。

  **极其严格的选币准则：**
  1. **禁止跟随者**：绝对排除跟随 BTC 波动的币种。只有在 15 分钟级别展示出了极强的、连续 15 根 K 线以上背离走势的币种才能入选。
  2. **中短期独立趋势定义**：
     - 在最近 4-8 小时内，该币种在 15M 级别必须呈现出清晰的“价格逐步抬升 + 成交额持续放大”的趋势。
     - 必须对比 BTC 的走势：当 BTC 横盘、阴跌或剧烈波动时，该币种必须表现为稳步上升或强势放量横盘。
  3. **排除新币**：严禁选择上线不足 3 天的币种。
  4. **高换手/高活力**：换手率 (24h成交额/市值) 必须 > 40%。

  **特别要求：** 
  所有输出内容必须全部使用中文。

  请以 JSON 格式输出 3-6 个符合条件的币种：
  - symbol, name, price, marketCap, volume24h, volMcapRatio, volChange1d
  - category: "hotspot" 或 "mature"
  - newsSummary: 驱动逻辑（中文）
  - leaderReason: 15M 独立背离证据（中文）
  - trendAnalysis: 对比 BTC 的微观差异描述（中文）
  - vitalityScore: 活力分 (0-100)
  - isLeader: 是否为当前全场最强 Alpha`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              symbol: { type: Type.STRING },
              name: { type: Type.STRING },
              price: { type: Type.STRING },
              marketCap: { type: Type.STRING },
              volume24h: { type: Type.STRING },
              volMcapRatio: { type: Type.NUMBER },
              volChange1d: { type: Type.NUMBER },
              category: { type: Type.STRING, enum: ['hotspot', 'mature'] },
              newsSummary: { type: Type.STRING },
              isLeader: { type: Type.BOOLEAN },
              leaderReason: { type: Type.STRING },
              trendAnalysis: { type: Type.STRING },
              vitalityScore: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    const data: CryptoTrendData[] = JSON.parse(response.text);
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((s: any) => ({
      title: s.web?.title || '研报',
      uri: s.web?.uri || '#'
    })) || [];

    return { data, sources };
  } catch (error) {
    console.error(error);
    throw new Error("实时 Alpha 穿透分析失败。");
  }
};
