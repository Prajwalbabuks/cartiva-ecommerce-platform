
const sendEmail = async ({ to, subject, html }) => {
    try {
        const response = await fetch(
            process.env.GOOGLE_APPS_SCRIPT_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    secret: process.env.GOOGLE_APPS_SCRIPT_SECRET,
                    to,
                    subject,
                    html,
                }),
                redirect: "follow",
            }
        );

        const responseText = await response.text();

        console.log("Email API status:", response.status);
        console.log("Email API content type:", response.headers.get("content-type"));
        console.log("Email API response:", responseText.slice(0, 1000));

        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            throw new Error(
                `Google Apps Script returned non-JSON response. Status: ${response.status}. Check Render logs.`
            );
        }

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Email delivery failed");
        }

        console.log("Cartiva email sent successfully:", to);

        return result;
    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw error;
    }
};

module.exports = sendEmail;
