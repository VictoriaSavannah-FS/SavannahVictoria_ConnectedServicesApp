# REFLECTION

### What was most challenging about third-party API integration?

- For me it was how time consuming some of them were to setup initially and ensuring that I was instaling the correct dev dependencies that would work with them. Apart from that, reading through all the third-part API official docs to ensure I even knew what data types to call from the API. I found myself fallign down rabbit holes time and time again lookign through the documents because of cool feautures I'd see and start reading about. It's almost intimidating and overwhelming how much information there is out there for each API (which is a great thing to have). But the fact that I'd have to dig through docs to try and find the "one" thing I really needed was a little tiring and annoying sometimes on a time-crunch. Laslty, knowing which types, and deep objects within the JSON docs to target to fetch the necessary information needed - as well a being aware of the version of the API calls. Oh! And ensuring that any declared values like {latitude and longitued} remained consistent throught the various files, components and functions to parse and fetch an API call correctly like passing the correct values to this API call.

```bash
const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=$
```

Laslty! The one gotcha was that I actually had to activte and enable the Anonymous User Profile Permission on the Firebase console first before actaully trying to test it and use it my project. Which is why it kept failing each time I was trying to Sign into the Profile screen:

```bash
# Error Mesage ----
Firebase: Error (auth/configuration-not-found).
```

### How did you handle API key security and Firebase Functions?

### What would you improve with more time?

As always, it seems like the last thing on my mind is the overall style of the app - but rather the fuctionality. Ensuring that my fuctions, componets and logic all work well enough to render and that the app is resposive and fucntional.

So two three main things. Style, theme and overall visual Aesthtics of the app, improve the Layout and fucntionality of rendering of data so it's more visually appealing - imporving overall user experience. Lastly, I'd also like to add more neat little features like the Photo album as part of the Advanced features, but I also understand that it's be a little more involved to exucute (storage, db to fetch and disply stored photo's).

### What surprised you about device hardware integration?
