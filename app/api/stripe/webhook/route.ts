import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook signature invalide." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const practitionerId = session.metadata?.practitionerId;
      if (practitionerId) {
        await prisma.practitioner.update({
          where: { id: practitionerId },
          data: {
            stripeSubId: session.subscription,
            subscriptionStatus: "active",
          },
        });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as any;
      const customerId = invoice.customer;
      await prisma.practitioner.updateMany({
        where: { stripeCustomerId: customerId },
        data: { subscriptionStatus: "active" },
      });
      break;
    }

    case "invoice.payment_failed":
    case "customer.subscription.deleted": {
      const obj = event.data.object as any;
      const customerId = obj.customer;
      await prisma.practitioner.updateMany({
        where: { stripeCustomerId: customerId },
        data: { subscriptionStatus: "inactive" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
