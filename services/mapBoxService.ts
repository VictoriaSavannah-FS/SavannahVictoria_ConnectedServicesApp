// services/mapboxService.ts
import Constants from "expo-constants";
import type { Coords } from "./location";

// refe to Token@ ,env
const MAPBOX_TOKEN = Constants.expoConfig?.extra?.mapboxToken;

// IF token missing -- Alert
if (!MAPBOX_TOKEN) {
  console.warn("⚠️ Missing mapboxToken in app.json -> expo.extra.mapboxToken");
}

/** Build a Static Image URL - from MApbox DOc */
/**Example request: Retrieve a static map using a bounding box with padding
The bbox parameter can be combined with padding as well. Using the same bounding box from the previous example, this request adds 50 pixels of top padding, 10 pixels of side padding, and 20 pixels of bottom padding.*/

// curl -g "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/[-77.043686,38.892035,-77.028923,38.904192]/400x400?padding=50,10,20&access_token=pk.eyJ1Ijoic2N2aWN0b3JpYSIsImEiOiJjbHozZWIzaTUxd3JpMmtwdnZwMHdheDF1In0.2-QCTp7ZOL-HlLkXm4vsvw" --output example-mapbox-static-bbox-2.png

/**
 * -username - str -The username of the account to which the style belongs.
 * style_id -The ID of the style from which to create a static map.
 * overlay - str --long - basicallty the z-order of page
 * zoom - # -Zoom level; a number between 0 and 22. Fractional zoom levels will be rounded to two decimal places.
 * - bbox- []
 * auto - #
 * width - # -Width of the image; a number between 1 and 1280 pixels.
 * ehitgh - # - Height of the image; a number between 1 and 1280 pixels.
 */

// def. types ----------

// REVERSE GEOCOde--- TYPES----
export type RevGeoCodeRes = {
  id: string;
  placeName: string; // So wE humans can REad!
  context: any[]; // Country/region/place adta
} | null; //null of NO/ data rtrn

export function staticMapUrl({
  // ref. to location.ts params -wil/pass the fetched data
  latitude,
  longitude,

  zoom = 13,
  width = 600,
  height = 400,
  style = "dark-v11", // like Style!
  marker = true,
}: Coords & {
  // eftch actual data
  zoom?: number;
  width?: number;
  height?: number;
  style?: string;
  marker?: boolean;
}): string {
  // chat error/hndling
  if (!MAPBOX_TOKEN) {
    return "about:blank"; //so not CRASHING!!
  }
  //   fethc + return data
  const base = `https://api.mapbox.com/styles/v1/mapbox/${style}/static`;
  const markerPart = marker ? `/pin-s+ff0000(${longitude},${latitude})` : "";
  const centerPart = `/${longitude},${latitude},${zoom},0`;
  const sizePart = `/${Math.round(width)}x${Math.round(height)}@2x`;
  const tokenPart = `?access_token=${MAPBOX_TOKEN}`;
  return `${base}${markerPart}${centerPart}${sizePart}${tokenPart}`;
}

/** ---------- --Reverse geocode ------- human readable - */

/** geOCODE docs --
 * https://api.mapbox.com/search/geocode/v6/forward?address_number={address_number}&street={street}&...
 * Structured Input is a type of forward geocoding search that allows you to define the feature type of each element of the search query by type. This can increase the accuracy of results for well-formed datasets. To use Structured Input, the q parameter is dropped in favor of separate parameters for each feature type.

* For best results, each element of the query must be assigned a feature type, and set autocomplete to false.
 */

