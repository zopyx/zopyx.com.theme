from Products.Five.browser import BrowserView
from Products.CMFCore.utils import getToolByName
from plone.app.layout.navigation.root import getNavigationRootObject


def chunks(l, n):
    """ Yield successive n-sized chunks from l.  """
    for i in xrange(0, len(l), n):
        yield l[i:i+n]

class Navigation(BrowserView):

    @property
    def navroot(self):        
        portal = getToolByName(self.context, 'portal_url')
        return getNavigationRootObject(self.context, portal)
        

    def getNavigation(self):
        """ Return data structure for rendering the main menu """

        entries = list()
        folders = self.navroot.getFolderContents(full_objects=True)
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


    def getNews(self, num_items=3):

        catalog = getToolByName(self.context, 'portal_catalog')
        brains = catalog(portal_type=('News Item',),
                         sort_on='created',
                         sort_order='descending')
        results = list()
        for brain in brains:
            if 'BlogItem' in brain.Subject:
                continue
            results.append(dict(created=brain.created.strftime('%d.%m.%Y'),
                                url=brain.getURL(),
                                description=brain.Description,
                                title=brain.Title,
                            ))
        return results[:num_items]

    def getProjectReferences(self, chunk_size=4):

        catalog = getToolByName(self.context, 'portal_catalog')
        brains = catalog(portal_type='zopyx.policy.projectreference')
        refs = list()
        for brain in brains:
            refs.append(brain.getObject())
        return list(chunks(refs, chunk_size))

