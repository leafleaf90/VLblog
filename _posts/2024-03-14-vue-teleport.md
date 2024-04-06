---
title: "🚀 Vue Teleport"
layout: post
is_series: true
series_title: "Building Vegan Monkey"
featured-image: /assets/post-media/2024-03-1/cover_lg.jpg
featured-thumbnail: /assets/post-media/2024-03-14/cover_sm.jpg
description: Put the content where it needs to go
categories: vue
---

**Background**

In [this post]({% post_url 2023-06-01-localstorage %}) we explored how to persist user settings for location and language using only localstorage and listeners to listen for changes of the settings. This is an overly verbose method which soon becomes difficult to maintain. A much smoother way is to utilize a state management tool, such as [Pinia](https://pinia.vuejs.org/). Pinia lets you set up and manage stores easily, and you won't need any explicit event listeners set up. Below we will take a look at how we implemented Pinia for the location and language states on [_**Vegan Monkey**_](https://app.veganmonkey.co){:target="\_blank"}.

### 1. Install Pinia and set up the root store

Start by installing Pinia in your project. In the terminal:
{% highlight javascript %}
pnpm install pinia
{% endhighlight %}
_(Adapt to your package manager)_

{% highlight vue %}
//app.vue
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
{% endhighlight %}
_(For us, Vue devtools only picked up Pinia when we created the root store inside of app.use)_

Now you're ready to start using stores in your app.

### 2. Set up your first store

We keep the stores in a folder ("stores") in src. One .js file per store. For our case, we create three stores and three files city.js, country.js, language.js. From each file we export the store:
{% highlight javascript %}

//src/stores/countries.js
import { defineStore } from "pinia";
import getCollectionAsync from "@/composables/getCollectionAsync";
import { ref } from "vue";

//create countryStore in Pinia
export const useCountryStore = defineStore("countryStore", () => {
//store refs
const availableCountries = ref([]);
const selectedCountry = ref(null);
const showCountrySelector = ref(false);

//function to get available countries from db
const getCountries = async () => {
//function to fetch countries from db
const { error, documents } = await getCollectionAsync(
"countries",
null,
null,
null
);
documents.value.forEach((country) => {
//only push active countries
if (country.active) {
availableCountries.value.push(country);
}
});

//save the available countries to session storage (to not require db fetch on reload)
sessionStorage.setItem(
"availableCountries",
JSON.stringify(availableCountries.value)
);

//set the selected country to Thailand by default
let countryToSelect = availableCountries.value.find(
(c) => c.title === "Thailand"
);
setSelectedCountry(countryToSelect);

//show the country selector, since the user hasn't set a country by themselves yet
showCountrySelector.value = true;

};

//function to set the country in the store and in local storage
const setSelectedCountry = (country) => {
selectedCountry.value = country;
localStorage.setItem("selectedCountry", JSON.stringify(country));
showCountrySelector.value = false;
};

//check if there are availableCountries stored in session storage
if (
sessionStorage?.availableCountries &&
typeof sessionStorage?.availableCountries !== typeof undefined &&
sessionStorage?.availableCountries !== "undefined"
) {
//assign to availableCountries
availableCountries.value = JSON.parse(sessionStorage.availableCountries);

//check if there's a selectedCountry stored in local storage
if (
localStorage?.selectedCountry &&
typeof localStorage?.selectedCountry !== typeof undefined &&
localStorage?.selectedCountry !== "undefined"
) {
//assign to selectedCountry
selectedCountry.value = JSON.parse(localStorage.selectedCountry);
}
//if no country set in local storage, use Thailand as default
else {
let countryToSelect = availableCountries.value.find(
(c) => c.title === "Thailand"
);
setSelectedCountry(countryToSelect);
//show the country selector, since the user hasn't set a country by themselves yet
showCountrySelector.value = true;
}

}
//if no countries are stored in session storage, fetch them
else {
getCountries();
}

//function to toggle the showCountrySelector between true/false
const toggleCountrySelector = () => {
showCountrySelector.value = !showCountrySelector.value;
};

return {
availableCountries,
selectedCountry,
showCountrySelector,
setSelectedCountry,
toggleCountrySelector,
};
});
{% endhighlight %}

The city and language stores are dependent on the country store. If country changes, city and language needs to adapt. For this, we use the country store in the city and language stores, and react to the changes that happen. For an example of this, let's look at how the city changes when country changes.

### 3. Use a store in another store (composing stores)

Time to set up the city store. In addition to the same imports as in the country store, we also need to import the country store and a Pinia composable function called storeToRefs when we create the city store:

{% highlight javascript %}
import { useCountryStore } from "@/stores/country";
import { storeToRefs } from "pinia";
{% endhighlight %}

storeToRefs allow you to destructure a store while keeping the refs reactive. This is needed if you want to watch the ref or use it in a computed ref (when using the store refs in the template you can use them directly and they will still be reactive, no need for storeToRefs).

Then we create the store in the same way as for the country store:

{% highlight javascript %}
//create cityStore with Pinia
export const useCityStore = defineStore("cityStore", () => {
...
})
{% endhighlight %}

To destructure the store while keeping reactivity of the ref:

{% highlight javascript %}
const { selectedCountry } = storeToRefs(countryStore);
{% endhighlight %}
_(In this case, we destructure for selectedCountry which is a ref in the contry store)_

Now we can watch for changes in the selectedCountry property of the countryStore:
{% highlight javascript %}
watch(selectedCountry, () => {
//do what you need here
});
{% endhighlight %}
_(Remember to import watch from vue as well)_

Here is the full code for the city store:

{% highlight javascript %}
import { defineStore } from "pinia";
import getCollectionAsync from "@/composables/getCollectionAsync";
import { ref, computed, watch } from "vue";
import { useCountryStore } from "@/stores/country";
import { storeToRefs } from "pinia";

//create cityStore with Pinia
export const useCityStore = defineStore("cityStore", () => {
// initialize countryStore
const countryStore = useCountryStore();
const { selectedCountry } = storeToRefs(countryStore);

//store refs
const availableCities = ref([]);
const selectedCity = ref("");

//watch for changes in the selected country, and trigger the setSelectedCity function
watch(selectedCountry, () => {
setSelectedCity();
});

//function to get available cities from db
const getCities = async () => {
const { error, documents } = await getCollectionAsync(
"cities",
null,
null,
null
);
//only use active cities
documents.value.forEach((city) => {
if (city.active) {
availableCities.value.push(city);
}
});

//save the available cities to session storage (to not require db fetch on reload)
sessionStorage.setItem(
"availableCities",
JSON.stringify(availableCities.value)
);

//set city after fetching all available cities
setSelectedCity();

};

//function to set the city in the store and in local storage
const setSelectedCity = (cityToSet) => {
//if no city specified, set the main city in current country
if (!cityToSet) {
selectedCity.value = availableCities.value.find((city) => {
return (
city.country === countryStore?.selectedCountry.id && city?.mainCity
);
});
} else {
selectedCity.value = cityToSet;
}
localStorage.setItem("selectedCity", JSON.stringify(selectedCity.value));
};

//computed property to get the relevant cities for the selected country
const relevantCities = computed(() => {
if (availableCities.value.length > 0 && countryStore.selectedCountry) {
return availableCities.value.filter(
(city) => city.country === countryStore.selectedCountry.id
);
}
});

//check if there are availableCities stored in session storage
if (
sessionStorage?.availableCities &&
typeof sessionStorage?.availableCities !== typeof undefined &&
sessionStorage?.availableCities !== "undefined"
) {
availableCities.value = JSON.parse(sessionStorage.availableCities);

// if there's already a city selected, use it
if (
localStorage?.selectedCity &&
typeof localStorage.selectedCity !== typeof undefined &&
localStorage.selectedCity !== "undefined"
) {
selectedCity.value = JSON.parse(localStorage.selectedCity);
}
// else, use the main city registered on the country
else {
setSelectedCity();
}

} else {
//if no cities are stored in session storage, fetch them
getCities();
}

return {
availableCities,
selectedCity,
relevantCities,
setSelectedCity,
};
});

{% endhighlight %}

### 4. Using the stores

You can now use the stores in any components that need this data. The initialization of the stores works the same as in the city store above where we used the country store. For example, in our navbar we use all three stores, so we import and initialize them in our script setup:

{% highlight vue %}

<script setup>
import { useCountryStore } from "@/stores/country";
import { useCityStore } from "@/stores/city";
import { useLanguageStore } from "@/stores/language";

const countryStore = useCountryStore();
const cityStore = useCityStore();
const languageStore = useLanguageStore();
</script>

{% endhighlight %}

Now you can use the store in your template. It will be reactive if you refer to it in the template:

{% highlight vue %}

<li v-for="city in cityStore.relevantCities" :key="city.id">
<a
  class="dropdown-item"
  @click="cityStore.setSelectedCity(city)"
  href="#"
>
{% raw %}
{{ city[`title${languageStore.activeLanguage?.reference}`] }}
{% endraw %}
</a>
</li>
{% endhighlight %}

_(Example of the list for our dropdown button to select city)_

Note that if you need the ref to be reactive for use in the script setup (to watch, or use in a computed prop) you need to destructure it as described above.

### 5. Comparison to old method

The ease of managing everything relating to the store in one file, and then just import and use the properties wherever, makes it much more scalable than the previous method where you have to remember to set up event listeners for any change. With Pinia installed you can also simplify other parts of the app where you need data in several places, or want it stored in the browser when you navigate away from a page etc.

### 6. Demo

See it working in the web app:
<img src="/assets/post-media/2024-03-13/stateExample.gif"/>

You can check this live at [_**veganmonkey.co**_](https://app.veganmonkey.co){:target="\_blank"} as well
