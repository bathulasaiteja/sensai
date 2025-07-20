"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { redirect } from "next/navigation";

// Initialize Gemini model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Generate AI-powered insights for a given industry
export const generateAIInsights = async (industry) => {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format:

    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "HIGH" | "MEDIUM" | "LOW",
      "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
      "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
      "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
    }

    IMPORTANT: Return ONLY the JSON. Do not include any notes, comments, markdown, or extra text. JSON should be valid.
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Remove code fences in case the response is wrapped in ```
const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanedText);
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Attempt to find user, including linked industryInsight
  let user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include: {
      industryInsight: true,
    },
  });

  // ✅ Auto-create user if not found
  if (!user) {
    console.warn(`No user found for Clerk ID: ${userId}. Creating user.`);
    user = await db.user.create({
      data: {
        clerkUserId: userId,
      },
      include: {
        industryInsight: true,
      },
    });
  }

  // 🚦 Redirect to onboarding if industry is missing (user not onboarded)
  if (!user.industry) {
    redirect("/onboarding");
  }

  // 🔍 Generate and save insight if missing
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user: { connect: { id: user.id } },
      },
    });

    return industryInsight;
  }

  // ✅ Already has insights — return them
  return user.industryInsight;
}
