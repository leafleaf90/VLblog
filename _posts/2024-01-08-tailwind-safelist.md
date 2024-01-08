---
title: "Tailwind Safelist"
layout: post
featured-image: /assets/post-media/2024-01-08/cover_lg.jpg
featured-thumbnail: /assets/post-media/2024-01-08/cover_sm.jpg
description: Watch out! Your class might be missing.
categories: coding
---

**The problem**

After having scratched my head in confusion more than once over this particular problem, I thought I'd better document it so that I remember it.

This situation can arise as a Tailwind user when you apply dynamic classes to your html. For example. In a Vue template with a dynamic class binding:

```
<div class="w-full h-full" :class="`bg-${color.code}`"></div>
```

Tailwind only generates classes that it can scan and find in the project (to reduce file size). For dynamic classes, it means that they might not exist unless they are used statically elsewhere.

**The solution**

The first time I ran into this problem, I thought I was going crazy when my classes did not apply, until I found this in the Tailwind docs:
[Tailwind Configuration - Safelisting classes](https://tailwindcss.com/docs/content-configuration#safelisting-classes)

The documentation mentions:
“These situations are rare, and you should almost never need this feature.”

Well…

So in your Tailwind config file (if you don’t have one, create it in the root of your project) you add to the safelist like this:

```
// tailwind.config.ts

import type { Config } from "tailwindcss";

module.exports = {
  content: [],
  safelist: [
    "bg-red-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-white",
  ],
 } satisfies Config;

```

Remember to restart the development server after the changes are done.
