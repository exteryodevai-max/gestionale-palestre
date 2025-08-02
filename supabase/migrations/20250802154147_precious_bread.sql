```sql
-- Elimina la policy esistente per evitare conflitti
DROP POLICY IF EXISTS "Allow admins and super admins to create staff" ON public.users;

-- Crea la nuova policy corretta
CREATE POLICY "Allow staff creation by authorized roles"
ON public.users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users AS auth_user
    WHERE
      auth_user.id = auth.uid() -- L'utente autenticato
      AND (
        auth_user.ruolo = 'super_admin'::user_role -- Se è un super_admin, può creare
        OR
        (
          auth_user.ruolo = 'admin'::user_role -- Se è un admin
          AND new.gym_id = auth_user.gym_id -- E il gym_id del nuovo utente corrisponde al suo
        )
      )
  )
);
```