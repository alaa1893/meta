import { mutation, query, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const executeCode = action({
  args: {
    code: v.string(),
    preferredLanguage: v.union(v.literal("ar"), v.literal("fr")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      // محاكاة تشغيل كود Python (في التطبيق الحقيقي ستحتاج خدمة تشغيل آمنة)
      const result = await simulatePythonExecution(args.code);
      
      let aiSuggestion = null;
      if (result.error) {
        aiSuggestion = await generateErrorSuggestion(args.code, result.error, args.preferredLanguage);
      }

      await ctx.runMutation(internal.codeRunner.saveExecution, {
        userId,
        code: args.code,
        output: result.output || undefined,
        error: result.error || undefined,
        aiSuggestion: aiSuggestion || undefined,
        preferredLanguage: args.preferredLanguage,
      });

      return {
        output: result.output,
        error: result.error,
        aiSuggestion,
      };
    } catch (error) {
      throw new Error("Failed to execute code");
    }
  },
});

export const saveExecution = internalMutation({
  args: {
    userId: v.id("users"),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
    aiSuggestion: v.optional(v.string()),
    preferredLanguage: v.union(v.literal("ar"), v.literal("fr")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("codeExecutions", {
      userId: args.userId,
      code: args.code,
      language: "python",
      output: args.output,
      error: args.error,
      aiSuggestion: args.aiSuggestion,
      preferredLanguage: args.preferredLanguage,
    });
  },
});

export const getExecutionHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("codeExecutions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const saveCodeSnippet = mutation({
  args: {
    title: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    return await ctx.db.insert("codeSnippets", {
      userId,
      title: args.title,
      code: args.code,
      description: args.description,
      tags: args.tags,
    });
  },
});

export const getCodeSnippets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("codeSnippets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// محاكاة تشغيل Python (في التطبيق الحقيقي تحتاج خدمة آمنة)
async function simulatePythonExecution(code: string) {
  // تحليل بسيط للكود
  if (code.includes("print(")) {
    const printMatch = code.match(/print\((.*?)\)/);
    if (printMatch) {
      try {
        const content = printMatch[1].replace(/['"]/g, "");
        return { output: content, error: null };
      } catch {
        return { output: null, error: "خطأ في تنفيذ الكود" };
      }
    }
  }
  
  if (code.includes("def ")) {
    return { output: "تم تعريف الدالة بنجاح", error: null };
  }
  
  if (code.includes("for ") || code.includes("while ")) {
    return { output: "تم تنفيذ الحلقة بنجاح", error: null };
  }
  
  // محاكاة خطأ شائع
  if (code.includes("pritn")) {
    return { output: null, error: "NameError: name 'pritn' is not defined" };
  }
  
  return { output: "تم تنفيذ الكود بنجاح", error: null };
}

async function generateErrorSuggestion(code: string, error: string, language: "ar" | "fr") {
  const prompt = language === "ar" 
    ? `أنت مساعد برمجة ذكي. الكود التالي يحتوي على خطأ:

الكود:
${code}

الخطأ:
${error}

قدم اقتراحاً لحل هذا الخطأ باللغة العربية بشكل واضح ومفصل.`
    : `Vous êtes un assistant de programmation intelligent. Le code suivant contient une erreur:

Code:
${code}

Erreur:
${error}

Fournissez une suggestion pour résoudre cette erreur en français de manière claire et détaillée.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    return response.choices[0].message.content;
  } catch {
    return language === "ar" 
      ? "عذراً، لا يمكنني تقديم اقتراح في الوقت الحالي"
      : "Désolé, je ne peux pas fournir de suggestion pour le moment";
  }
}

import { internal } from "./_generated/api";
