import { Resend } from 'resend';
import { config } from '../../config/env.js';

// Initialize Resend only if the API key is present
const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;

/**
 * Sends an automated email notification using Resend.
 * @async
 * @function sendEmailNotification
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} htmlContent - The HTML body of the email.
 */
export const sendEmailNotification = async (to, subject, htmlContent) => {
    if (!resend) {
        console.warn(' RESEND_API_KEY missing. Mocking email send to:', to);
        return;
    }

    try {
        await resend.emails.send({
            from: 'FeatureFlow Notifications <onboarding@resend.dev>',
            to,
            subject,
            html: htmlContent
        });
        console.log(` Automated email sent to ${to}`);
    } catch (error) {
        console.error(' Failed to send email:', error.message);
    }
};