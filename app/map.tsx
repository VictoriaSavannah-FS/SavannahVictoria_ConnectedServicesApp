// import weatherService from "../services/weatherService";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
// import * as Location from "expo-location"; will nto use - will use coords isntead
import Constants from "expo-constants";

// impeoer maps --nevermidn - wokrs o IOS only / not webb
// import { AppleMaps, GoogleMaps } from "expo-maps";
// /import service/locaiton servci
import { getUserLocation, type Coords } from "../services/location";

// Mapbox helpers / logic- ---
import {
  staticMapUrl,
  reverseGeocode,
  type RevGeoCodeRes,
} from "../services/mapboxService";

// DEfine Tyoes
type Weather = {
  name: string;
  sys: { country: string };
  weather: { description: string; icon: string }[];
  main: { temp: number; feels_like: number };
};

// Icon ref from opneWeather ----
const iconUrl = (icon: string) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`;

export default function MapScreen() {
  /**state types
   */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // EXACt COOrds
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  // New MapRender sates
  const [place, setPlace] = useState<RevGeoCodeRes>(null); // reverse geocode

  const [mapUrl, setMapUrl] = useState<string | null>(null); ///stsic IMG

  const [weather, setWeather] = useState<Weather | null>(null);

  // ---- helpers -----------

  // FetchDAta ----- USing the getUSerLocation from mapxServices! :)
  // const reqLocation = async () => {
  //   // request permission @ pop-up -foreground X background-----
  //   const { status } = await Location.requestForegroundPermissionsAsync(); //defiend @ app.json
  //   // /IF not granted => "permission denied"
  //   if (status !== "granted") {
  //     throw new Error("Location Permission denied ❌...");
  //   }
  //   // IF granted -----
  //   const getPos = await Location.getCurrentPositionAsync({
  //     // gets let/lon from users phone
  //     accuracy: Location.Accuracy.Balanced,
  //   });
  //   //   retun current @Loaction params
  //   return {
  //     latitude: getPos.coords.latitude,
  //     longitude: getPos.coords.longitude,
  //   };
  // };

  // Req. fetchWeather ---------
  const getWeather = async (lat: number, lon: number) => {
    const key = Constants.expoConfig?.extra?.weatherApiKey;
    if (!key)
      throw new Error(
        "WHoops! oh no... missing your OpenWeather API key in app.json 'extra' - double-check."
      );

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`;
    // respo --> axios GEt
    const res = await fetch(url);
    // IF !ok => THROW with status
    if (!res.ok) throw new Error(`Wheather API failed (${res.status})`);
    // pasres to json data --> pass dat to "Weatehr"
    const json = (await res.json()) as Weather;
    setWeather(json);
  };

  // ---- effects ---- run@mount
  useEffect(() => {
    // @mount
    console.log(
      "Wheather Key?",
      Constants.expoConfig?.extra?.weatherApiKey
        ? "Loaded ✅- Yes!"
        : "Missing Key ❌ 🔑"
    );
    console.log(
      "Mapbox token present?",
      !!Constants.expoConfig?.extra?.mapboxToken
    );
    console.log(
      "Weather key present?",
      !!Constants.expoConfig?.extra?.weatherApiKey
    );
    loadData();
  }, []);

  // LOAD STATE as new Data gets laoded -------

  const loadData = async () => {
    // load state @ start + error hndl(off) ---
    setLoading(true);
    setError(null);
    //    trycatch blcok for laoding data / graceful eror hadnling
    try {
      // fetch location -- from @reqLoc..
      // location service
      const { latitude, longitude } = await getUserLocation();
      setCoords({ latitude, longitude }); //update state w/ data

      /**INSET the MapBOx Map - satic  */
      const url = staticMapUrl({
        latitude: latitude,
        longitude: longitude,
        zoom: 13,
        width: 600,
        height: 360,
      });
      setMapUrl(url);

      // ------ APply REverseGEOCODe ------
      //   const addy = await reverseGeocode(setCoords);//SETTER - wrongX
      const addy = await reverseGeocode({ latitude, longitude }); //SETTER - wrongX
      setPlace(addy);
      //   weather fet-----
      await getWeather(latitude, longitude);
    } catch (error: any) {
      setError(
        error?.message ?? "Oh no... something went wrong... shall we try again?"
      );
    } finally {
      setLoading(false);
    }

    // ---- UI render branches ---- IF loading vs ERROR----

    //  EXPORT MapScreen*/

    if (loading)
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <ActivityIndicator />
          <Text>
            {" "}
            Hey! Please chill out 😎 and hold a moment ⏳ while we are getting
            your location📍 & 🌤️weather…
          </Text>
        </View>
      );

    //   IF error -> show message + "Retry" button calling load()

    if (error)
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            gap: 8,
          }}
        >
          <Text style={{ fontWeight: "700" }}>
            🥺❌ Couldn’t load map & weather
          </Text>
          <Text style={{ textAlign: "center", color: "#666" }}>{error}</Text>
          <Button title="Retry" onPress={loadData} />
        </View>
      );
  };
  // --------- MAIUN UI RENDER ----------
  return (
    <View style={{ padding: 24, alignItems: "center", gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}> 📍 Your Location</Text>
      {coords && (
        <View
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
          }}
        >
          <Text>
            lat: {coords.latitude.toFixed(6)} | lon:{" "}
            {coords.longitude.toFixed(6)}
          </Text>
        </View>
      )}
      {/* ADD --- MaPBOX Static IMG render  */}
      {mapUrl ? (
        <Image
          source={{ uri: mapUrl }}
          // types - wrong
          //   style={{ width: "80%", height: "200", borderRadius: "10" }}
          style={{ width: 80, height: 200, borderRadius: 10 }}
          //   resizeMethod="cover"
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.card, { alignItems: "center" }]}>
          <Text>Map unavailable (check your Mapbox token @expo.extra)</Text>
        </View>
      )}
      {/* --- ADD HUMAN READBLE ADDY info ---- */}
      <View style={styles.card}>
        <Text style={styles.h2}>Nearest Place</Text>
        <Text style={{ color: "#333" }}>{place?.placeName ?? "—"}</Text>
      </View>
      {/* WEHATER RENDER --- */}
      {weather && (
        <View style={{ alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            {weather.name}, {weather.sys.country}
          </Text>
          <Image
            source={{ uri: iconUrl(weather.weather[0].icon) }}
            style={{ width: 70, height: 70 }}
          />
          <Text style={{ fontSize: 44, fontWeight: "200" }}>
            {Math.round(weather.main.temp)}°
          </Text>
          <Text style={{ textTransform: "capitalize", color: "#555" }}>
            {weather.weather[0].description}
          </Text>
          <Text style={{ color: "#666" }}>
            😎 Feels like {Math.round(weather.main.feels_like)}°
          </Text>
        </View>
      )}
      <Button title="Refresh" onPress={loadData} />
      {/* WEBB platform == compptibility NOTe ---  */}
      {Platform.OS === "web" && (
        <Text style={styles.webNote}>
          Web tip: Static map works everywhere. For interactive panning/zooming,
          you’d add Mapbox GL JS separately — not required for this assignment.
        </Text>
      )}
    </View>
  );
}

// STYLES -------

const styles = StyleSheet.create({
  //Container ---
  centerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
  },
  //   Text/mssges----
  loadingText: { color: "#444", textAlign: "center" },
  errorTitle: { fontWeight: "700", marginBottom: 8 },
  errorMsg: { color: "#666", textAlign: "center", marginBottom: 10 },
  h1: { fontSize: 20, fontWeight: "700" },
  h2: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  //   CARd ---
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  webNote: { fontSize: 12, color: "blue", marginTop: 8 },
});

// https://docs.expo.dev/versions/latest/sdk/maps/