// Reverse geocode (v5 Geocoding API)
// v5 puts the hierarchy in `feature.context[]` and the main label in `place_name`
export async function reverseGeocode(
  // pass lat/lon data from Coords --> pass to url values+key to fetch
  { latitude, longitude }: Coords,
  lang: string = "en" //type-cEHcks*
): Promise<RevGeoCodeRes> {
  // catcth error/hndling
  if (!MAPBOX_TOKEN) {
    throw new Error(
      "Mapbox reverse geocode failed -- doublecheck MApbox Key..."
    );
  }
  //   pass lat/lon data on API call
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
    `${longitude},${latitude}.json?language=${lang}&access_token=${MAPBOX_TOKEN}`;
  // logic - IF NOT -> throw erroe
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Mapbox reverse geocode failed (${res.status})`);
  //   else --> wait for res -> json
  const json = await res.json();
  // fetching "feature" INSIDE the GeoCodeJSON to
  //   https://docs.mapbox.com/api/search/geocoding/#geocoding-response-object
  /**"FeatureCollection", a GeoJSON type from the GeoJSON specification.
   * type: str -
   * features - [] -An array of feature objects.
   * Forward geocodes: Returned features are ordered by relevance
   * Reverse geocodes: Returned features are ordered by index hierarchy, from most specific features to least specific features that overlap the queried coordinates.
   * atribution - str - Attributes the results of the Mapbox Geocoding API to Mapbox.

   */
  const feature = json.features?.[0];
  if (!feature) return null; // If NOT MATCH <<<======

  /** Property	Type	Description
  id	- string	- Feature id. This property is named "id" to conform to the GeoJSON specification, but is the same id referred to as mapbox_id elsewhere in the response.
  * type - string=> "Feature", a GeoJSON type from the GeoJSON specification.
  * geometry- object- An object describing the spatial geometry of the returned feature.
  * geometry.type	- string- 	"Point", a GeoJSON type from the GeoJSON specification.
  * geometry.coordinates- [] - An array in the format [longitude,latitude] at the center of the specified bbox.
  * properties- object- An object containing the resulting feature's details*/

  return {
    id: feature.id as string,
    placeName: feature.place_name as string,
    context: feature.context ?? [],
  };
}

// https://docs.mapbox.com/api/maps/static-images/
// styles   https://docs.mapbox.com/api/maps/styles/
//geo-coding :https://docs.mapbox.com/api/search/geocoding/

/**XAMPLE MATCH_code -docs -- 
 * 
 *  {
  "name": "2595 Lucky John Drive",
  "place_formatted": "Park City, Utah 84060, United States",
  "match_code": {
    "address_number": "matched",
    "street": "matched",
    "postcode": "unmatched",
    "place": "matched",
    "region": "unmatched",
    "locality": "not_applicable",
    "country": "inferred",
    "confidence": "medium"
  }
}

----- FOrWard GEOCODING ----------
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "dXJuOm1ieGFkcjo5ZDQzNzM1Mi0xZGZiLTRkNTItYWMxNC01MzllZjY5ODIwMmI",
      "geometry": {
        "type": "Point",
        "coordinates": [-111.86313, 40.725163]
      },

    //   NOTT THIS ONE --- 
      "properties": {
        "mapbox_id": "dXJuOm1ieGFkcjo5ZDQzNzM1Mi0xZGZiLTRkNTItYWMxNC01MzllZjY5ODIwMmI",
        "feature_type": "address",
        "name": "974 2100 South",
        "coordinates": {
          "longitude": -111.86313,
          "latitude": 40.725163,
          "accuracy": "rooftop"
        },
        "place_formatted": "Salt Lake City, Utah 84106, United States",
        "match_code": {
          "address_number": "matched",
          "street": "matched",
          "postcode": "unmatched",
          "place": "unmatched",
          "region": "unmatched",
          "locality": "not_applicable",
          "country": "inferred",
          "confidence": "low"
        },

        --> USING THIS ONEE!! 
        "context": {
          "address": {
            "mapbox_id": "dXJuOm1ieGFkcjo5ZDQzNzM1Mi0xZGZiLTRkNTItYWMxNC01MzllZjY5ODIwMmI",
            "address_number": "974",
            "street_name": "2100 South",
            "name": "974 2100 South"
          },
          "street": {
            "mapbox_id": "dXJuOm1ieGFkcjo5ZDQzNzM1Mi0xZGZiLTRkNTItYWMxNC01MzllZjY5ODIwMmI",
            "name": "2100 South"
          },
          "neighborhood": {
            "mapbox_id": "dXJuOm1ieHBsYzpERWdNN0E",
            "name": "Fairmont",
            "alternate": {
              "mapbox_id": "dXJuOm1ieHBsYzpLMmRzN0E",
              "name": "Winfield"
            }
          },
          "postcode": {
            "mapbox_id": "dXJuOm1ieHBsYzpFU011N0E",
            "name": "84106"
          },
          "place": {
            "mapbox_id": "dXJuOm1ieHBsYzpFVmhvN0E",
            "name": "Salt Lake City",
            "wikidata_id": "Q23337",
            "alternate": {
              "mapbox_id": "dXJuOm1ieHBsYzpETE5vN0E",
              "name": "Millcreek"
            }
          },
          "district": {
            "mapbox_id": "dXJuOm1ieHBsYzpBVGdtN0E",
            "name": "Salt Lake County",
            "wikidata_id": "Q484556"
          },
          "region": {
            "mapbox_id": "dXJuOm1ieHBsYzpCa1Rz",
            "name": "Utah",
            "wikidata_id": "Q829",
            "region_code": "UT",
            "region_code_full": "US-UT"
          },
          "country": {
            "mapbox_id": "dXJuOm1ieHBsYzpJdXc",
            "name": "United States",
            "wikidata_id": "Q30",
            "country_code": "US",
            "country_code_alpha_3": "USA"
          }
        }
      }
    },
    {
      "type": "Feature",
      "id": "dXJuOm1ieGFkcjpkNjZkM2M0Zi1hNTA0LTQ3NTQtYTZjMS1iNjYwMGU2NWY4NmI",
      "geometry": {
        "type": "Point",
        "coordinates": [-111.919654, 40.725872]
      },
      "properties": {
        "mapbox_id": "dXJuOm1ieGFkcjpkNjZkM2M0Zi1hNTA0LTQ3NTQtYTZjMS1iNjYwMGU2NWY4NmI",
        "feature_type": "address",
        "name": "974 2100 South",
        "coordinates": {
          "longitude": -111.919654,
          "latitude": 40.725872,
          "accuracy": "interpolated"
        },
        "place_formatted": "South Salt Lake, Utah 84119, United States",
        "match_code": {
          "address_number": "plausible",
          "street": "matched",
          "postcode": "unmatched",
          "place": "unmatched",
          "region": "unmatched",
          "locality": "not_applicable",
          "country": "inferred",
          "confidence": "low"
        },
        "context": {
          "address": {
            "mapbox_id": "dXJuOm1ieGFkcjpkNjZkM2M0Zi1hNTA0LTQ3NTQtYTZjMS1iNjYwMGU2NWY4NmI",
            "address_number": "974",
            "street_name": "2100 South",
            "name": "974 2100 South"
          },
          "street": {
            "mapbox_id": "dXJuOm1ieGFkcjpkNjZkM2M0Zi1hNTA0LTQ3NTQtYTZjMS1iNjYwMGU2NWY4NmI",
            "name": "2100 South"
          },
          "neighborhood": {
            "mapbox_id": "dXJuOm1ieHBsYzpCVG5NN0E",
            "name": "Cannon",
            "alternate": {
              "mapbox_id": "dXJuOm1ieHBsYzpGYU5zN0E",
              "name": "Lincoln Park"
            }
          },
          "postcode": {
            "mapbox_id": "dXJuOm1ieHBsYzpFU1RPN0E",
            "name": "84119"
          },
          "place": {
            "mapbox_id": "dXJuOm1ieHBsYzpFbStJN0E",
            "name": "South Salt Lake",
            "alternate": {
              "mapbox_id": "dXJuOm1ieHBsYzpFMHRJN0E",
              "name": "Taylorsville"
            }
          },
          "district": {
            "mapbox_id": "dXJuOm1ieHBsYzpBVGdtN0E",
            "name": "Salt Lake County",
            "wikidata_id": "Q484556"
          },
          "region": {
            "mapbox_id": "dXJuOm1ieHBsYzpCa1Rz",
            "name": "Utah",
            "wikidata_id": "Q829",
            "region_code": "UT",
            "region_code_full": "US-UT"
          },
          "country": {
            "mapbox_id": "dXJuOm1ieHBsYzpJdXc",
            "name": "United States",
            "wikidata_id": "Q30",
            "country_code": "US",
            "country_code_alpha_3": "USA"
          }
        }
      }
    }
  ],
  "attribution": "NOTICE: © 2023 Mapbox and its suppliers. All rights reserved. Use of this data is subject to the Mapbox Terms of Service (https://www.mapbox.com/about/maps/). This response and the information it contains may not be retained."
}  

*/
