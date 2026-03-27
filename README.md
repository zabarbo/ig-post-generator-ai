# 🛍️ ARPY ORIGENES — Generador de Contenido IG

> Herramienta interna de generación de contenido para Instagram, potenciada por **Gemini AI (Google)**.  
> Desarrollada por [Victor Barboza](https://victorbarboza.com) · `v1.0`

---

## ✨ ¿Qué hace esta app?

Convierte datos básicos de un producto (nombre, categoría y precio) en **posts listos para publicar en Instagram**, incluyendo texto, hashtags e ideas visuales. Todo en segundos, usando inteligencia artificial de Google.

---

## 🚀 Funcionalidades principales

### 🤖 Generación de Posts con Gemini AI
- Ingresás el nombre del producto, categoría y precio
- La IA generá **3 versiones del post** por producto:
  - **Promocional** — directo al punto, orientado a venta
  - **Aspiracional** — estilo de vida, deseo y valor de marca
  - **Urgencia** — escasez, oferta o llamada a la acción inmediata
- Cada post incluye **texto completo con emojis + hashtags optimizados**
- La IA también genera **3 ideas visuales** para fotos o reels

### 🎯 Detección automática de categoría
- Si seleccionás **"Auto-detectar"**, la IA reconoce el tipo de producto a partir del nombre
- Categorías soportadas: **Indumentaria, Calzado, Perfumería, Accesorios**
- Fallback a "General" si no se identifica la categoría

### 🎨 Personalización de Tono y Objetivo
- **Tono del contenido:**
  - Atractivo y vendedor
  - Elegante y sofisticado
  - Juvenil y divertido
  - Profesional y formal
  - Exclusivo y misterioso
- **Objetivo estratégico:**
  - Venta directa
  - Generar interacción (Likes/Comentarios)
  - Posicionamiento de marca (Branding)
  - Llevar tráfico al sitio web

### 🏷️ Contexto de Marca (Perfil de Marca)
Configurá el ADN de tu negocio para que la IA siempre escriba como tu marca:
- **Nombre de marca** — identidad de la cuenta
- **Público objetivo** — descripción del cliente ideal
- **Reglas de tono/voz** — instrucciones de cómo debe hablar la IA
- **Palabras prohibidas (Blacklist)** — palabras que Gemini nunca usará

### 📋 Historial de Posts Generados
- Guarda automáticamente los últimos **20 posts generados**
- Cada ítem muestra un **ícono visual por categoría**:
  - 👕 Indumentaria → violeta
  - 👣 Calzado → ámbar
  - 💧 Perfumería → rosa
  - ⌚ Accesorios → cyan
  - 🏷️ General → gris
- Hacé clic en cualquier ítem para **recargar ese resultado en pantalla**

### 📅 Calendario de Publicación
- Planificá cualquier post generado para una **fecha y hora específica**
- Los posts programados se muestran en el **Calendario** con su fecha, tipo y preview del contenido
- Podés **eliminar** posts del calendario cuando ya los publicaste
- Copiar el contenido directamente desde el calendario

### 📊 Métricas de Uso
Panel de analytics con:
- **Total de posts creados** (cada generación produce 3)
- **Total de peticiones a Gemini AI**
- **Categoría más generada**
- **Tonos más utilizados** (barra de progreso)
- **Objetivos de campaña más usados** (barra de progreso)

### 📋 Copiar al portapapeles
- Botón de **copiar** en cada post generado (texto + hashtags)
- Feedback visual con confirmación "¡COPIADO!" por 2 segundos

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| [Next.js](https://nextjs.org/) (App Router) | Framework principal |
| [Gemini 2.5 Flash](https://ai.google.dev/) | Motor de generación de contenido |
| [Supabase](https://supabase.com/) | Base de datos, autenticación y storage |
| [Framer Motion](https://www.framer.com/motion/) | Animaciones y transiciones |
| [Tailwind CSS v4](https://tailwindcss.com/) | Estilos |
| [Lucide React](https://lucide.dev/) | Íconos |
| [Vercel](https://vercel.com/) | Deploy y hosting |

---

## 🗄️ Estructura de la base de datos (Supabase)

### Tabla `posts`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | ID único |
| `user_id` | uuid | Referencia al usuario |
| `product_name` | text | Nombre del producto |
| `category` | text | Categoría del producto |
| `price` | text | Precio (opcional) |
| `tone` | text | Tono seleccionado |
| `objective` | text | Objetivo estratégico |
| `content` | jsonb | Resultado completo de la IA (JSON) |
| `status` | text | `draft` o `scheduled` |
| `scheduled_at` | timestamptz | Fecha de publicación programada |
| `created_at` | timestamptz | Fecha de creación |

### Tabla `profiles`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | Referencia al usuario |
| `brand_name` | text | Nombre de la marca |
| `target_audience` | text | Descripción del público |
| `brand_voice_rules` | text | Reglas de tono/voz |
| `forbidden_words` | text | Palabras prohibidas |

---

## ⚙️ Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
GEMINI_API_KEY=tu_gemini_api_key
```

---

## 🖥️ Correr localmente

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 📱 PWA (Progressive Web App)

La app está configurada como PWA: puede instalarse en el celular desde el navegador y funciona como una app nativa, sin necesidad de App Store.

---

## 🔐 Autenticación

Login seguro con **Supabase Auth** (email + contraseña). Todos los datos son privados por usuario.

---

## 👤 Autor

**Victor Barboza**  
[victorbarboza.com](https://victorbarboza.com)

---

*Desarrollado a medida para **ARPY ORIGENES**. Todos los derechos reservados.*
