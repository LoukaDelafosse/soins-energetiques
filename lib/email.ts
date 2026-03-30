import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingNotification({
  practitionerEmail,
  practitionerName,
  clientFirstName,
  clientLastName,
  clientPhone,
  serviceName,
  servicePrice,
  dateTime,
  sessionMode,
}: {
  practitionerEmail: string;
  practitionerName: string;
  clientFirstName: string;
  clientLastName: string;
  clientPhone: string;
  serviceName: string;
  servicePrice: number;
  dateTime: Date;
  sessionMode: string;
}) {
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateTime));

  const modeLabel = sessionMode === "DISTANCE" ? "À distance" : "En présentiel";

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "notifications@soins-energetiques.fr",
      to: practitionerEmail,
      subject: `✨ Nouvelle réservation - ${clientFirstName} ${clientLastName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #fffbf5; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #f59e0b; font-size: 28px; margin: 0;">✨ Nouvelle Réservation</h1>
            <p style="color: #78350f; margin-top: 8px;">Bonjour ${practitionerName} !</p>
          </div>

          <div style="background: white; border-radius: 12px; padding: 24px; border-left: 4px solid #f59e0b;">
            <h2 style="color: #1c1917; margin-top: 0;">Détails de la réservation</h2>

            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #fef3c7;">
                <td style="padding: 12px 0; color: #78350f; font-weight: bold;">👤 Client</td>
                <td style="padding: 12px 0; color: #1c1917;">${clientFirstName} ${clientLastName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fef3c7;">
                <td style="padding: 12px 0; color: #78350f; font-weight: bold;">📞 Téléphone</td>
                <td style="padding: 12px 0; color: #1c1917;">${clientPhone}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fef3c7;">
                <td style="padding: 12px 0; color: #78350f; font-weight: bold;">🌟 Soin</td>
                <td style="padding: 12px 0; color: #1c1917;">${serviceName} — ${servicePrice}€</td>
              </tr>
              <tr style="border-bottom: 1px solid #fef3c7;">
                <td style="padding: 12px 0; color: #78350f; font-weight: bold;">📅 Date & Heure</td>
                <td style="padding: 12px 0; color: #1c1917;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #78350f; font-weight: bold;">📍 Mode</td>
                <td style="padding: 12px 0; color: #1c1917;">${modeLabel}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reservations"
               style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Voir dans mon dashboard
            </a>
          </div>

          <p style="text-align: center; color: #78350f; margin-top: 32px; font-size: 14px;">
            Avec amour et lumière ✨
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur envoi email:", error);
  }
}
