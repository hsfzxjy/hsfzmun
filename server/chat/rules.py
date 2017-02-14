from rules import add_perm, always_false, is_authenticated, is_staff


add_perm('chat.add_discussion', is_authenticated & is_staff)
add_perm('chat.change_discussion', is_authenticated & is_staff)
add_perm('chat.delete_discussion', is_authenticated & is_staff)

add_perm('chat.add_message', is_authenticated)
add_perm('chat.change_message', always_false)
add_perm('chat.delete_message', always_false)
