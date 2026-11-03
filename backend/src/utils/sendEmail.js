
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
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Email delivery failed"
            );
        }

        console.log("Cartiva email sent successfully:", to);

        return result;
    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw error;
    }
};

module.exports = sendEmail;
