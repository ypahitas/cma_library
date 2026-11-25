import { GeospatialMapConfig } from '../../../../../config/geospatial-map-config';
import { environment } from '../../../../../environments/environment';

/**
 * CMA map settings on top of the stock DSpace ones. They live under geospatialMapViewer in
 * config/config.yml like the stock settings; the stock config class doesn't declare them,
 * so CMA code reads them through {@link cmaMapConfig}.
 */
export interface CmaGeospatialMapConfig extends GeospatialMapConfig {
  /**
   * Optional URL of a MapLibre GL vector style (e.g. https://tiles.openfreemap.org/styles/positron).
   * When set, it is drawn as the base map instead of tileProviders.
   */
  vectorStyleUrl?: string;

  /**
   * Optional ISO 639-1 language code (e.g. 'el') for place-name labels on the vector base map.
   * Uses the OpenStreetMap "name:<language>" tag, falling back to the local name.
   */
  labelLanguage?: string;

  /**
   * Optional: hide roads, railways, street names, buildings and airports on the vector base map,
   * leaving boundaries, water and place names (regions, towns, villages)
   */
  hideStreetDetails?: boolean;

  /**
   * Optional: the furthest the map zooms in automatically when fitting to its markers
   * (e.g. 12 shows about 20 x 20 km). Users can still zoom in further by hand.
   */
  maxAutoZoom?: number;

  /**
   * Optional: the area the browse map opens on, instead of fitting all of its markers
   */
  browseMapBounds?: { south: number, west: number, north: number, east: number };

  /**
   * Optional: extra zoom levels applied after fitting browseMapBounds (e.g. 1 = one level closer)
   */
  browseMapZoomOffset?: number;
}

/** The geospatialMapViewer settings, typed with the CMA additions. */
export function cmaMapConfig(): CmaGeospatialMapConfig {
  return environment.geospatialMapViewer as CmaGeospatialMapConfig;
}
