from django import template
from django.utils.safestring import mark_safe


register = template.Library()


@register.filter
def errclass(form, field):
    return 'has-danger' if form.has_error(field) else ''


@register.filter
def errtext(form, field='__all__'):
    if form.has_error(field):
        return mark_safe(r"""
                    <div class="form-control-feedback">%s</div>
                """ % form.errors[field].as_text())
    else:
        return ''
