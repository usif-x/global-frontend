import Cookies from "js-cookie";
const getAuthHeaders = () => {
  const token = Cookies.get("auth-storage")
    ? JSON.parse(Cookies.get("auth-storage")).state?.token
    : null;

  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

export default getAuthHeaders;
