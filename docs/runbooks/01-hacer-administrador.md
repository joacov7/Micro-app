# Runbook 01 — Darle permisos de administrador a una cuenta

Para: el dueño del proyecto. Tiempo: 5 minutos.

El panel de administración (/admin, incremento 7) solo funciona para cuentas marcadas como administradoras. Por seguridad, **nadie puede darse ese permiso desde la app**: se asigna a mano en Supabase.

## Pasos

1. Registrate en la app con tu email, como cualquier usuario, y confirmá la cuenta.
2. Entrá a https://supabase.com/dashboard y abrí el proyecto (`presupuesta-pruebas` o `presupuesta-prod`).
3. Menú izquierdo → **SQL Editor** → **New query**.
4. Pegá esto, cambiando el email por el tuyo:

   ```sql
   update public.profiles
      set is_platform_admin = true
    where user_id = (select id from auth.users where email = 'tu-email@ejemplo.com');
   ```

5. Tocá **Run**. Tiene que decir `Success. 1 row affected` (o "1 fila").
   - Si dice `0 rows`: el email no coincide con ninguna cuenta. Revisá que esté bien escrito y que te hayas registrado en ese proyecto.

## Quitar el permiso

Mismo procedimiento con `set is_platform_admin = false`.

## Regla

Mantené la menor cantidad posible de administradores (idealmente, solo vos). Cada acción de administración queda registrada en la tabla `audit_log`.
