# MagicLogBack

Backend basado en un CRUD sencillo de usuarios y productos, con autenticación usando JWT.

---

## 🚀 Cómo iniciar el proyecto

1. Crear un archivo `.env` con las siguientes variables de entorno:

    ```
    STAGE=
    PORT=
    NODE_ENV=
    DB_CONNECTION=
    DB_HOST=
    DB_PORT=
    DB_DATABASE=
    DB_USERNAME=
    DB_PASSWORD=
    CLOUD_NAME=
    CLOUD_KEY=
    CLOUD_SECRET=
    JWT_SECRET=
    ```

2. Instalar dependencias:

    ```bash
    npm install
    ```

3. Iniciar el servidor en modo desarrollo:

    ```bash
    npm run start:dev
    ```

---

## ✅ Ejecutar pruebas end-to-end

```bash
npm run test:e2e
