# frozen_string_literal: true

source 'https://rubygems.org'

# --- Core Backend ---
gem 'bootsnap', require: false
gem 'pg', '~> 1.1'
gem 'puma', '>= 5.0'
gem 'rails', '~> 8.0.4'

# --- Rails 8 Solid Stack (No Redis needed!) ---
# These gems allow storing cache, queues, and sockets directly in Postgres.
# Perfect for starting - no need to spin up Redis.
gem 'solid_cable'
gem 'solid_cache'
gem 'solid_queue'

# --- Performance & Deploy ---
# Kamal - for Docker deployment
gem 'kamal', require: false

# Thruster - Go-proxy in front of Puma.
# Optional but recommended: it accelerates static asset delivery (JS/CSS bundles from Vite)
# and compresses responses (Gzip/Brotli), making the container self-sufficient without Nginx.
gem 'thruster', require: false

# --- Core Frontend Stack ---
# Bridge for React components instead of Rails views
gem 'inertia_rails'
# Integration of Vite (bundler) with Rails
gem 'vite_rails'

# --- Utils ---
# Timezone data (needed for Windows/Docker,
# often optional on Mac/Linux, but better to keep)
gem 'tzinfo-data', platforms: %i[windows jruby]

group :development, :test do
  # Advanced debugging console (better than puts)
  gem 'brakeman', require: false # Vulnerability scanner
  gem 'debug', platforms: %i[mri windows], require: 'debug/prelude'

  # --- Testing Stack (RSpec) ---
  gem 'factory_bot_rails' # Data factories
  gem 'faker'             # Fake data generation
  gem 'rspec-rails'       # The de facto standard for tests

  # Linters (Optional: we will configure them in detail later)
  gem 'rubocop-performance', require: false
  gem 'rubocop-rails', require: false
  gem 'rubocop-rspec', require: false

  # Console for enthusiasts (optional)
  gem 'pry'
end

group :development do
  gem 'annotate' # DB schema documentation in models
  gem 'web-console' # Interactive console in the browser
end

group :test do
  gem 'simplecov', require: false # Code coverage
end
