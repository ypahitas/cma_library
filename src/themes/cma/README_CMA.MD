- Changed the app-routes.ts to edit 'commmunity-list' to 'collection-list'
- Created a .cfg file for the backend configuration in the backendConfig subfolders
    - For the backend dockers modified the dspace.cfg file with the following parameters
    - webui.browse.vocabularies.disabled = srsc
    - webui.browse.index.3 = subject:metadata:dc.subject:text

- Changed the discoveryConfiguration.xml for the different search filters [dspace]/config/spring/api/discovery.xml
    - see backendConfig subfolder
    - Then you need to re index solr /dspace/bin/dspace index-discovery -b

- To get theme 118n translations need to run the following command
    -  yarn merge-i18n --source-dir  src/themes/cma/assets/i18n
- To debug I am running edge and attaching via the VS Code debug config
    -"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222
- Some file formats are not recognised out of the box in dSpace (e.g. m4a)
    - Need to go login the admin panel ->registries->formats and add the extensions under the appropriate mime type e.g. m4a goes under audio/mpeg
- Submission page is controlled via sumbission-forms.xml in BackendConfig