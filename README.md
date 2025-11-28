***

## Часть 1: Фундамент (Rails 8 Core)

Любой масштабируемый проект начинается с чистого листа. Мы не будем тащить за собой "магию",
которую не планируем использовать. В этой части мы создадим ядро приложения, идеально подготовленное 
для современного SPA на React.

### 1. Технический чек-лист
Перед стартом убедитесь, что ваше окружение готово к работе:
*   **Ruby:** 3.4.0+
*   **Rails:** 8.0.0+
*   **Node.js:** 22.x (LTS)
*   **PostgreSQL:** 16+ (для полноценной работы Solid Stack)

### 2. Генерация проекта
Мы создаем приложение с ювелирной точностью, отключая инструменты, задачи которых возложим на React и Vite.

Выполните команды:

```bash

mkdir your_project_name | cd your_project_name

rails new . \
  -d postgresql \
  --skip-jbuilder \
  --skip-test \
  --skip-system-test \
  --skip-hotwire \
  --skip-asset-pipeline \
  --skip-javascript

```

#### Разбор аргументов (Почему именно так?)
Мы готовим почву для **Inertia.js** и **Vite**, поэтому убираем все лишнее.

Пояснения аргументов:
*   `-d postgresql`: Сразу используем Postgres. Потому что, например, Rails 8 умеет хранить очереди и кэш 
    прямо в SQL (Solid Stack), и PG справляется с этим лучше SQLite в продакшене. Но имейте в виду, БД и кэш на вше 
    усмотрение.
*   `--skip-asset-pipeline`: Мы полностью отказываемся от Sprockets и Propshaft. Вся статика (JS, CSS, картинки)
    будет собираться исключительно через **Vite**.
*   `--skip-javascript` & `--skip-hotwire`: Мы гарантируем, что в проект не попадут `importmap-rails`, `turbo` и 
    `stimulus`. Наш фронтенд будет строиться на React, и нам не нужны эти инструменты.
*   `--skip-jbuilder`: Inertia передает данные (props) в компоненты напрямую как JSON-объекты, 
    отдельные шаблоны `.jbuilder` нам не понадобятся.
*   `--skip-test`: Пропускаем Minitest, чтобы начисто внедрить экосистему **RSpec**. (Это все же на любителя, 
    выбирайте сами)

> **Note:** **Важно.** Мы оставили генерацию Views и Mailers. Layout (`application.html.erb`)
  станет точкой входа для React, а ActionMailer может понадобиться, для отправки транзакционных писем, например.

> **Note:** **Возможно**, несмотря на флаг `--skip-asset-pipeline`, Rails создаст папку `app/assets`. Поскольку всеми 
  ассетами у нас будет управлять Vite в отдельной директории, эта папка становится ненужным рудиментом. Удалим ее:
  `rm -rf app/assets`

> **Note:** **Так же**, Rails-реализация PWA здесь будет только мешать, по моему мнению, так как мы будем строить PWA 
  уже средствами Vite (если вообще будем). По этому удалим и это тоже:
  `rm -rf app/views/pwa`

### 3. Настройка (Gemfile)
У меня, после выполнения команды генерации нового проекта, Gemfile имел такой вид

![Gemfile](../../Desktop/images%20for%20article/gemfile%20-%20rails%20new.png)

Стандартный `Gemfile` требует доработки под наш стек. 
Мы удалим лишнее и добавим нужные инструменты, сгруппировав их по смыслу.

Откройте `Gemfile` и приведите его примерно к следующему виду:

```ruby
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
```

#### Что мы сделали?
1.  **Убрали:** `importmap-rails`, `rubocop-rails-omakase`. 
    Мы будем настраивать линтинг и JS-сборку сами, контролируя каждый аспект.
2.  **Добавили:** `vite_rails` и `inertia_rails` — это "сердце" нашего будущего монолита.
3.  **Оставили:** `thruster`. Даже в SPA он полезен для отдачи скомпилированных ассетов и загрузки файлов (X-Sendfile).
    Для его работы в продакшене нужно запускать сервер через `thrust bin/rails s`, но это дает прирост 
    производительности.

### 4. Устанавливаем зависимости и создаем базу данных

Так как мы оставили в проекте гемы и зависимости для очередей и кеша из коробки (Solid Stack),
то я настрою конфиг для БД как показано ниже. 
Я привел конфиг для БД в самый простой вид. Вы всегда можете подкрутить это под ваши предпочтения и задачи.

> Note: если вы клонировали данный шаблон из моей репы, то просто сделайте так:
  `cp config/database.example.yml config/database.yml`
  конфиг для БД будет как указано ниже, необходимо будет настроить только нэйминги

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_DATABASE_MAX_THREADS") { 5 } %>


development:
  <<: *default
  database: your_project_name_development

test:
  <<: *default
  database: your_project_name_test

production:
  primary: &primary_production
    <<: *default
    database: your_project_name_production
    username: your_user_name
    password: <%= ENV["RAILS_DATABASE_PASSWORD"] %>
  cache:
    <<: *primary_production
    database: your_project_name_production_cache
    migrations_paths: db/cache_migrate
  queue:
    <<: *primary_production
    database: your_project_name_production_queue
    migrations_paths: db/queue_migrate
  cable:
    <<: *primary_production
    database: your_project_name_production_cable
    migrations_paths: db/cable_migrate

```

Остальные конфиги для очередей и кеша и cable я не буду настраивать в рамках данного шаблона. Это может сделать каждый 
под свой проект.

```bash

bundle install | 
bin/rails db:create

```

Если вы видите 
```bash

❯ bin/rails db:create
Created database 'your_project_name_development'
Created database 'your_project_name_test'
```
, значит, фундамент заложен успешно.

Проверим:
```bash

bin/rails s
```

В браузере перейдем по адресу `http://127.0.0.1:3000` и увидим дефолтную заставку Rails.
В логах:
![Снимок экрана 2025-11-28 в 18.02.24.png](../../Desktop/images%20for%20article/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202025-11-28%20%D0%B2%2018.02.24.png)

Поздравляю, мы это сделали!

Зафиксируем результат:
```bash

git init
git add .
git commit -m "Setup Rails 8 Core: Solid Stack, PG, RSpec prepared"
git branch -M main

```

***

**Шаг 1 завершен.** У нас есть чистое, оптимизированное Rails backend ядро.
