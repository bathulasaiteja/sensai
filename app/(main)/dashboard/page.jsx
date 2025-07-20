import { getIndustryInsights } from "@/actions/dashboard";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import DashboardView from "./_components/dashboard-view";

const IndustryInsightsPage = async () => {
  try {
    const { isOnboarded } = await getUserOnboardingStatus();

    if (!isOnboarded) {
      redirect("/onboarding");
    }

    const insights = await getIndustryInsights();

    return (
      <div className="container mx-auto">
        <DashboardView insights={insights} />
      </div>
    );
  } catch (error) {
    console.error("Error loading dashboard:", error.message);
    redirect("/login"); // Optional: show login or error page
  }
};

export default IndustryInsightsPage;
