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

## Часть 2: Экосистема Качества (RSpec + RuboCop + Annotate)

Фундамент заложен, но необходимо наладить систему контроля качества. Мы сделаем так, чтобы любой новый код в 
нашем проекте автоматически проверялся на соответствие стандартам, а тесты писались легко и приятно и авто генерация 
документации для моделей работала.

В этой части мы настроим **RSpec** (тестирование), **RuboCop** (линтинг) и **Annotate** (документация).

### 1. Инициализация RSpec
Мы отказались от Minitest в пользу RSpec. Теперь нужно создать его конфигурационные файлы.

Выполните команду:
```bash
bin/rails generate rspec:install
```
Это создаст папку `spec/` и базовые конфиги. Однако стандартные настройки слишком "шумные" и не включают нужные
нам инструменты (SimpleCov, FactoryBot). Мы перепишем их начисто.

#### Настройка `.rspec`
Этот файл отвечает за параметры запуска тестов. Мы хотим видеть красивый цветной вывод.

Откройте `.rspec` и настройте на ваше усмотрение. Я, обычно, использую такой набор аргументов.
```text
--format documentation
--color
--require rails
```

#### Настройка `spec/rails_helper.rb`
Это главный файл конфигурации тестов. Мы настроим его так, чтобы он:
1.  Запускал **SimpleCov** (покрытие кода) *до* загрузки Rails.
2.  Фильтровал лишнее из отчетов.
3.  Подключал **FactoryBot** (чтобы писать `create(:user)` вместо `FactoryBot.create(:user)`).
4.  Подключал хелперы **Inertia** (для тестирования компонентов).

Полностью замените содержимое `spec/rails_helper.rb` на следующее:

```ruby
# frozen_string_literal: true

require 'spec_helper'
require 'simplecov'

# Запуск анализа покрытия кода
SimpleCov.start 'rails' do
  # Исключаем из отчета технические директории
  add_filter '/bin/'
  add_filter '/db/'
  add_filter '/spec/'
  add_filter '/config/'
  
  # Группируем файлы в отчете для удобства
  add_group 'Controllers', 'app/controllers'
  add_group 'Models', 'app/models'
  add_group 'Mailers', 'app/mailers'
  add_group 'Libraries', 'lib'
end

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'

# Защита от запуска тестов на боевой базе
abort('The Rails environment is running in production mode!') if Rails.env.production?

require 'rspec/rails'
require 'inertia_rails/rspec'

begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  # Указываем путь к фикстурам (хотя мы будем использовать фабрики)
  config.fixture_paths = [Rails.root.join('spec/fixtures')]
  
  # Транзакционные тесты: база очищается после каждого теста
  config.use_transactional_fixtures = true
  
  # Убираем лишний шум из стек-трейсов
  config.filter_rails_from_backtrace!
  
  # Подключаем синтаксис FactoryBot (create, build, attributes_for)
  config.include FactoryBot::Syntax::Methods
end
```

> **Note:** **Важно.** Это минимальный рабочий конфиг, далее уже зависит от вашего проекта и предпочтений.

Не забудьте добавить папку покрытия в `.gitignore`, чтобы отчеты не летели в репозиторий:
```bash

echo "coverage" >> .gitignore
```

### 2. Настройка RuboCop (Линтер)
RuboCop "из коробки" может быть слишком строгим или, наоборот, пропускать важное. Мы настроим сбалансированный конфиг,
который помогает поддерживать чистоту кода, но не душит бюрократией.

Создайте файл `.rubocop.yml` в корне проекта:

```yaml
plugins:
  - rubocop-rails
  - rubocop-rspec
  - rubocop-performance

AllCops:
  TargetRubyVersion: 3.4
  NewCops: enable
  SuggestExtensions: false
  Exclude:
    - 'bin/**/*'
    - 'db/**/*' # Схемы и миграции часто не проходят проверку, и это нормально
    - 'tmp/**/*'
    - 'config/initializers/**/*' # В инициалайзерах часто специфичный DSL
    - 'node_modules/**/*'
    - 'vendor/**/*'

# Rails specific
Rails/UnknownEnv:
  Environments:
    - production
    - development
    - test
    - staging

# Documentation: В проектах с быстрым темпом 100% документация классов часто избыточна
Style/Documentation:
  Enabled: false

# Frozen String: В Ruby 3+ это норма, но явное указание полезно
Style/FrozenStringLiteralComment:
  Enabled: true

# RSpec: Даем тестам чуть больше свободы
RSpec/ExampleLength:
  Max: 20 # Интеграционные тесты могут быть длиннее юнитов

RSpec/MultipleExpectations:
  Max: 5 # Проверка статуса, заголовков и тела ответа в одном тесте - это ок

# Layout: Современные мониторы широкие
Layout/LineLength:
  Max: 120
```

