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
