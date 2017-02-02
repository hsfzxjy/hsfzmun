from django.core.management.commands import makemessages


class Command(makemessages.Command):

    def handle(self, *args, **options):
        options['extensions'] = ['html', 'py']
        options['locale'] = ['zh_Hans']

        return super(Command, self).handle(*args, **options)
