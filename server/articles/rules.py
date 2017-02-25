from rules import is_authenticated, predicate, is_staff, add_perm, always_false


@predicate
def is_my_article(user, article):
    return article.author.id == user.id


add_perm('articles', is_authenticated & (is_staff))
add_perm('articles.add_article', is_authenticated)
add_perm('articles.change_article', is_authenticated &
         (is_staff | is_my_article))
add_perm('articles.delete_article', is_authenticated &
         (is_staff | is_my_article))

add_perm('articles.add_tag', is_authenticated)
add_perm('articles.change_tag', always_false)
add_perm('articles.delete_tag', is_authenticated)
