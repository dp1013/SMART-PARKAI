require 'bundler/setup'
require_relative 'app'

puts "Starting Stripe API server on http://localhost:4242"
set :port, 4242
set :bind, '0.0.0.0' 