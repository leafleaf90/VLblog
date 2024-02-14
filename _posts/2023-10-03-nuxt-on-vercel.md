---
title: "Deploy Nuxt on Vercel"
layout: post
featured-image: /assets/post-media/2023-10-03/cover_lg.jpg
featured-thumbnail: /assets/post-media/2023-10-03/cover_sm.jpg
description: Great option for SSR apps
categories: nuxt hosting
---

I recently moved my SSR Nuxt3 applications from Firebase hosting over to Vercel, as the Firebase hosting requires some gymnastics to work with server-side rendering (you need to use Google Cloud function to reroute to the hosting). The deployment process to Vercel is more straightforward:

**1.** Sign up at [vercel.com/signup](https://vercel.com/signup){:target="\_blank"}

**2.** Install the Vercel CLI in your project if you want the option of interacting with the Vercel project from the command line. Run in the terminal:

`npm i -dev--save vercel`

**3.** Make sure you have your code pushed to a Git repository (use your favorite git provider, I use Github).

**4.** Create a new project in Vercel and connect it to your Git repository. You can do this from the Vercel interface.

**5.** Vercel will auto-detect deploy settings for you when you choose Nuxt.js as the project framework. You might have to override some settings depedning on your local setup though, the standard settings didn’t work for me. These are the settings I went with:

<img class="" src="/assets/post-media/2023-10-03/vercel_settings.png"/>
_Vercel deployment settings_

**6.** Add the environment variables to Vercel. Since you won’t push your .env file to Github, it won’t be available to Vercel at build and runtime. Go to Environment Variables within the project settings and you can either add the variables manually, or upload your .env file to automatically populate the fields. You can choose which environment each variable is for (Production, Preview, Development).

**7.** I had to make a slight change to variables that are exposed to the client. For example the Firebase API key, which is defined in the runtimeConfig in nuxt.config.js:

```
//nuxt.config.js
export default defineNuxtConfig({
  runtimeConfig: {
    // The private keys which are only available within server-side
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    // Keys within public, will be also exposed to the client-side
    public: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    },
  },
…`
})
```

In the local environment, I didn’t have to pre-pend public to key, but for the Vercel app to pick up the API key in the client, I had to change config.FIREBASE_API_KEY to config.public.FIREBASE_API_KEY in the plugins that use this key:

```
export default defineNuxtPlugin((nuxtApp) => {
const config = useRuntimeConfig();

const firebaseConfig = {
apiKey: config.public.FIREBASE_API_KEY,
...
};
…
})
```

_(note that it’s safe to expose the Firebase API key to the client. In fact, it is necessary for users to be able to interact with the database. You set database security rules in Firebase.)_

**8.** When you push to Github, Vercel will build and deploy the application as preview. You can then promote to production if all works well. For more advanced use cases, you can utilize GitHub Actions to create custom CI/CD workflows that works with the Vercel deployments. Read more [here](https://vercel.com/guides/how-can-i-use-github-actions-with-vercel){:target="\_blank"}. If you have a headless CMS or similar content solution, you can also use deployment hooks to automate deployment when content changes. Read more [here](https://vercel.com/docs/deployments/deploy-hooks){:target="\_blank"}.

NOTE: if you use Prisma in your project, you will most likely run into an issue fetching data. You will have to run the `prisma generate` script on build time. You can add it locally in your package.json or in Vercel deployment settings. See more [here](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/vercel-caching-issue){:target="\_blank"}.

UPDATE: when I published a Nuxt Content website to Vercel recently, I got this build error:

```
[error] Cannot find module @rollup/rollup-linux-x64-gnu. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
```

To solve it I had to add this to the optionalDependencies in package.json:

```
//package.json
"optionalDependencies": {
    "@rollup/rollup-linux-x64-gnu": "4.6.1"
  },
```
