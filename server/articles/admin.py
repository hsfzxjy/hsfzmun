from django.contrib import admin

from django.utils.translation import ugettext as _
from django.utils.safestring import mark_safe

from .models import Article

from django import forms, db


class StaticHTMLWidget(forms.Widget):

    def render(self, name, value, attrs=None):
        return mark_safe('<article style="margin-left:170px;">{}</article>'.format(value))


class ArticleAdmin(admin.ModelAdmin):

    formfield_overrides = {
        db.models.TextField: {
            'widget': StaticHTMLWidget
        }
    }

    list_display = ('title', 'author', 'edited', 'tag_list')
    fields = ('title', 'content')
    ordering = ('-edited',)

    readonly_fields = ('title',)

    list_per_page = 30

    def tag_list(self, obj):
        return ' | '.join(obj.tags.values_list('name', flat=True))

    tag_list.short_description = _('tags')

    def has_add_permission(self, reuqest):
        return False


admin.site.register(Article, ArticleAdmin)
