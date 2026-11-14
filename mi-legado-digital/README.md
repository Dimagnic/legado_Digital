# Mi Legado Digital

*Pregúntale hoy. Guárdalo para siempre.*

Plataforma para preservar la historia de una vida con su propia voz. Esta es la **Fase 1 (Fundación)**.

## Puesta en marcha

1. **Instala dependencias**
   ```bash
   npm install
   ```
2. **Conecta Supabase.** Copia `.env.example` como `.env.local` y pega la **clave pública** de tu proyecto
   (Supabase → Project Settings → API Keys → `anon public` o `publishable`).
   Nunca pongas la clave `service_role` en este archivo.
3. **Crea la base de datos.** Abre Supabase → SQL Editor y ejecuta, en orden y una sola vez cada uno:
   `supabase/migrations/20261114000001_fundacion.sql` y `supabase/migrations/20261114000002_suscripciones.sql`.
   (Con Supabase CLI: `supabase link --project-ref bzlczgauiydgufwfdhwx` y luego `supabase db push`.)
4. **Configura el inicio de sesión.** Supabase → Authentication → URL Configuration:
   *Site URL* `http://localhost:5173` y agrega la misma en *Redirect URLs*. Cuando publiques, agrega tu dominio.
5. **Arranca**
   ```bash
   npm run dev
   ```

## Qué funciona en esta entrega

| Función | Estado |
| --- | --- |
| Portada pública con modal de acceso (crear cuenta, entrar, regresar) | Listo |
| Contraseña: crear, entrar, olvidé mi contraseña, restablecer, cambiar | Listo |
| Entrar con enlace mágico por correo | Listo |
| Planes Semilla / Mi Historia / Familia, límite de almacenamiento, solo lectura | Listo |
| Cobro en línea (Stripe o Mercado Pago) | **Pendiente** – falta elegir procesador |
| Bienvenida con etapas de vida configurables | Listo |
| Mi Espacio con pregunta del día | Listo |
| Guardar un momento: escribir, hablar (grabación), foto | Listo |
| Preguntarle a alguien (modo entrevista con consentimiento) | Listo |
| Lo que sabía hacer (receta, remedio, dicho, oficio) | Listo |
| Lo que quiero que sepan (mensajes sellados y privados) | Listo (entrega a destinatarios: Fase 6) |
| Sus palabras (grabación de voz real) | Básico: se graba completa; marcar fragmentos llega después |
| Detalle con procedencia, original y huella SHA-256 | Listo |
| Edición con historial que nunca se borra | Listo |
| Mi Historia (línea de vida por etapas) | Listo |
| Búsqueda por palabras en español | Listo |
| Privacidad: permisos, exportar todo en JSON | Listo |
| Transcripción automática (Groq / OpenAI) | **Pendiente** – siguiente entrega |
| Sugerencias de IA (etiquetas, fechas) | **Pendiente** |
| Eliminar cuenta | **Pendiente** (se indica honestamente en la app) |
| Exportación ZIP con originales | **Pendiente** (hoy: JSON + enlaces temporales) |

## Pruebas

```bash
npm test                              # reglas del dominio (fechas honestas, huellas, preguntas)
bash supabase/tests/correr_pruebas.sh # privacidad: requiere PostgreSQL 16 local
```

Las pruebas de privacidad comprueban que una persona no puede leer, editar, borrar ni subir
archivos en la cuenta de otra; que las entradas y archivos originales no se pueden reescribir;
y que lo sugerido por IA nunca nace confirmado.

## Estructura

```
src/
  app/            sesión y marco de navegación
  design-system/  componentes base e identidad visual
  lib/            dominio, datos, preguntas
  modules/        auth, mi-espacio, mi-diario, mi-historia, mi-memoria, buscar, privacidad
supabase/
  migrations/     esquema, RLS, Storage privado, historial, auditoría
  tests/          pruebas de privacidad
```

Simplificación respecto al plan: la app vive en la raíz (sin `apps/web` ni `packages/shared`)
mientras haya un solo cliente; las interfaces de proveedores de IA se agregan con la transcripción.
