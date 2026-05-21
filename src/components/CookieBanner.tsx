import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("sca-cookie-consent");

    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("sca-cookie-consent", "accepted");

    window.gtag?.("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });

    window.dataLayer?.push({
      event: "analytics_consent_granted",
    });

    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("sca-cookie-consent", "rejected");

    window.gtag?.("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <p>Surf Contest Atlas uses analytics cookies to understand site usage.</p>

      <div className="cookie-banner__actions">
        <button onClick={accept}>Accept</button>
        <button onClick={reject}>Reject</button>
      </div>
    </div>
  );
}
