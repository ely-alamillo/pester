// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import twilio from 'twilio'
import type { NextApiRequest, NextApiResponse } from 'next'
import { times } from 'lodash'
import { getRandomJoke } from '../../utils/getRandomJoke';

// const client = require('twilio')(accountSid, authToken, {
//   lazyLoading: true
// });

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
  {
    lazyLoading: true
  }
);

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
  if (req.method !== 'POST') {
    return res.status(500).json({ message: `Method: ${req.method} not supported.` })
    // throw new Error('Method not allowed')
  }

  const { packageTier } = req.body
  if (!packageTier) return res.status(400).json({ message: 'A "packageTier" must be provided.' })

  const tier = packageTiers[packageTier]
  if (!tier) return res.status(400).json({ message: `packageTier: ${packageTier} is not supported.` })

  try {
    const totalMessagesToSend = times(tier, String)

    const results = await Promise.all(
      totalMessagesToSend.map(() => {
        const message = {
          body: getRandomJoke().joke,
          to: '+12064515486',
          from: process.env.TWILIO_PHONE
        }

        client.messages.create(message)
      })

      // results.forEach((result) => console.log(`Success: ${result.sid}`));
    )

    res.status(200).json({ success: true })

  } catch (error) {
    console.log({ error })
    res.status(200).json({ success: false })
  }
}
