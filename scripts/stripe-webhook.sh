#!/bin/bash

# Stripe Webhook Listener for local development
# Requires Stripe CLI: https://stripe.com/docs/stripe-cli

echo "Starting Stripe webhook listener..."
echo "Forwarding to: http://localhost:3000/api/stripe/webhook"
echo ""
echo "Make sure you have the Stripe CLI installed and logged in:"
echo "  stripe login"
echo ""

stripe listen \
  --forward-to http://localhost:3000/api/stripe/webhook \
  --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted
