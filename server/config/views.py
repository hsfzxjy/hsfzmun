from django.shortcuts import render

from articles.models import Article, Tag


def index(request):
    print(dir(Article.lang_objects))
    articles = Article.lang_objects.verified()
    tags = Tag.objects.filter(
        slug__in=['Conference_Files']).values_list('id', flat=True)
    files = [
        item.attachment for item in
        Article.attachments.through.objects.filter(
            article__tags__id__in=tags).prefetch_related('attachment')
    ]

    return render(request, 'core/index.html',
                  dict(articles=articles, files=files))
