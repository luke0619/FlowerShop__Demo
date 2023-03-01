/* eslint-disable */
import axios from 'axios';
// import { showAlert } from './alerts';


export const bookProduct = async (productId) => {
    const stripe = Stripe('pk_test_51MQgh7JUKVZM0pf8MDCXZpvIn3Z8z3bGpOBqEvdwlr9FyBrhkvb4bq3CUJ7MGLEZGxl0RpMNy45ycLjNlUMtYEat00xlESVytr');

    try {
        //  1) Get checkout session from API
        const session = await axios(`/api/v1/bookings/checkout-session/${productId}`);

        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

    } catch (err) {
        console.log(err);
        // showAlert('error', err);
    }
};