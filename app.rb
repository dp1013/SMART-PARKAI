require 'sinatra'
require 'json'
require_relative 'config/stripe_config'
require_relative 'examples/stripe_example'

# Enable CORS
before do
  content_type :json
  headers 'Access-Control-Allow-Origin' => '*',
          'Access-Control-Allow-Methods' => ['OPTIONS', 'GET', 'POST']
end

options "*" do
  response.headers["Allow"] = "HEAD,GET,PUT,POST,DELETE,OPTIONS"
  response.headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Cache-Control, Accept"
  200
end

# Create a payment intent
post '/create-payment-intent' do
  data = JSON.parse(request.body.read)
  amount = data['amount']
  currency = data['currency'] || 'usd'
  
  begin
    payment_intent = create_payment_intent(amount, currency)
    { clientSecret: payment_intent.client_secret }.to_json
  rescue Stripe::StripeError => e
    status 400
    { error: e.message }.to_json
  end
end

# Create a customer
post '/create-customer' do
  data = JSON.parse(request.body.read)
  email = data['email']
  payment_method_id = data['paymentMethodId']
  
  begin
    customer = create_customer(email, payment_method_id)
    customer.to_json
  rescue Stripe::StripeError => e
    status 400
    { error: e.message }.to_json
  end
end

# Create a subscription
post '/create-subscription' do
  data = JSON.parse(request.body.read)
  customer_id = data['customerId']
  price_id = data['priceId']
  
  begin
    subscription = create_subscription(customer_id, price_id)
    subscription.to_json
  rescue Stripe::StripeError => e
    status 400
    { error: e.message }.to_json
  end
end

# Handle webhook
post '/webhook' do
  payload = request.body.read
  sig_header = request.env['HTTP_STRIPE_SIGNATURE']

  begin
    result = handle_webhook_event(payload, sig_header)
    status result[:status]
    return { received: true }.to_json
  rescue => e
    status 400
    return { error: e.message }.to_json
  end
end

# Get publishable key
get '/config' do
  { publishableKey: ENV['STRIPE_PUBLISHABLE_KEY'] }.to_json
end 