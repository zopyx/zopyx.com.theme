from Products.Five.browser import BrowserView
from Products.CMFCore.utils import getToolByName
from plone.app.layout.navigation.root import getNavigationRootObject

class Navigation(BrowserView):

    def getNavigation(self):
        """ Return data structure for rendering the main menu """

        portal = getToolByName(self.context, 'portal_url')
        navroot = getNavigationRootObject(self.context, portal)

        entries = list()
        folders = navroot.getFolderContents(full_objects=True)
        folders = [f for f in folders if not f.getExcludeFromNav()]
        
        for folder in folders:

            children = list()
            for brain in folder.getFolderContents():
                children.append(dict(title=brain.Title,
                                     url=brain.getURL()))

            entries.append(dict(title=folder.Title(),
                                url=folder.absolute_url(),
                                children=children))

        return entries                                                                              
