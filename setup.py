from setuptools import setup, find_packages
import os

version = '0.1'

setup(name='zopyx.com.theme',
      version=version,
      description="zopyx.com theme based on Twitter/Bootstrap",
      long_description=open("README.txt").read() + "\n" +
                       open(os.path.join("docs", "HISTORY.txt")).read(),
      # Get more strings from
      # http://pypi.python.org/pypi?:action=list_classifiers
      classifiers=[
        "Framework :: Plone",
        "Programming Language :: Python",
        ],
      keywords='',
      author='',
      author_email='',
      url='http://svn.plone.org/svn/collective/',
      license='GPL',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['zopyx'],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'setuptools',
          'fanstatic',
          'z3c.jbot',
          'plone.api',
          'plone.transformchain'
          # -*- Extra requirements: -*-
      ],
      entry_points="""
      [fanstatic.libraries]
      theme = zopyx.com.theme:theme_library
      [z3c.autoinclude.plugin]
      target = plone
      """,
      setup_requires=["PasteScript"],
      paster_plugins=["ZopeSkel"],
      )
