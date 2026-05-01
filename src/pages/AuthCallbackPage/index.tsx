import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession } from "aws-amplify/auth";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const finishLogin = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const session = await fetchAuthSession();

        if (session.tokens?.accessToken) {
          navigate("/upload", { replace: true });
          return;
        }

        navigate("/login", { replace: true });
      } catch (error) {
        console.error(error);
        navigate("/login", { replace: true });
      }
    };

    void finishLogin();
  }, [navigate]);

  return <p style={{ padding: "2rem" }}>Signing you in...</p>;
}