# Ceylone Zimt: launch and payments

The redesigned storefront source is in `published-store/dist`; the same storefront is also installed in `frontend` for the existing Express server. Original product photographs remain at the repository root and copies are used on product cards. The hero is generated editorial imagery, not a photograph of the packaged goods. The new SVG logo is inspired by the cinnamon-and-leaf motif on the supplied packaging.

## What ordering does now

Customers select products and quantities, review an itemised enquiry, then open their own email app to send it to **mohammedzakee2006@gmail.com**. There is also a copy button for customers using webmail. Nothing is sent automatically; this is clearly explained on the website. Requests are not stored in an order database. Check the inbox and reply with a quote to arrange each sale. No card data is collected and no payment is taken.

LKR, EUR, USD and PLN remain available. Germany uses EUR. Seller-approved base prices are powder 100 g EUR 7.90, sticks 100 g EUR 8.90, oil 100 mL EUR 13.90, and oil 10 mL LKR 1,390. These are stored in minor units, and cart arithmetic uses rounded displayed unit prices so line items and subtotals agree. Other currencies use the existing fixed reference rates (USD 1, EUR 0.92, PLN 3.98, LKR 300), not live market rates. Shipping, taxes and stock are confirmed by email before sale.

English, Sinhala, Tamil and German are built into the application, including product descriptions, shopping bag, order form, FAQs and policies. No translation service runs on the website. A fluent Sinhala/Tamil reviewer should check commercial copy before paid advertising.

## Recommended payment setup: PayHere

Official documentation: https://support.payhere.lk/api-%26-mobile-sdk/checkout-api

1. Apply for a PayHere merchant account using your actual business details and settlement bank account. Complete their identity/business verification and approval. Account approval, business agreements and bank details must be handled by the owner.
2. Confirm the final product prices, pack sizes, stock, delivery countries, shipping charges, taxes, returns, cancellation rules, business address and customer-service details. Replace the indicative prices with approved prices before enabling instant payment.
3. Register the final public domain with PayHere and create its merchant secret in the merchant dashboard. Use sandbox credentials first. Never put a merchant secret in browser code, a public repository or a chat message.
4. Add a server-side checkout service and durable order database. It must look up trusted product prices on the server, validate quantities and stock, calculate shipping/taxes and save an unpaid order before redirecting to PayHere's hosted payment page. The existing Express/MongoDB backend can be adapted; a static-only Sites deployment cannot execute it.
5. Generate the checkout `hash` on the server using PayHere's documented MD5 formula: uppercase MD5 of merchant_id + order_id + amount formatted to two decimals + currency + uppercase MD5(merchant_secret).
6. Configure HTTPS `return_url`, `cancel_url` and server-accessible `notify_url`. Validate the notification checksum, merchant, order, amount, currency and payment status. Update the order idempotently. Mark an order paid only after a verified success notification, never merely because someone reaches the return page.
7. Run successful, declined, cancelled, repeated-callback and wrong-amount tests in sandbox. Test stock and shipping rules, then switch to live credentials after merchant approval and a controlled real payment/refund test.
8. Add order-confirmation emails, an authenticated order-management screen and a fulfilment process. Do not expose order/customer records through unauthenticated endpoints.

PayHere's documented checkout currencies include LKR, USD, GBP, EUR and AUD. PLN is a storefront display option here; do not submit PLN directly to PayHere. Convert it to an enabled settlement/checkout currency server-side and show the precise charge and currency to the buyer before consent. Confirm the currencies and permitted domestic/international payment handling enabled for your own merchant account with PayHere.

## Existing backend caution

The previous Stripe checkout endpoint trusted client-supplied amounts and did not provide verified payment fulfilment. The redesign no longer links to it, and that endpoint is disabled pending a secure implementation. No merchant keys have been installed. Stripe's supported business countries must be checked for the merchant's actual country; do not assume a Sri Lankan business can open a standard Stripe account. Official list: https://stripe.com/global

## Publishing

The hosted source checkout and Site identity are isolated in `published-store`. No backend `.env` or existing database content is included in that site's source. Static product enquiry functionality is suitable for the current no-merchant-account stage. Public customer access and a live deployment are both needed to share a usable shop URL. A preview failure on this computer does not verify the visual rendering; perform a browser check on the deployed URL when available.


## Vercel deployment

Use the existing `cinnamon-website` project connected to Mohammed-Zakee/Cinnamon-Website, branch `main`. Repository root is `./`; framework preset is Other; build command is `npm run build`; output directory is `frontend`. The root vercel.json declares the build and output. This public storefront is static and requires no environment variables. Do not import the Render backend/container services as a new Vercel project. Existing backend environment variables are not needed by the storefront.

Run `npm run build` and `npm test` before deployment. Native browser QA covers English, Sinhala, Tamil and German at viewport widths 320, 390, 768 and 1440 pixels; no horizontal overflow. The browser order-review check verifies sticks plus powder equals EUR 16.80. Card payments still require the merchant account and secure server integration described above.