> **Note:** **Так же,** вы можете настроить это под свои предпочтения.

### 3. Настройка Генераторов (Чистая Архитектура)
Мы хотим, чтобы команда `rails g model User` создавала только нужные файлы, а не кучу мусора
(ассеты, хелперы, тесты вьюх), который мы не используем, так как весь фронт у нас на React.

Откройте `config/application.rb` и добавьте этот блок настройки внутри класса `YourApplication`:

```ruby
    # ... внутри class YourApplication < Rails::Application ...

    # Настройка генераторов для чистоты проекта
    config.generators do |g|
      g.test_framework :rspec,
                       fixtures: true,
                       view_specs: false,    # В Inertia вьюхи тестируются через JS-тесты или системные
                       helper_specs: false,  # Хелперы редко нужны, логику лучше держать в моделях
                       routing_specs: false, # Роутинг проверяется в request specs
                       request_specs: true   # Наш основной инструмент тестирования API

      g.fixture_replacement :factory_bot, dir: "spec/factories"

      g.stylesheets false      # Стили в Tailwind (Vite)
      g.javascripts false      # JS в React (Vite)
      g.helper false           # Глобальные хелперы не нужны
      g.channel assets: false  # Каналы без лишних файлов
    end
```

> **Note:** **Возможно** вы захотите как-то это изменить, на ваше усмотрение.

### 4. Настройка Annotate (Документация БД)
Гем `annotate` позволяет автоматически добавлять комментарии со схемой таблицы в начало каждого файла модели.
Это очень удобно: открыл модель, например `User.rb`, и сразу видишь, какие у неё есть поля.

Установим автозапуск аннотаций. Выполните:
```bash

bin/rails g annotate:install
```

Это создаст файл `lib/tasks/auto_annotate_models.rake`. Его дефолтные настройки хороши, но убедитесь, 
что `Annotate.load_tasks` вызывается в конце, если вы хотите запускать его вручную. Основная магия происходит
автоматически после `db:migrate` в development окружении.

### 5. Проверка системы
Теперь, когда все настроено, давайте убедимся, что система работает.

1.  **Проверка линтера:**
    ```bash
    
    bundle exec rubocop
    ```
    Скорее всего, он найдет "нарушения" в автосгенерированных файлах (например, двойные кавычки).
    Исправьте их автоматически:
    ```bash
    
    bundle exec rubocop -A
    ```

2.  **Проверка тестов:**
    ```bash
    
    bundle exec rspec
    ```
    Вы должны увидеть `No examples found`, но команда должна завершиться успешно (зеленым цветом).
    Это значит, RSpec готов к работе.

3.  **Проверка безопасности (Brakeman):**
    ```bash

    bundle exec brakeman
    ```
    Вы должны увидеть отчет `No warnings found`. Это значит, что базовый конфиг Rails безопасен. 
    Прелесть Brakeman в том, что он не требует настройки, просто работает “из коробки”.

4.  **Фиксация результата:**
    ```bash
    
    git add .
    git commit -m "Setup Quality Ecosystem: RSpec, RuboCop, SimpleCov"
    ```

***

Поздравляю!

**Шаг 2 завершен.** Наш Backend теперь представляет собой профессиональную среду разработки. Он защищен тестами,
код проверяется на стандарты, генераторы теперь наши помощники.

***

## Часть 3: Фронтенд-Революция (React + Vite + Inertia)

Времена, когда интеграция React в Rails занимала часы и требовала правки десятков конфигов, прошли. В 2025 году инструменты стали настолько умными, что понимают друг друга с полуслова.

В этой части мы одной командой развернем полноценный современный фронтенд-стек, а затем "отполируем" его настройки для идеальной работы.

### 1. Магическая команда
Убедитесь, что вы находитесь в корне проекта.
И так, нам не нужно ставить Vite или React вручную. Гем `inertia_rails`, который мы добавили ранее,
имеет мощнейший инсталлятор.

Просто выполните:
```bash

bin/rails g inertia:install
```

Теперь внимательно следите за вопросами в терминале и отвечайте на них:

1.  **"Could not find a package.json... Would you like to install Vite Ruby?"** -> `y` (Да!)
  *   *Генератор понял, что у нас нет сборщика, и сам предложил поставить Vite.*
2.  **"Would you like to use TypeScript?"** -> `n` (Нет)
  *   *Для старта выбираем JS. Если вы гуру TS — выбирайте `y`.*
