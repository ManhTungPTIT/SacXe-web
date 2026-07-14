import AdminRevenueComponent from "../../components/revenue/AdminRevenueComponent";
import SuperadminRevenueComponent from "../../components/revenue/SuperadminRevenueComponent";

const RevenuePage = () => {
  const rawUser =
    localStorage.getItem("user") || localStorage.getItem("auth_user");

  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    user = null;
  }

  if (user?.role === "superadmin") {
    return <SuperadminRevenueComponent />;
  }

  return <AdminRevenueComponent />;
};

export default RevenuePage;
