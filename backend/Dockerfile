FROM node:20-alpine

WORKDIR /app

# Копіюємо package.json та package-lock.json для кешування залежностей
COPY package*.json ./

# Встановлюємо лише production-залежності
RUN npm ci --omit=dev

# Копіюємо весь код
COPY . .

# Відкриваємо порт API
EXPOSE 3000

# Запуск сервера
CMD ["node", "server.js"]