3.  **"Would you like to install Tailwind CSS?"** -> `y` (Да!)
  *   *Tailwind установится и настроится автоматически.*
4.  **"What framework do you want to use with Inertia?"** -> `react`
  *   *Выбираем наш UI-движок.*
5.  **"Overwrite bin/dev?"** -> `y` (Да!)
  *   *Генератор обновит скрипт запуска, чтобы он поднимал и Rails, и Vite одной командой.*

**Все !!!**

> А че так можно было ?

### 2. Полировка и Тонкая настройка
Генератор сделал 90% работы, но оставил несколько моментов, которые мы, как перфекционисты, должны исправить.

#### Убираем лишние entrypoints
Генератор создал `app/frontend/entrypoints/inertia.jsx` (наша реальная точка входа) и оставил дефолтный `app/frontend/entrypoints/application.js` (от Vite). Последний нам не нужен, так как он будет только путать.

Удалите файл `app/frontend/entrypoints/application.js`.

Теперь откройте `app/views/layouts/application.html.erb` и приведите секцию `<head>` к такому чистому виду:

```erb
  <head>
    <title data-inertia><%= content_for(:title) || "Rails React Inertia Boilerplate" %></title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>
    <%= yield :head %>

    <%# Подключаем стили через Vite (так они будут hot-reloaded) %>
    <%= vite_stylesheet_tag "application" %> 
    
    <%# Подключаем React HMR и нашу точку входа %>
    <%= vite_react_refresh_tag %>
    <%= vite_client_tag %>
    <%= vite_javascript_tag "inertia.jsx" %>
    
    <%# SSR head (если понадобится в будущем) %>
    <%= inertia_ssr_head %>
  </head>
```
> **Note:** **Обратите внимание:** Мы убрали `vite_javascript_tag 'application'`, оставив только `inertia.jsx`. Это делает загрузку понятной и предсказуемой.

#### Базовый контроллер Inertia
Генератор создал файл `app/controllers/inertia_controller.rb`. Это базовый контроллер, от которого должны наследоваться все контроллеры, использующие React.

Откройте его и убедитесь, что он выглядит так:
```ruby
# frozen_string_literal: true

class InertiaController < ApplicationController
  # Автоматически прокидываем flash-сообщения (notice, alert) в React-пропсы
  inertia_share flash: -> { flash.to_hash }
end
```
Теперь, создавая новые контроллеры для фронтенда, наследуйтесь от `InertiaController`, а не от `ApplicationController`.

#### Настройка Procfile.dev
Откройте файл `Procfile.dev` в корне. Он управляет процессами разработки.
Давайте сделаем его более понятным:

```yaml
# 1. Rails (Главный процесс).
# RUBY_DEBUG_OPEN=true включает удаленную отладку.
# Так как foreman перехватывает ввод, мы не можем писать команды прямо тут.
# Но с этим флагом можно подключиться к дебагер из соседнего терминала: rdbg -a
# Просто предварительно поставьте где-то в коде точку останова `debugger`.
web: env RUBY_DEBUG_OPEN=true bin/rails server

# 2. Vite (Сборщик фронтенда).
# Запускается параллельно и обновляет JS/CSS на лету (HMR).
vite: bin/vite dev
```
> **Note:** **Почему `web` первый?** Это конвенция. Если главный процесс (Rails) упадет, foreman остановит и Vite.

#### Роутинг
В `config/routes.rb` генератор добавил полезный блок для перенаправления с 127.0.0.1 на localhost (чтобы Vite не ругался на CORS). Оставьте его, это полезно:

```ruby
Rails.application.routes.draw do
  # Redirect to localhost from 127.0.0.1 to use same IP address with Vite server
  constraints(host: '127.0.0.1') do
    get '(*path)', to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end

  # Демо-роуты, полезны для проверки работы фронтенда (можно удалить позже)
  root 'inertia_example#index'
  get 'inertia-example', to: 'inertia_example#index'
end
```

### 3. Запуск
Все готово. Запустите сервер разработки:

```bash

bin/dev
```
Откройте `http://localhost:3000`. Вы увидите работающее приложение.

Поздравляю!

### 4. Фиксация
Зафиксируем нашу победу:
```bash

git add .
git commit -m "Frontend Setup: Vite + React + Inertia (Auto-generated & Polished)"
```

***

**Шаг 3 завершен.** Мы получили работающий фронтенд, настроенный по уму.
Остался финальный рывок — **Шаг 4: Экосистема Качества Фронтенда**. 
Там мы настроим ESLint, Prettier и структуру папок, чтобы писать код было приятно.
