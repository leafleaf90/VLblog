---
title: "Vue pagination component"
layout: post
is_series: true
series_title: "Building 15 Pages"
featured-image: /assets/post-media/2024-02-11/cover_lg.jpg
featured-thumbnail: /assets/post-media/2024-02-11/cover_sm.jpg
description: Reusable pagination
categories: coding vue
---

If you are developing an application doing any kind of data presentation in the front-end, you will almost always need pagination to break the data up into smaller chunks for the user to browse. It might be both for improved UX but also for data loading reasons, to load the data on-demand when user goes between the pages. On [**15 Pages**](https://www.15pages.com){:target="\_blank"}, we have it in the list of the user’s saved books, for example. To be able to reuse the functionality in other places, we placed it in a component that can be dropped in wherever we need it. It looks like this:

<img  src="/assets/post-media/2024-02-11/pagination.gif"/>

We use Vue’s meta-framework Nuxt for **15 Pages**, and for styling, we use Tailwind together with DaisyUI. Read more about using Tailwind with Nuxt [here]({% post_url 2024-01-10-nuxt-tailwind-quick-start %}) and about DaisyUI [here]({% post_url 2024-01-10-daisyui %}).

We want to handle all the logic in the pagination component, and only share the information required to the parent. In this case, the parent component is a table of all the user’s books. The parent needs to know which range of books to display. We use a v-model for two-way binding on the pagination component, which will allow this use case (read the official Vue docs on two-way binding for components [here](https://vuejs.org/guide/components/v-model.html){:target="\_blank"}).

First, let’s take a look at the logic in the script setup part of the pagination component:

{% highlight vue %}
//Pagination.vue

<script setup>
//define the props
const props = defineProps({
  //we set default value to 10 for elements per page
  elementsPerPage: { type: Number, default: 10 },
  totalElements: { type: Number, required: true },
});

//define the models for the start and end range,
//the values will be reflected in the parent component as well
const startRange = defineModel("startRange", { type: Number, required: true });
const endRange = defineModel("endRange", {
  type: Number,
  required: true,
});

//define the currentPage ref, we always start at first page
const currentPage = ref(1);

//watch the currentPage and update the start and end range accordingly
watch(currentPage, () => {
  startRange.value = (currentPage.value - 1) * props.elementsPerPage;
  endRange.value = currentPage.value * props.elementsPerPage;
});

//define the computed numPages, which is the total number of pages and
//is calculated using the totalElements and elementsPerPage
const numPages = computed(() => {
  return Math.ceil(props.totalElements / props.elementsPerPage);
});
</script>

{% endhighlight %}

Here is the template of the pagination component:

{% highlight vue %}
//Pagination.vue
<template>

  <div class="w-full flex justify-center mt-5">
    <div class="join">
      <button
        class="join-item btn"
        @click="currentPage = currentPage - 1"
        :disabled="currentPage <= 1"
      >
        «
      </button>
      <button class="join-item btn">{{ currentPage }} ({{ numPages }})</button>
      <button
        class="join-item btn"
        @click="currentPage = currentPage + 1"
        :disabled="currentPage >= numPages"
      >
        »
      </button>
    </div>
  </div>
</template>
{% endhighlight %}

We disable the “previous page” button when we know there is no previous page (when current page is 1) and the “next page” button when we know there’s no next page (deducted using the numPages computed property), by using the :disabled attribute.

From the parent, in this case the book table, we use the Pagination component in the template part:

{% highlight vue %}
// parent template
<Pagination
      :totalElements="allUserBooks.length"
      v-model:startRange="startBookRange"
      v-model:endRange="endBookRange"
    />
{% endhighlight %}

We use a v-for to loop over and display all books, and it’s in this v-for we need to use the start and end ranges to cut off the list according to the startRange and endRange from the pagination component. For this, we use JavaScript’s slice method on the array of books (the book element itself is also a component):

{% highlight vue %}
//template of parent
<Book
  :book="book"
  v-for="book in allUserBooks.slice(
    startBookRange,
    endBookRange
  )"
  :key="book.id"
/>
{% endhighlight %}

We also need to initialize startBookRange and endBookRange in the script setup for this to work:

{% highlight vue %}
//script setup of parent
const startBookRange = ref(0);
const endBookRange = ref(10);
{% endhighlight %}

Ideas for further improvement:

- Let the user select elements per page (simple ref which value can be changed by the user with a dropdown)
- Implement your own data-fetching logic to only fetch when the user changes page (current implementation assumes all data is already in the array)

We can now use this pagination component anywhere in our app where we need pagination. Here's the full code for the pagination component if you want to use a similar solution:

{% highlight vue %}
<template>

  <div class="w-full flex justify-center mt-5">
    <div class="join">
      <button
        class="join-item btn"
        @click="currentPage = currentPage - 1"
        :disabled="currentPage <= 1"
      >
        «
      </button>
      <button class="join-item btn">{{ currentPage }} ({{ numPages }})</button>
      <button
        class="join-item btn"
        @click="currentPage = currentPage + 1"
        :disabled="currentPage >= numPages"
      >
        »
      </button>
    </div>
  </div>
</template>

<script setup>
//define the props
const props = defineProps({
  //we set default value to 10 for elements per page
  elementsPerPage: { type: Number, default: 10 },
  totalElements: { type: Number, required: true },
});

//define the models for the start and end range,
//the values will be reflected in the parent component as well
const startRange = defineModel("startRange", { type: Number, required: true });
const endRange = defineModel("endRange", {
  type: Number,
  required: true,
});

//define the currentPage ref, we always start at first page
const currentPage = ref(1);

//watch the currentPage and update the start and end range accordingly
watch(currentPage, () => {
  startRange.value = (currentPage.value - 1) * props.elementsPerPage;
  endRange.value = currentPage.value * props.elementsPerPage;
});

//define the computed numPages, which is the total number of pages and
//is calculated using the totalElements and elementsPerPage
const numPages = computed(() => {
  return Math.ceil(props.totalElements / props.elementsPerPage);
});
</script>

{% endhighlight %}
