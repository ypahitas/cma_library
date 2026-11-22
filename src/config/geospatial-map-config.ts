import { Config } from './config.interface';

export class GeospatialMapConfig implements Config {

  /**
   * The metadata fields which hold WKT points, to use when drawing a map
   */
  public spatialMetadataFields: string[];

  /**
   * Discovery search configuration which will return facets of geospatial points
   */
  public spatialFacetDiscoveryConfiguration: string;

  /**
   * Discovery filter for geospatial point
   */
  public spatialPointFilterName: string;

  /**
   * A simple switch to test for inclusion of geospatial item page fields in templates
   */
  public enableItemPageFields: boolean;

  /**
   * Include the map view mode in the list of view modes provided in a search results page
   */
  public enableSearchViewMode: boolean;

  /**
   * Include a Browse By Geographic Location map in the browse menu links
   */
  public enableBrowseMap: boolean;

  /**
   * The url string tempalte for a tile provider, e.g. https://tile.openstreetmap.org/{z}/{x}/{y}.png
   * to pass to TileLayer when initialising a leaflet map
   */
  public tileProviders: string[];

  /**
   * Optional URL of a MapLibre GL vector style (e.g. https://tiles.openfreemap.org/styles/positron).
   * When set, it is drawn as the base map instead of tileProviders.
   */
  public vectorStyleUrl?: string;

  /**
   * Optional ISO 639-1 language code (e.g. 'el') for place-name labels on the vector base map.
   * Uses the OpenStreetMap "name:<language>" tag, falling back to the local name.
   */
  public labelLanguage?: string;

  /**
   * Optional: hide roads, railways, street names, buildings and airports on the vector base map,
   * leaving boundaries, water and place names (regions, towns, villages)
   */
  public hideStreetDetails?: boolean;

  /**
   * Optional: the furthest the map zooms in automatically when fitting to its markers
   * (e.g. 12 shows about 20 x 20 km). Users can still zoom in further by hand.
   */
  public maxAutoZoom?: number;

  /**
   * Optional: the area the browse map opens on, instead of fitting all of its markers
   */
  public browseMapBounds?: { south: number, west: number, north: number, east: number };

  /**
   * Optional: extra zoom levels applied after fitting browseMapBounds (e.g. 1 = one level closer)
   */
  public browseMapZoomOffset?: number;

  /**
   * Starting centre point for maps (before drawing and zooming to markers)
   * Takes a lat and lng float value as coordinates
   * Defaults to Istanbul
   */
  public defaultCentrePoint: { lat: number, lng: number };

}
