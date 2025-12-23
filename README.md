# team-project
## API документація

- OpenAPI контракт: docs/api/openapi.yaml

![Swagger](docs/api/swagger_screenshot.png)


cd C:\Users\andri\OneDrive\Documents\project\team-project-main\backend

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
http://localhost:3000/health

git status
git add .
git commit -m "message"
git pull origin main
git push origin main




