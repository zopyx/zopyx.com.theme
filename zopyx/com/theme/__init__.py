# -*- extra stuff goes here -*-


def initialize(context):
    """Initializer called when used as a Zope 2 product."""

from Products.CMFCore.DirectoryView import registerFileExtension
from Products.CMFCore.FSFile import FSFile

registerFileExtension('svg', FSFile)
registerFileExtension('ttf', FSFile)
registerFileExtension('less', FSFile)
registerFileExtension('woff', FSFile)
registerFileExtension('svg', FSFile)


from fanstatic import Library, Resource

theme_library = Library('theme', 'theme_resources')
body = Resource(theme_library, 'body.css')
