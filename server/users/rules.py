from rules import predicate, add_perm, is_staff, is_authenticated, is_superuser


@predicate
def is_me(user, userobj):
    return userobj.id == user.id


add_perm('is_admin', is_authenticated & (is_staff | is_superuser))

add_perm('users.add_user', is_authenticated & is_staff)
add_perm('users.change_user', is_authenticated & (is_staff | is_me))
add_perm('users.delete_user', is_authenticated & is_staff)

add_perm('auth.add_group', is_superuser)
add_perm('auth.change_group', is_superuser)
add_perm('auth.delete_group', is_superuser)
