import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Dashboard from "./dashboard";

export default async function DashboardPage() {
  return <Dashboard />;
}