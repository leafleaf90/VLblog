---
title: "Migrate from Vue CLI to Vite"
layout: post
featured-image: /assets/post-media/2023-06-28/cover_lg.jpg
featured-thumbnail: /assets/post-media/2023-06-28/cover_sm.jpg
description: Lightning speed!
categories: vue
---

## What ain’t broken…

I stuck with Vue CLI for quite a while even after Vite was released because why fix what ain’t broken, right? But after having migrated I wish I’d done so sooner. Start time is A LOT faster due to the native ES module support, where the browser takes care of part of the job of a bundler and Vite can serve source code on demand instead of bundling it all at once. It’s almost instant.

## What is Vite?

Just like Vue CLI, [Vite](https://vitejs.dev/guide/){:target="\_blank"} is a build tool. It scaffolds boilerplate when you start a new project (so that you get the folder structure and everything needed to get started) and compiles your code for development and production. Vite is framework-agnostic and works with other front-end frameworks as well, such as Angular and React. It was developed by Evan Yue, creator of the Vue framework, and is nowadays the officially recommended build tool for Vue projects.

## Should you update?

If you start a new project, you should definitely go with Vite. If you follow the official docs from Vue you don’t have to worry, it’ll be Vite-powered when you run create-vue. If you have an older project that uses Vue CLI that you intend to keep maintaining, I’d recommend switching, as Vite is way faster and the migration is not that bad.

## How I migrated

This might differ a bit depending on your environment. For example, I use Bootstrap which added some steps, and you will likely have some other dependencies that you have to take into account in the process. I followed most steps in Daniel Kelly’s excellent walkthrough over at [vueschool.io](https://vueschool.io/articles/vuejs-tutorials/how-to-migrate-from-vue-cli-to-vite/){:target="\_blank"} but with some differences due to other dependencies and versioning.

### 1. Update dependencies in package.json

For me, these were the devDependencies I changed:

```
// package.json

"devDependencies": {
    "@vue/cli-plugin-babel": "~4.5.0", REMOVED
    "@vue/cli-plugin-router": "~4.5.0", REMOVED
    "@vue/cli-service": "~4.5.0", REMOVED
    "@vue/compiler-sfc": "^3.2.31", REMOVED
    "sass-loader": "^8.0.2" REMOVED
    "@vitejs/plugin-vue": "^4.2.3", ADDED
    "vite": "^4.3.9", ADDED
}
```

In addition to the obvious old cli dependencies, we can also remove sass-loader since Vite has built-in support for CSS pre-processors.

Note that if you’re migrating a Vue 2 project, you’d also have to add the "vite-plugin-vue2".

If you use eslint, there are other dependencies you can remove at this step, please see the previosly mentioned guide at [vueschool.io](https://vueschool.io/articles/vuejs-tutorials/how-to-migrate-from-vue-cli-to-vite/){:target="\_blank"}.

### 2. Vite.config.js

Add a new file in the root of your project, name it vite.config.js. These are the lines I added:

```
// vite.config.js

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "[YOUR BASE URL]",
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    alias: {
           "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Again, if yours' is a Vue 2 project, you’ll need to define that here (described in Daniel Kelly’s article).

The alias setting to resolve @ paths above is needed for imports using @ alias (example: import myComposableFunction from "@/composables/myComposableFunction"). Note the require(“path”) as well, needed for the path.resolve.

The extensions options within resolve is needed if you are importing components without explicitly specifying the .vue file extension. For example, if you define a single-file component import as:

```
import MyComponent from "@/components/MyComponent";
```

This works with Vue CLI, but Vite requires the .vue file extension here. One option (and the recommended one) is to go through and fix this in all your files, so that the import will be:

```
import Spinner from "@/components/Spinner.vue";
```

The extensions resolve in the config file above is a workaround for this, but the official Vite docs say: “Note it is NOT recommended to omit extensions for custom import types (e.g. .vue) since it can interfere with IDE and type support.” I have to admit I went with the workaround here as I have dozens of views and components with multiple imports.

### 3. Index.html changes

While Vue CLI keeps the index file in the public folder, Vite does so in the root of the project. Move it out.

Inside of the html.index, htmlWebpackPlugin.options references won’t work with Vite, so we change these to hardcoded values. Example:

From:

```
// index.html

<strong> We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
```

To:

```
// index.html

<strong> We're sorry but this app doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
```

Same for any other references you have to <%= htmlWebpackPlugin.options.title %>

The same goes for any <%= BASE_URL %> references. These needs to be replaced by absolute paths. Example:

From:

```
// index.html

<link rel="apple-touch-icon" sizes="180x180" href="<%=  BASE_URL %>apple-touch-icon.png"/>
```

To:

```
// index.html

<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

And you will need to explicitly import the JavaScript that initializes your app, which was not needed with Vue CLI. Add this:

```
// index.html

<head>
//…
<script type="module" src="/src/main.js"></script>
//…
</head>
```

### 4. build, run and serve scripts

The old Vue CLI commands for spinning up the dev server and building needs to be changed for the Vite commands.

```
// package.json

"scripts": {
    "serve": "vue-cli-service serve", REMOVE
    "build": "vue-cli-service build" REMOVE
    "dev": "vite --host", ADD
    "build": "vite build", ADD
    "serve": "vite preview" ADD
  },
```

Note I had to add _—host_ to the dev script here to make it run on URL localhost for Firebase Authentication to work.

Where you previously ran _npm run serve_, you will now run _npm run dev_, as serve will give you a production preview (the production build, served locally).

### 5 .env variables

Everywhere you access environment variables from your .env files, you will need to change the prepended route:

From:

```

process.env.MY_KEY

```

To:

```

import.meta.env.MY_KEY

```

And the naming of env variables exposed to client is changed:

From:

```

VUE_APP_MY_KEY = 1234

```

To:

```

VITE_MY_KEY = 1234

```

## Additional steps

That’s it for the general steps.

I also had to jump through the below hoops to get some other libraries and dependency sto work:

### Bootstrap and Bootstrap Icons

Bootstrap has official docs on this [here](https://getbootstrap.com/docs/5.3/getting-started/vite/){:target="\_blank"}.

You have to either change your import statements in the following way:

From:

```

@import "~bootstrap/scss/functions";

```

To:

```

@import "node_modules/bootstrap/scss/functions";

```

Or add an alias resolve to _vite.config.js_:

```

In vite.config.js, add
// vite.config.js
//…
export default defineConfig({
//…
resolve: {
alias: {
//..
"~bootstrap": path.resolve(**dirname, "node_modules/bootstrap"),
"~bootstrap-icons": path.resolve(
**dirname,
"node_modules/bootstrap-icons"
),
}
}
})

```

### Vue router

If you use process.env.BASE_URL in the creation of the router, like this:

```

const router = createRouter({
history: createWebHistory(process.env.BASE_URL),
routes,
});

```

You can’t use _process.env_ any longer (as explained in the env file section above). You can change it to just:

```

const router = createRouter({
history: createWebHistory(),
routes,
});

```

### Static assets (no require in source code)

Anywhere you’re using require to get a static asset will have to be changed. You can read more [here](https://vitejs.dev/guide/assets.html){:target="\_blank"} and [here](https://vitejs.dev/guide/features.html#static-assets){:target="\_blank"}.

Basically the require call (which is is not available for you here as it's part of ESM and Vite serves source code over ESM) needs to go. Example:

If you used to have:

```

:style="{'Background-image': `url('${require(`@/assets/image.jpg`)}')`}"

```

You now need to construct the URL as such:

```

new URL('../assets/image.jpg', import.meta.url).href

```

To make it easier, I created a composable that can be called where needed:

```

const staticAssetPath = (path) => {
return new URL(path, import.meta.url).href;
};

export default staticAssetPath;

```

You can then call it from your template like so:

```

:style="{ 'background-image':'url(' + staticAssetPath('../assets/marketplace.jpg') + ')',}"

```

You can run this search and replace (remember to import the composable in all files where it's used as well):

<img class="" src="/assets/post-media/2023-06-28/vite-require.png"/>

This worked in dev mode for me, but when building, there was still an issue with the base url, and I ended up moving all my static files to the public folder, as suggested here:
[Vite docs - The Public Directory](https://vitejs.dev/guide/assets.html#the-public-directory){:target="\_blank"}

### Firebase Auth

As mentioned above, I had to run dev on localhost url by adding —host to the dev script:

```

//package.json
//...
"scripts": {
"dev": "vite --host",
"build": "vite build",
"serve": "vite preview"
},

```

All done!

## The result

Build time with Vue CLI vs Vite:

<img class="" src="/assets/post-media/2023-06-28/vue-cli-vs-vite-compile-time.png"/>

## Other guides

In addition to Daniel Kelly’s guide, here are two some other guides on the same procedure, and they might bring up certain points and challenges that I did not have that you might face depending on your case:

["From vue-cli to vitejs" by Cedric Nicoloso](https://medium.com/nerd-for-tech/from-vue-cli-to-vitejs-648d2f5e031d){:target="\_blank"}

["Vue-cli ▶ Vite Migration" by Ankita Srivastava](https://medium.com/nerd-for-tech/from-vue-cli-to-vitejs-648d2f5e031d){:target="\_blank"}
