// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
// // import location ref. env
// import * as Location from "expo-location";
// // constanstn to read OpenWeaterAPi--
// import Constants from "expo-constants";
// // import createApiClient from "../services/apiClient";
// import weatherService from "../services/weatherService";
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Button, Image } from "react-native";
import * as Location from "expo-location";
import Constants from "expo-constants";

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

// /***EXAMPLE API RES
//  *
// {
//    "coord": {
//       "lon": 7.367,
//       "lat": 45.133
//    },
//    "weather": [
//       {
//          "id": 501,
//          "main": "Rain",
//          "description": "moderate rain",
//          "icon": "10d"
//       }
//    ],
//    "base": "stations",
//    "main": {
//       "temp": 284.2,
//       "feels_like": 282.93,
//       "temp_min": 283.06,
//       "temp_max": 286.82,
//       "pressure": 1021,
//       "humidity": 60,
//       "sea_level": 1021,
//       "grnd_level": 910
//    },
//    "visibility": 10000,
//    "wind": {
//       "speed": 4.09,
//       "deg": 121,
//       "gust": 3.47
//    },
//    "rain": {
//       "1h": 2.73
//    },
//    "clouds": {
//       "all": 83
//    },
//    "dt": 1726660758,
//    "sys": {
//       "type": 1,
//       "id": 6736,
//       "country": "IT",
//       "sunrise": 1726636384,
//       "sunset": 1726680975
//    },
//    "timezone": 7200,
//    "id": 3165523,
//    "name": "Province of Turin",
//    "cod": 200
// }

export default function MapScreen() {
  /**states
     *DECLARE loading (bool)
  DECLARE error (string | null)
  DECLARE coords ({ latitude, longitude } | null)
  DECLARE weather (Weather | null)
    */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coord, setCoord] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);

  // ---- helpers -----------

  // FetchDAta -----
  const reqLocation = async () => {
    // request permission @ pop-up
    const { status } = await Location.requestBackgroundPermissionsAsync(); //defiend @ app.json
    // /IF not granted => "permission denied"
    if (status !== "granted") {
      throw new Error("Location Permission denied ❌...");
    }
    // IF granted -----
    const getPos = await Location.getCurrentPositionAsync({
        // gets let/lon from users phone
        accuracy: Location.Accuracy.Balanced,
      });
      //   retun current @Loaction params
      return {
        latitude: getPos.coords.latitude,
        longitude: getPos.coords.longitude,
      };
  };

  // Req. fetchWeather ---------
  const getWeather = async (lat: number, lon: number) => {
    //   return the fetchedc Data
    // const { lat, lon } = await reqLocation();
    // //   appi call - https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key} (oW. Docs / exmpale)
    // const res = await fetch(
    //   `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}`
    // );
    // const wthrData = await res.json();
    // console.log(wthrData);
    // Pass key to retrive info/data @Constatns
    const key = await Constants.expoConfig?.extra?.weatherApiKey;
    if (!key)
      throw new Error(
        "WHoops! oh no... missing your OpenWeather API key in app.json 'extra' - double-check."
      );
    const url = `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}`;
    //OpnWth: Docs fetch xmple:https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
    // respo --> axios GEt
    const res = await fetch(url);
    // IF !ok => THROW with status
    if (!res.ok) throw new Error(`Weather API failed (${res.status}`);
    // pasres to json data --> pass dat to "Weatehr"
    const json = (await res.json()) as Weather;
    setWeather(json);
  };

// LOAD STATE as new Data gets laoded ------- 

  async function loadData = async ()=>{
// load state @ start + error hndl(off) ---
setLoading (true);
setError(null)
//    trycatch blcok for laoding data / graceful eror hadnling 
try {
    // fetch location -- from @reqLoc..
   const {latitude, longitude} = await reqLocation();
   
    // update state w/ data=> set coordinate
    setCoord({latitude, longitude});
    await getWeather(latitude, longitude)

} catch (error:any) {
setError (error?.message?? "Oh no... something went wrong... shall we try again?")
}finally(
    setLoading(false)
)
  // ---- effects ----
  useEffect(() => { 
    // @mount
   console.log("Wheather Key?", Constants.expoConfig?.extra?.weatherApiKey ? "Loaded ✅- Yes!" : "Missing Key ❌ 🔑")
   loadData()
  }, [])

  // ---- UI render branches ---- IF loading vs ERROR----

//   RENDER:
//   Title "Your Location"
//   IF you have a Mapbox public key:
//     show static map image using coords
//   ELSE:
//     show simple box with lat/lon text
//   Show basic weather block (city, country, icon, temp, description, feels-like)
//   "Refresh" button → calls load()

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
        <Text> Hey! Please chill out 😎 and hold a moment ⏳ while we are getting your location📍 & 🌤️weather…</Text>
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
    <Text style={{ fontWeight: "700" }}> 🥺❌ Couldn’t load map & weather</Text>
    <Text style={{ textAlign: "center", color: "#666" }}>{error}</Text>
    <Button title="Retry" onPress={loadData} />
    </View>
);

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
</View>
);
}
   }
  
