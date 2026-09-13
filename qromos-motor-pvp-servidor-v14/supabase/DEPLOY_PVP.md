# Desplegar el motor PvP

Abre PowerShell dentro de la carpeta principal del proyecto y ejecuta:

```powershell
npx supabase login
npx supabase functions deploy pvp-battle --project-ref pgquzbzupirlbtucrjfg --no-verify-jwt
```

El primer comando abrirá el navegador para autorizar Supabase CLI. El segundo
publicará la función. No escribas ni compartas la `service_role` key: Supabase la
inyecta automáticamente en la función desplegada.

Cuando aparezca `Deployed Functions on project pgquzbzupirlbtucrjfg`, la función
estará lista para conectarse a la interfaz.
