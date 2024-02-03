---
title: "Test Cloud Functions for Firebase locally"
layout: post
featured-image: /assets/post-media/2024-02-03/cover_lg.jpg
featured-thumbnail: /assets/post-media/2024-02-03/cover_sm.jpg
description: Set up in 5 steps
categories: coding firebase
---

If you’ve been writing and deploying Firebase cloud functions for your project, you know it takes a good minute (at least) to deploy changes. When in the development phase, it’s beneficial to be able to test them locally rather than deploying to Firebase with each change to run a test.

We recently updated the OpenAI functions connected to Vegan Monkey (read more about the AI functionality and working with the OpenAI API [here]({% post_url 2023-05-24-firebase-emulator-functions %}).) and here’s how the emulator was set up to be able to test it all locally before deployment:

1. When inside of your Firebase project, add emulators by running in the terminal:

```
firebase init emulators
```

It will allow you to install the emulators you need. In this case, we only talk about the functions emulator, but there are emulators for Firestore (database), the auth service and more.

Note: you need the Java runtime to run the emulators (they are based on Java). The easiest if you don’t have Java installed is to go to https://adoptium.net/ and download it from there.

2. Add any API keys and other secrets in a .env.local file inside the functions folder of your project. Add .env.local to your gitignore

```
// .gitignore
# local env files
.env.local
.env.*.local
```

3. In your firebase config file, add this to connect the emulator if you’re in development mode (this is if you are using Vite):

```
if (!globalThis.emulation && import.meta.env.MODE === "development") {
  //arguments here depend on your setup. First is the const you assigned “getFunctions(...) to,
  //second is where the functions are served, and third is the port
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);

  // set emulation flag to avoid connecting twice
  globalThis.emulation = true;
}
```

4. You can now start the emulator:

```
firebase emulators:start --only functions
```

5. To make this more convenient, you can add this to your scripts in the package.json file inside your functions folder:

```
// functions/package.json
{
…
"scripts": {
    "serve": "firebase emulators:start --only functions",
    …
   }
}
```

In your terminal you will see the local url for the emulator dashboard, and you can view the functions log. As soon as you update a function, you can test it locally.
<img class="half-image" src="/assets/post-media/2024-02-03/functions-emulator.png"/>
