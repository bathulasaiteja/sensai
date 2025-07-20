"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data){
    const { userId } = await auth();
    if(!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where:{
            clerkUserId: userId,
        },
    });
    if(!user) throw new Error("User not Found");

    try {
      const result = await db.$transaction(
        async(tx) => {
            //find if the industry exists

            let industryInsight = await tx.industryInsight.findUnique({
                where:{
                    industry: data.industry,
                },
            });
            //if industry doesn't exist, create it with default values - will replace it with ai later
            if(!industryInsight){
                const insights = await generateAIInsights(data.industry);
                
                         industryInsight = await db.industryInsight.create({
                                data:{
                                    industry: data.industry,
                                    ...insights,
                                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                
                                },
                
                            });
        }
            //update the user 
            const updatedUser = await tx.user.update({
                where:{
                    id: user.id,
                },
                data:{
                    industry: data.industry,
                    experience: data.experience,
                    bio: data.bio,
                    skills: data.skills,
                },
            });

            return { updatedUser, industryInsight};


        }, 
         {
            timeout: 10000,//default: 5000
        }
    );

    return { success:true, ...result};
    } catch (error) {
        console.error("Enter updating user and industry:", error.message);
        throw new Error(`Failed to update profile: ${error?.message || JSON.stringify(error)}`);
    }
}



export async function getUserOnboardingStatus() {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.warn("User is not authenticated");
      return { isOnboarded: false };
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    if (!user) {
      console.warn(`No user found in DB for Clerk ID: ${userId}`);
      return { isOnboarded: false };
    }

    return {
      isOnboarded: !!user.industry,
    };

  } catch (error) {
    console.error("Error in getUserOnboardingStatus():", error);
    return { isOnboarded: false };
  }
}
