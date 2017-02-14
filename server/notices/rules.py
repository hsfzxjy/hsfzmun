from rules import predicate, add_perm, is_authenticated


@predicate
def is_my_notice(user, notice):
    return notice.receiver.id == user.id


add_perm('notices.add_notice', is_authenticated)
add_perm('notices.change_notice', is_authenticated & is_my_notice)
add_perm('notices.delete_notice', is_authenticated & is_my_notice)
