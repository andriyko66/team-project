# team-project
## API документація

- OpenAPI контракт: docs/api/openapi.yaml

![Swagger](docs/api/swagger_screenshot.png)

## Перевірка Docker
docker version

docker run hello-world

# Docker тестування для Node.js API

## Команди

# Будуємо образ
docker build -t myapp-node:1.0.0 .

# Запускаємо контейнер
docker run --name myapp --rm -d -p 3000:3000 myapp-node:1.0.0

# Перевірка логів
docker logs -f myapp

# Перевірка роботи API
curl http://localhost:3000/health


