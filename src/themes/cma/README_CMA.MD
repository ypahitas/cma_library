- Changed the app-routes.ts to edit 'commmunity-list' to 'collection-list'
- Created a .cfg file for the backend configuration in the backendConfig subfolders
    - For the backend dockers modified the dspace.cfg file with the following parameters
    - webui.browse.vocabularies.disabled = srsc
    - webui.browse.index.3 = subject:metadata:dc.subject:text

- Changed the discoveryConfiguration.xml for the different search filters [dspace]/config/spring/api/discovery.xml
    - see backendConfig subfolder
    - Then you need to re index solr /dspace/bin/dspace index-discovery -b         
