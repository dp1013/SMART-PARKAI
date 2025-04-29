import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Stripe Configuration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
app.post('/api/payment/initialize', async (req, res) => {
    try {
        const { amount, currency = 'USD', orderId, description } = req.body;

        if (!amount || !orderId) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['amount', 'orderId']
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata: {
                orderId,
                description
            }
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Payment initialization error:', error);
        res.status(500).json({
            error: 'Failed to initialize payment',
            message: error.message
        });
    }
});

// Get payment details
app.get('/api/payment/details/:paymentIntentId', async (req, res) => {
    try {
        const { paymentIntentId } = req.params;
        
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        res.json({
            success: true,
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            metadata: paymentIntent.metadata
        });

    } catch (error) {
        console.error('Payment details error:', error);
        res.status(500).json({
            error: 'Failed to get payment details',
            message: error.message
        });
    }
});

// Stripe webhook handler
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('PaymentIntent succeeded:', paymentIntent.id);
                // Handle successful payment
                break;
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('Payment failed:', failedPayment.id);
                // Handle failed payment
                break;
        }

        res.json({received: true});
    } catch (err) {
        console.error('Webhook handler failed:', err.message);
        res.status(500).send(`Webhook Error: ${err.message}`);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`
Stripe Payment Gateway API Endpoints:
- Initialize Payment: POST http://localhost:${PORT}/api/payment/initialize
- Get Payment Details: GET http://localhost:${PORT}/api/payment/details/:paymentIntentId
- Webhook Handler: POST http://localhost:${PORT}/webhook
    `);
}); 