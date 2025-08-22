import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import createApiClient from "../services/apiClient";

// DEfine fucntion / logic
// createApiClient(baseURL: any, options?: {}): AxiosInstance
const weatherApi = createApiClient(
  "https://https://api.openweathermap.org/data/3.0"
);
/** PSEUDO CODE -----
 * TO DO:
 *
 *
 */

export default function MapScreen() {
  /** PSEUDO CODE -----
   * TO DO:
   * setup a fetch funct. to fetch data from OpenWeather API
   * handlers
   *
   */

  const res = await weatherApi.get("/weather", {
    params: {
      lat: userLat,
      lon: userLon,
      appid: process.env.EXPO_PUBLIC_WEATHER_API_KEY,
      units: "metric",
    },
  });

  // ----------------  UI REnder
  return (
    <View style={{ padding: 24 }}>
      <Text>AMps Screen </Text>
    </View>
  );
}

// STYLES -------
