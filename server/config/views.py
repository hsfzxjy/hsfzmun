from django.shortcuts import render

from articles.models import Article, Tag


def index(request):
    print(Article.lang_objects.values_list('lang_code', flat=True))
    articles = Article.lang_objects.verified().filter(is_article=True)[:10]
    file_articles = Article.lang_objects\
        .verified()\
        .filter(tags__slug__in=['Conference_Files'], is_article=False)[:10]

    return render(request, 'core/index.html',
                  dict(articles=articles, file_articles=file_articles))
