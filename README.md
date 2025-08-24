# ConnectedServicesApp

Repo for a comprehensive mobile application using Expo that demonstrates the core concepts from Module 3.

## Platforms Testesd on ---

This app was tested on iOS (mobile) and Web (browser) and includes weather integration, map/location services, camera + QR scanning, Firebase authentication, and Firestore storage.

## FEATURES ---

Weather API (OpenWeatherMap):

- Display current weather w/ user’s location
- Forecast data
- Location Services (Expo Location + Mapbox):
- Get user’s current location with permission handling
- Show location on static maps
- Reverse geocoding for human-readable addresses
- Maps Integration: Static Mapbox map on both iOS + Web
- Error Handling: Graceful handling of denied permissions or API failures
- Auth: currently using Firebase Anonymosu User enabled

## Device Hardware Accesss

- Camera Integration (Expo Camera):
- Take photos and scan QR codes
- Works across mobile and web (browser fallback for QR scanning)
- QR Code Scanning:
- Decode URL, email, and phone QR codes types
- Open directly in browser, email, or phone
- Save scans to Firestore with timestamps for history view
- Photo Metadata: "EXIF" (basic) Retrieve location/timestamp data

## Custom Backend Services (Firebase)

- Authentication: Anonymous sign-in via Firebase Auth
- Firestore Database: Store user preferences and QR scan history
- API Key Security: Keys stored in Firebase / local .env during dev
- Functions: Ready for expansion with Firebase Functions as backend proxies

### Resources

- [https://docs.expo.dev/guides/using-firebase/]
- [https://firebase.google.com/docs/web/]
- [https://firebase.google.com/support/dynamic-links-faq]
- [https://firebase.google.com/docs/projects/dev-workflows/general-best-practices]
- [https://firebase.google.com/docs/reference/js/app.firebaseserverapp]
- [https://openweathermap.org/current]
- [https://docs.expo.dev/versions/latest/sdk/camera/]
- [https://docs.expo.dev/versions/latest/sdk/location/]
- [https://docs.expo.dev/versions/latest/sdk/maps/]
- [https://labs.mapbox.com/developer-cheatsheet/]
- [https://docs.mapbox.com/api/maps/styles/]
- [https://docs.mapbox.com/api/maps/static-images/]
- [https://docs.mapbox.com/api/search/geocoding/]
- [https://docs.mapbox.com/api/search/geocoding/#geocoding-response-object]
- [https://github.com/expo/fyi/blob/main/firebase-js-auth-setup.md]
- [https://sasandasaumya.medium.com/building-a-qr-code-scanner-with-react-native-expo-df8e8f9e4c08]
- [https://sasandasaumya.medium.com/react-native-expo-maps-app-with-user-location-markers-and-google-maps-directions-ee020f6fd1ec]
