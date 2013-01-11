import random

from zope.component import getMultiAdapter
from Products.Five.browser import BrowserView
from Products.CMFCore.utils import getToolByName
from plone.app.layout.navigation.defaultpage import isDefaultPage
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
        

    @property
    def catalog(self):
        return getToolByName(self.context, 'portal_catalog')

    def getNavigation(self):
        """ Return data structure for rendering the main menu """

        entries = list()
        folders = self.navroot.getFolderContents({'is_folderish' : True}, full_objects=True)
        folders = [f for f in folders if not f.getExcludeFromNav()]
        
        for folder in folders:
            children = list()
            exclude_subcontent = folder.getField('excludeSubcontentFromNavigation').get(folder)
            use_vertical = folder.getField('useVerticalNavigation').get(folder)
            if not exclude_subcontent:
                for brain in folder.getFolderContents({'portal_type' : ('Folder', 'zopyx.policy.page')}):
                    url = brain.getURL()
                    if use_vertical:
                        url = '%s/foldervertical_view#%s' % (folder.absolute_url(), brain.getId)
                    children.append(dict(title=brain.Title, url=url, id=brain.getId))

            if len(children) == 1:
                entries.append(dict(title=folder.Title(),
                                    id=folder.getId(),
                                    url=children[0]['url'],
                                    children=()))
            else:
                entries.append(dict(title=folder.Title(),
                                    id=folder.getId(),
                                    url=folder.absolute_url(),
                                    children=children))

        return entries                                                                             


    def getNews(self, num_items=3):

        brains = self.catalog(portal_type=('News Item',),
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
        brains = self.catalog(portal_type='zopyx.policy.projectreference')
        result = list()
        for i in range(0, chunk_size):
            result.append([])
        for i, brain in enumerate(brains):
            result[i % chunk_size].append(brain.getObject())
        return result

    def getProjectReferencesUnchunked(self):
        brains = self.catalog(portal_type='zopyx.policy.projectreference')
        refs = list()
        for brain in brains:
            refs.append(brain.getObject())
        random.shuffle(refs)
        return refs
    
    def getRotatorImages(self, chunk_size=4):
        brains = self.catalog(portal_type='zopyx.policy.rotatorimage')
        images = list()
        for brain in brains:
            images.append(brain.getObject())
        return images

    def isNavigationRoot(self):
        if '/search' in self.request.URL:
            return False
        return self.context == self.navroot


    def getRandomTestimonial(self):
        brains = self.catalog({'portal_type' : 'zopyx.policy.customertestimonial',
                               'path' : '/'.join(self.navroot.getPhysicalPath())})
        if brains:
            brain = random.choice(brains)
            return brain.getObject()
        return None

    def getFrontpageSlots(self):
        return self.context.getFolderContents({'portal_type' : 'zopyx.policy.frontpageslot'}, full_objects=True)[:2]


    def getBreadcrumbs(self):
        breadcrumbs_view = getMultiAdapter((self.context, self.request),
                                           name='breadcrumbs_view')
        result = breadcrumbs_view.breadcrumbs()
        return result

    def getNavigationRoot(self):
        return self.navroot

    def getMainSlotCSS(self):
        if self.context.portal_type in ('Folder', 'zopyx.policy.projectreference', 
                                        'zopyx.policy.person', 'zopyx.policy.youtube', 'zopyx.policy.slideshare'):
            return 'span12'
        return 'span8'

    def sideSlotVisible(self):
        return not self.context.portal_type in (
                'Folder', 'zopyx.policy.projectreference', 
                                                'zopyx.policy.person', 'zopyx.policy.youtube', 'zopyx.policy.slideshare')


    def breadcrumbs(self):
        breadcrumbs_view = getMultiAdapter((self.context, self.request),
                                           name='breadcrumbs_view')
        return breadcrumbs_view.breadcrumbs()

    def isDefaultPage(self):
        return isDefaultPage(self.context.aq_parent, self.context)
