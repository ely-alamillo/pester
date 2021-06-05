import Stripe from 'stripe'
import type { NextApiRequest, NextApiResponse } from 'next'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2020-08-27',
})

const packageTiers = {
  basic: 5,
  medium: 10,
  advanced: 20,
  pro: 100
}

type NextApiRequestWithPackage = Omit<NextApiRequest, 'body'> & {
  body: {
    packageTier: keyof typeof packageTiers
  }
}


export default async (req: NextApiRequestWithPackage, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { packageTier } = req.body
    if (!packageTier) return res.status(400).json({ message: 'A "packageTier" must be provided.' })

    const tier = packageTiers[packageTier]
    if (!tier) return res.status(400).json({ message: `packageTier: ${packageTier} is not supported.` })

    try {
      const params: Stripe.Checkout.SessionCreateParams = {
        submit_type: 'pay',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Pester Service',
                images: ['https://i.imgur.com/EHyR2nP.png'],
              },
              unit_amount: 500,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `http://localhost:300/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:300/donate-with-checkout`,
        metadata: {
          packageTier
        }
      }
      const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create(
        params
      )

      res.status(200).json(checkoutSession)

    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err.message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
