import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { practitionerId } = await req.json();

    const practitioner = await prisma.practitioner.findUnique({
      where: { id: practitionerId },
    });

    if (!practitioner) {
      return NextResponse.json({ error: "Praticien introuvable." }, { status: 404 });
    }

    // Create or retrieve Stripe customer
    let customerId = practitioner.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: practitioner.email,
        name: `${practitioner.firstName} ${practitioner.lastName}`,
        metadata: { practitionerId: practitioner.id },
      });
      customerId = customer.id;
      await prisma.practitioner.update({
        where: { id: practitioner.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/inscription?canceled=true`,
      metadata: { practitionerId: practitioner.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur Stripe." }, { status: 500 });
  }
}
