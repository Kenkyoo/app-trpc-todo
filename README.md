# Grocery List App 🛒

Una aplicación de lista de compras con autocompletado, autenticación y almacenamiento en base de datos.

## 🚀 Demo

* **Repositorio:** [GitHub](https://github.com/Kenkyoo/app-trpc-todo)
* **Deploy:** [Netlify](https://app-trpc-todo.netlify.app)

## 🧩 Características

* ✅ Autenticación con [Clerk](https://clerk.com)
* 🗂️ Guardado de tareas en base de datos (Supabase + PostgreSQL)
* ⚡ API construida con [tRPC](https://trpc.io)
* 🧠 Autocompletado de productos con [Headless UI Combobox](https://headlessui.com)
* 🎨 Estilos con [Tailwind CSS](https://tailwindcss.com) y [DaisyUI](https://daisyui.com)
* 💾 ORM con [Prisma](https://www.prisma.io)
* ⚛️ Framework: [Next.js (pages router)](https://nextjs.org)

## 🖥️ Tecnologías principales

* **Next.js** (pages)
* **tRPC**
* **Prisma ORM**
* **Supabase (PostgreSQL)**
* **Clerk (Auth)**
* **TailwindCSS + DaisyUI**
* **HeadlessUI**
* **React Query**

## 🧠 Funcionamiento

1. El usuario inicia sesión con Clerk.
2. Puede agregar productos con autocompletado o escribiendo manualmente.
3. Las tareas se guardan en la base de datos de Supabase.
4. Se pueden marcar como completadas, editar o eliminar.
5. Incluye filtros (all, active, completed) y opción para limpiar completadas.

## ⚙️ Instalación y uso local

```bash
# Clonar el repositorio
git clone https://github.com/Kenkyoo/app-trpc-todo
cd app-trpc-todo

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Agregar credenciales de Clerk y Supabase

# Ejecutar el servidor de desarrollo
pnpm dev
```

## 📁 Estructura del proyecto

```
app-trpc-todo/
├── prisma/          # Schema de base de datos
├── src/
│   ├── components/  # Componentes UI
│   ├── pages/       # Páginas Next.js
│   ├── server/      # Routers tRPC
│   ├── utils/       # Hooks y helpers
│   └── lib/         # Datos de autocompletado y filtros
└── package.json
```

## 🧑‍💻 Scripts disponibles

* `pnpm dev` → Inicia el servidor de desarrollo
* `pnpm build` → Compila para producción
* `pnpm start` → Inicia el servidor de producción
* `pnpm studio` → Abre Prisma Studio
* `pnpm migrate-dev` → Ejecuta migraciones en desarrollo

## 📸 Vista previa

![preview](https://github.com/Kenkyoo/app-trpc-todo/blob/main/public/preview.png)

## 🧾 Licencia

Este proyecto es de código abierto bajo la licencia MIT.
