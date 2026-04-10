import emailjs from '@emailjs/nodejs';
import { emailjsConfig } from "../lib/emailjsConfig.js";
import { createWelcomeEmailTemplate } from "./emailTemplate.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  const finalClientURL = clientURL || "http://localhost:5173";
  console.log("Attempting to send welcome email to:", email);

  try {
    const htmlMessage = createWelcomeEmailTemplate(name, finalClientURL);

    const templateParams = {
      to_email: email,
      email: email,
      to_name: name,
      name: name,
      clientURL: finalClientURL,
      message_html: htmlMessage,
      message: htmlMessage,
    };

    const response = await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      templateParams,
      {
        publicKey: emailjsConfig.publicKey,
        privateKey: emailjsConfig.privateKey,
      }
    );

    console.log("Welcome Email sent successfully via EmailJS", response.status, response.text);
  } catch (err) {
    console.error("Exception in sendWelcomeEmail:", err);
    throw err;
  }
};