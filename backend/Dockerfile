# Базовий образ Node
FROM node:20-alpine

# Робоча папка в контейнері
WORKDIR /app

# Копіюємо package.json та package-lock.json для кешування залежностей
COPY package*.json ./

# Встановлюємо залежності
RUN npm ci --omit=dev

# Копіюємо весь код у контейнер
COPY . .

# Відкриваємо порт
EXPOSE 3000

# Команда для запуску
CMD ["node", "index.js"]
