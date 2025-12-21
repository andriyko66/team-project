# team-project
## API документація

- OpenAPI контракт: docs/api/openapi.yaml

![Swagger](docs/api/swagger_screenshot.png)

## Перевірка Docker
docker version

docker run hello-world

# 1) Будуємо Docker образ
docker build -t myapp-node:1.0.0 .

# 2) Запускаємо контейнер у фоновому режимі та відкриваємо порт 3000
docker run --name myapp --rm -d -p 3000:3000 myapp-node:1.0.0

# 3) Перевіряємо логи, щоб побачити чи сервер запустився
docker logs -f myapp

# Піднімаємо все
docker compose up -d

# Перевіряємо контейнери
docker ps

# Перевіряємо логи API
docker logs -f api

# Перевірка API у браузері або curl
curl http://localhost:3000/health

# Зупинка та видалення контейнерів
docker compose down

