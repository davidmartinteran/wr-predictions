# ADR-004 — Auth por Magic Link sin password

**Estado:** Aceptado
**Fecha:** 2026-05-20
**Contexto:** Fase 1 — Architecture & Design

---

## Contexto

El onboarding es para 20-50 amigos, muchos no técnicos. Necesitamos autenticación con fricción mínima y soporte cero.

## Decisión

**Supabase Auth con Magic Link por email.** Sin passwords, sin OAuth, sin proveedores sociales.

## Alternativas evaluadas

| Opción | Pros | Contras |
|---|---|---|
| **Magic Link (Supabase Auth)** | 0 fricción; sin "olvidé contraseña"; funciona en cualquier dispositivo con email; Supabase lo tiene built-in | Depende de que el email llegue (spam); latencia del email (5-30s); sesión expira y hay que re-autenticar |
| **Email + Password** | Familiar; sesión persistente | Soporte de "olvidé contraseña"; usuarios eligen passwords débiles; más formularios |
| **OAuth (Google/Apple)** | Login en 1 tap; sesión larga | No todos tienen cuenta Google; Apple Sign-In solo en Safari/iOS; requiere configurar proveedores; excesivo para un grupo de amigos |
| **Link de invitación sin auth** | Máxima simplicidad | Sin identidad; imposible saber quién hizo qué pronóstico; inseguro |

## Detalles de implementación

### Flujo de invitación

1. Admin introduce email del amigo en el panel.
2. Sistema envía Magic Link vía Supabase Auth (`supabase.auth.signInWithOtp({ email })`).
3. El amigo hace clic en el link → se crea la cuenta + se une al pool automáticamente.
4. Las siguientes visitas: el amigo entra su email → recibe otro Magic Link → sesión activa.

### Sesión

- Supabase Auth maneja tokens JWT con refresh automático.
- Session timeout: 1 semana (configurable). Para una app que se usa durante 1 mes, minimiza re-autenticaciones.
- El refresh token renueva la sesión sin intervención del usuario.

### Rol de admin

- Se asigna manualmente en la BD: `UPDATE auth.users SET raw_app_meta_data = jsonb_set(raw_app_meta_data, '{role}', '"admin"') WHERE email = 'david@...'`.
- RLS usa `auth.jwt() ->> 'role'` para verificar permisos de admin.
- En MVP solo hay 1 admin (David). No hay UI de gestión de roles.

## Tradeoffs aceptados

- **Dependencia del email:** Si el email va a spam, el usuario no puede entrar. Mitigación: instrucciones claras ("revisa spam") y posibilidad de reenviar.
- **Sin sesión offline:** Magic Link requiere conexión. Aceptable para este caso de uso.

## Consecuencias

- No hay tabla de passwords ni formulario de registro.
- El onboarding es: recibir email → clic → estás dentro.
- La UI de login es un solo campo: email + botón "Enviar enlace".
