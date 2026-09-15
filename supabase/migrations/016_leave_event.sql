-- Memora: un invité peut quitter un album de lui-même.
-- Run this once in the Supabase SQL editor, after 015_admin_delete_user.sql.
--
-- Jusqu'ici, seuls l'organisateur et un super admin pouvaient retirer un
-- membre (migration 004) : un invité n'avait aucun moyen de se désinscrire
-- sans demander à quelqu'un.
--
-- Deux choix de conception méritent d'être explicités :
--
-- 1. La ligne `event_members` est **supprimée**, pas passée en 'removed'.
--    `redeem_event_invite` (migration 008) ne réinsère rien quand une ligne
--    existe déjà, quel que soit son statut : un statut 'removed' condamnerait
--    donc définitivement le lien d'invitation pour cette personne. La
--    supprimer laisse la porte ouverte à un retour.
--
-- 2. Les photos et les commentaires **restent** dans l'album. Ils ont été
--    partagés avec le groupe, et les retirer amputerait les souvenirs des
--    autres invités. Pour effacer ses contributions, la suppression de compte
--    (migration 011) reste le chemin prévu.

create or replace function public.leave_event(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.event_members%rowtype;
  v_is_creator boolean;
begin
  if auth.uid() is null then
    raise exception 'Vous devez être connecté.';
  end if;

  select * into v_member
  from public.event_members
  where event_id = p_event_id and user_id = auth.uid();

  if v_member.id is null then
    raise exception 'NOT_A_MEMBER';
  end if;

  select exists (
    select 1 from public.events
    where id = p_event_id and created_by = auth.uid()
  ) into v_is_creator;

  -- Un organisateur qui part laisserait un album sans personne pour le gérer,
  -- ses invitations et sa clôture comprises. Il doit passer la main ou
  -- supprimer l'événement.
  if v_is_creator or v_member.role = 'organizer' then
    raise exception 'ORGANIZER_CANNOT_LEAVE';
  end if;

  delete from public.event_members where id = v_member.id;
end;
$$;

grant execute on function public.leave_event(uuid) to authenticated;
