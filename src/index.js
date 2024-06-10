import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const app = express()
const PORT = process.env.PORT | 3000
const CLIENT_URL = process.env.CLIENT_DOMAIN
	? process.env.CLIENT_DOMAIN
	: 'http://localhost:5173'

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(
	cors({
		origin: CLIENT_URL,
	})
)

app.use(morgan('tiny'))

app.post('/create-checkout-session', async (req, res) => {
	try {
		const cartItems = req.body

		const params = {
			submit_type: 'pay',
			mode: 'payment',
			payment_method_types: ['card'],
			billing_address_collection: 'auto',
			shipping_options: [
				{ shipping_rate: 'shr_1NaiZECgYKsyfwLUH0ZfNjGD' },
				{ shipping_rate: 'shr_1Naia3CgYKsyfwLUReSFqvwJ' },
			],

			line_items: cartItems.map(item => {
				const newImage = item.img.asset._ref
					.replace('image-', 'http://cdn.sanity.io/images/9254aur0/production/')
					.replace('-jpg', '.jpg')

				console.log(item)
				return {
					price_data: {
						currency: 'usd',
						product_data: {
							name: `${item.name}, (#${item.size})`,
							images: [newImage],
						},
						unit_amount: item.unitPrice * 100,
					},
					quantity: item.qty,
				}
			}),

			success_url: `${CLIENT_URL}`,
			cancel_url: `${CLIENT_URL}`,
		}

		const session = await stripe.checkout.sessions.create(params)

		res.json(session)
	} catch (err) {
		console.log(err)
	}
})

app.listen(PORT, () => console.log(`Running on port: ${PORT}`))
