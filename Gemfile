source "https://rubygems.org"

# --- Core Backend ---
gem "rails", "~> 8.0.4"
gem "pg", "~> 1.1"
gem "puma", ">= 5.0"
gem "bootsnap", require: false

# --- Rails 8 Solid Stack (No Redis needed!) ---
# Эти гемы позволяют хранить кэш, очереди и сокеты прямо в Postgres.
# Это идеально для старта - не нужно поднимать Redis.
gem "solid_cache"
gem "solid_queue"
gem "solid_cable"

# --- Performance & Deploy ---
# Kamal - для деплоя в Docker
gem "kamal", require: false

# Thruster - Go-прокси перед Puma.
# Опционально, но рекомендуется: он ускоряет отдачу статики (JS/CSS бандлов от Vite)
# и сжимает ответы (Gzip/Brotli), делая контейнер самодостаточным без Nginx.
gem "thruster", require: false

# --- Core Frontend Stack ---
# Мост для React-компонентов вместо Rails-вьюх
gem "inertia_rails"
# Интеграция Vite (сборщик) с Rails
gem "vite_rails"

# --- Utils ---
# Данные о часовых поясах (нужен для Windows/Docker,
# на Mac/Linux часто опционален, но лучше оставить)
gem "tzinfo-data", platforms: %i[ windows jruby ]

group :development, :test do
  # Продвинутая консоль дебаггинга (лучше чем puts)
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
  gem "brakeman", require: false # Сканер уязвимостей

  # --- Testing Stack (RSpec) ---
  gem "rspec-rails"       # Стандарт де-факто для тестов
  gem "factory_bot_rails" # Фабрики данных
  gem "faker"             # Генерация фейковых данных

  # Линтеры (Опционально: мы будем настраивать их детально позже)
  gem "rubocop-rails", require: false
  gem "rubocop-rspec", require: false
  gem "rubocop-performance", require: false

  # Консоль для любителей (опционально)
  gem "pry"
end

group :development do
  gem "web-console" # Интерактивная консоль в браузере
  gem "annotate" # Документация схемы БД в моделях
end

group :test do
  gem "simplecov", require: false # Покрытие кода
end
