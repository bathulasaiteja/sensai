import { getUserOnboardingStatus } from "@/actions/user";
import React from "react";

const MainLayout = async ({ children }) => {
  const { isOnboarded } = await getUserOnboardingStatus();

  // If not onboarded, redirect to onboarding page
  // Skip this check if already on the onboarding page
  // if (!isOnboarded && !window.location.pathname.includes("/onboarding")) {
  //   redirect("/onboarding");
  // }

  return <div className="container mx-auto mt-24 mb-20">{children}</div>;
};

export default MainLayout;