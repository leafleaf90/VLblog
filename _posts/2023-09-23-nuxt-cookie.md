---
title: "Nuxt cookies and server middleware"
layout: post
featured-image: /assets/post-media/2023-09-23/cover_lg.jpg
featured-thumbnail: /assets/post-media/2023-09-23/cover_sm.jpg
description: For easy API route guards and more
categories: coding nuxt
---

Nuxt gives you many utilities and composables out of the box that simplifies development. In this article, we will look at how the useCookie composable can be used together with getCookie on the server-side as a middleware to implement route guards in your app.

**1. Save user data to cookie.**

This step will differ depending on how you handle authentication. In my case, I use Firebase, so I use the Firebase observer (onAuthStateChanged) which will run every time a user is logged in or out. Whatever way you handle authentication in your app, you can save the user information to a cookie when user data changes using useCookie (_“an SSR-friendly composable to read and write cookies_”, see the official Nuxt docs [here](https://nuxt.com/docs/api/composables/use-cookie){:target="\_blank"}).

Initiate the cookie with (I do this in a composable that handle the Firebase logic):

`const userCookie = useCookie("userCookie");`

Note that I choose to call it “userCookie”, but you can name it whatever you want.

When user auth status changes, you save the new user info to the cookie. Again, I’m using the onAuthStateChanged from Firebase which provides the user data on this change.

`//the new user info comes in the user variable from onAuthStateChanged
userCookie.value = user;`

Nuxt will automatically serialize the user data before writing it to the cookie. You can inspect this in your browser:

<img class="" src="/assets/post-media/2023-09-23/cookie.png"/>
_Cookie inspected in browser_

**2. Access cookie data server-side via middleware**

On the server-side, you can access this cookie with getCookie. [Official Nuxt docs](https://nuxt.com/docs/api/composables/use-cookie#handling-cookies-in-api-routes){:target="\_blank"}

By doing this in a middleware and adding the user info to the context passed on, you will always have access to this data in your API routes. If you don’t have a middleware folder in the server folder already, go ahead and create it. Nuxt automatically picks up files in the middleware directory.

_“Middleware handlers will run on every request before any other server route to add or check headers, log requests, or extend the event's request object.”_
[https://nuxt.com/docs/guide/directory-structure/server#server-middleware](https://nuxt.com/docs/guide/directory-structure/server#server-middleware){:target="\_blank"}

<img class="" src="/assets/post-media/2023-09-23/server-directory.png"/>
_Create the middleware folder in the server folder_

In this case, I call the file "user-middleware". You can call it whatever you want. The only thing we need to get the cookie user info and pass it on is:

`export default defineEventHandler((event) => {
const userCookie = getCookie(event, "userCookie");
event.context.user = userCookie;
});`

**3. Use the data provided by the middleware**

You can now use this data in your API routes. For example, if you want to return the user info if there’s a logged in user, and an error message if not, you can do this in your API route:

`export default defineEventHandler((event) => {
const user = event.context.user;
return user || "log in to access this page";
});`

Here you can also redirect users that are not authorized or use abortNavigation() to stop the navigation altogether.
