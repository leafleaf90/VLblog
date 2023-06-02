---
title: "Persist user settings with localStorage"
layout: post
featured-image: /assets/post-media/2023-06-01/cover_lg.jpg
featured-thumbnail: /assets/post-media/2023-06-01/cover_sm.jpg
description: A walkthrough
categories: javascript vue
---

## The Challenge

Sometimes your user makes a choice in your webapp that you want to persist, so that they do not need to make it again even if they refresh the browser or step away for a while. If you're working with authenticated users, you might want to save some of these settings on the user object in your database so that it carries over to all devices that user might log in from. But for guest users or for some simple layout or user experience settings, it can be enough to just save the setting to the browser's [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage){:target="\_blank"}.

_Note: If you have a larger webapp you will most likely utilize more advanced state management for this. For vue, you can choose for example [VueX](https://vuex.vuejs.org/){:target="\_blank"} or or [Pinia](https://pinia.vuejs.org/){:target="\_blank"} (Pinia is the recommended option even by the official Vue docs at this point)._

## The Solution

On [veganmonkey.co](https://veganmonkey.co){:target="\_blank"} we have a language setting in the navbar. We save the setting to localStorage and on refresh we check to see if language is already set, and if so we apply the chosen language. The method below is for Vue, but localStorage is a Web API with full support across browsers.

Since the navbar is where the user set language, we let the navbar component handle the logic for fetching from localStorage.

In the setup function of the navbar component, we initiate the activeLanguage variable:

```
const activeLanguage = ref(null);
```

### Saving to localStorage

Here is the template elements that make up the dropdown for language selection (Bootstrap 5.0 used for styling):

```
{% raw %}
<div
  class="dropdown p-2 position-relative top-0 end-0"
  v-if="activeLanguage"
>
  <button
    class="btn btn-secondary dropdown-toggle d-flex justify-content-center align-items-center h-100"
    type="button"
    id="dropdownMenuButton1"
    data-bs-toggle="dropdown"
    aria-expanded="false"
    style="font-size: 0.9rem"
  >
    <i class="bi bi-translate me-2"></i>
    <span class="d-none d-md-inline-block">{{ activeLanguage.native}}</span>
    <span class="d-md-none d-inline-block">{{ activeLanguage.code }}</span>
  </button>
  <ul
    class="dropdown-menu"
    aria-labelledby="dropdownMenuButton1"
    role="menu"
  >
    <li v-for="language in availableLanguages" :key="language.code">
      <a
        class="dropdown-item"
        @click="activeLanguage = language"
        href="#"
        >{{ language.native }}</a
      >
    </li>
  </ul>
</div>
{% endraw %}
```

Here's how it looks to the user:

<img class="" src="/assets/post-media/2023-06-01/navbar-translation.png"/>
_Language selector_

As you can see in the code, when the user clicks a language in the dropdown, we set the clicked language to activeLanguage. But this will only set activeLanguage in the component, we also need to explicitly save it to localStorage. We set a watcher on activeLanguage so that we can _do something_ whenever it changes:

```
watch(activeLanguage, () => {
      //when user changes language, save it to localstorage
      localStorage.setItem(
        "activeLanguage",
        JSON.stringify(activeLanguage.value)
      );
    });
```

_Note that we have to convert the language object to JSON to save it to localStorage_

This will save the activeLanguage object to localStorage. But how about other components and views that also need to adapt to this change? Here's where the benefit of proper state management becomes clear, when the state of activeLanguage could be easily accessed from anywhere in the app. However, for this use case we can also dispatch this change as a custom event that other components can listen for. We add these lines in the same watch as above:

```
//we need to dispatch the change for any components that listen to it
      window.dispatchEvent(
        new CustomEvent("localstorage-language-changed", {
          detail: {
            storage: localStorage.getItem("activeLanguage"),
          },
        })
      );
```

Here we dispatch this event together with the activeLanguage item in localStorage.

So now we make sure to overwrite the activeLanguage in localStorage whenever the user changes it, and we also fire an event that can be listened to from other components.

Now we need to make sure to set the activeLanguage to the saved language on browser refresh or when the user opens up a new session and arrives to the app:

```
onMounted(() => {
  //if there's language set in localStorage, use it
  if (localStorage.activeLanguage) {
    activeLanguage.value = JSON.parse(localStorage.activeLanguage);
  }
  //else use the first language in the list
  else {
    activeLanguage.value = availableLanguages[0];
  }
});
```

But how do we react to language changes in the navbar and localStorage in other components? First we'll listen to this change in the main App component:

```
// intiate activeLanguage
const activeLanguage = ref(null);

// function to set activeLanguage from localstorage when event fires
const setActiveLanguageFromLocalStorage = () => {
  activeLanguage.value = JSON.parse(event.detail.storage);
};

onMounted(() => {
  //listen for changes of language in localstorage and change activeLanguage as needed
  window.addEventListener(
    "localstorage-language-changed",
    setActiveLanguageFromLocalStorage
  );
});

onUnmounted(() => {
  window.removeEventListener(
    "localstorage-language-changed",
    setActiveLanguageFromLocalStorage
  );
});
```

When App is mounted, we set up the listener, which will pick up the event fired from navbar on any activeLanguage change. On this event, we run the function _setActiveLanguageFromLocalStorage_ which sets activeLanguage locally in the component.

We pass the activeLanguage ref into the router-view:

```
<router-view
  :activeLanguage="activeLanguage"
/>
```

Now, in any view directly accessed via Vue Router, we can utilize this prop. For example, in the setup of our Landing.vue:

```
props: {
    activeLanguage: {
      type: Object,
    },
}
```

To make this a ref that is reactive to changes, we use toRef (remember to import toRef from ):

```
setup(props) {
  window.scrollTo(0, 0);

  const activeLanguage = toRef(props, "activeLanguage");
}
```

This is enough to adapt the landing view to language changes. This ref can now also be returned to the template and passed into components used in Landing.

_Note: you can also utilize sessionStorage. The difference between localStorage and sessionStorage is that localStorage will keep the information in the browser until cache is cleared while sessionStorage does survive a browser refresh, but is cleared when closing the tab. SessionStorage is also contained in the current tab, so if the user opens another tab of your app, the data will not be stored there._
