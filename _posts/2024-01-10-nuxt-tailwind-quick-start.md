---
title: "Nuxt + Tailwind"
layout: post
featured-image: /assets/post-media/2024-01-10/cover_lg.jpg
featured-thumbnail: /assets/post-media/2024-01-10/cover_sm.jpg
description: Get up and running
categories: coding
---

If you want to get up and running quickly with a new web project, it is usually a good idea to utilize a CSS framework. Apart from being able to decrease your time to market, it also relieves some concerns about cross-browser compatibility. You have several CSS frameworks to choose from. Bootstrap is a popular option, and I used it for a long time. Recently I’ve been reaching more often for Tailwind. I find it to be less opinionated and gives me a bit more freedom to achieve what I want. Try them both out and then choose the one you like better and stick with it, as most of the benefits come when you learn the utility classes by heart and don’t have to consult the docs all the time. Mixing the two can become confusing.

**Installing Nuxt**
Install the latest version of Nuxt. The recommended way to initiate a Nuxt project is with the Nuxi CLI.

```
pnpm dlx nuxi@latest init <project-name>
```

_(you need node v18.0.0 or newer, and choose the package manager you want, I use pnpm)_

At the time of writing this, the latest Nuxt version is 3.9.1. You can check which version was installed for you by going to the package.json file created during the project's initialization.

Go into the project folder

```
cd <project-name>
```

Install dependencies
Once in the project folder, install any project dependencies using your package manager of choice:

```
pnpm install
```

You can now start your app in development mode:

```
pnpm dev -o
```

That’s it in terms of getting Nuxt up and running. Now for Tailwind.

**Installing Tailwind**

Install the Tailwind module for Nuxt:

[Docs here](https://nuxt.com/modules/tailwindcss){:target="\_blank"}

```
pnpm add --save-dev @nuxtjs/tailwindcss
```

You have to add @nuxtjs/tailwindcss to the modules section of the nuxt.config file. If you just started your project, the config file should look like this after you’ve added the module:

```
//nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss'
  ]
})
```

To get Intellisense (help with all the classes etc.) for Tailwind, install the Tailwind Intellisense extension in VS Code, info [here](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss){:target="\_blank"}.

Initialize Tailwind with:

```
npx tailwindcss init --ts
```

This will create a tailwind.config file where you can do further Tailwind modifications.

You can now start the app in development mode if it’s not already running:

```
pnpm dev -o
```

You should see a Nuxt welcome screen at localhost:3000 (or whichever local url the dev server starts at in your case).

To make sure that Tailwind is indeed working, you can get rid of the Welcome code in app.vue and create a simple div:

```
<div class="bg-black text-white m-10 d-flex">TEST</div>
```

You should see a div with a black background and white text, looking something like:
<img class="half-image" src="/assets/post-media/2024-01-10/test_tailwind.png"/>

Find all Tailwind utility classes here:
[Tailwind docs](https://tailwindcss.com/docs/preflight){:target="\_blank"}

Now you’re ready to start developing!

If you want to learn how to add a component library to further speed up the process, check my post on that [here]({% post_url 2024-01-10-daisyui %}).
