---
title: "Generate QR codes on demand"
layout: post
featured-image: /assets/post-media/2023-05-29/cover_lg.jpg
featured-thumbnail: /assets/post-media/2023-05-29/cover_sm.jpg
description: Javascript solution
categories: javascript vue
---

## The Challenge

If you need a simple solution to create QR codes on demand in your webapp, read on to learn how we created a reusable Vue component for the platform [veganmonkey.co](https://veganmonkey.co){:target="\_blank"}.

## The Solution

Install the package [node-qrcode](https://github.com/soldair/node-qrcode){:target="\_blank"}. It will take care of the QR code generation itself. Since we use the Vue.js framework, we decided to use [vue-qrcode](<[(veganmonkey.co)](https://veganmonkey.co){:target="_blank"}>){:target="\_blank"} which is based on node-qrcode:

```
npm i @chenfengyuan/vue-qrcode
```

You can find specific implementation for React and other frameworks as well.

We wanted a reusable component that can be used anywhere on the platform where we'll need QR codes. For this example, we are using it to generate QR codes that leads to restaurant menus that the restaurants can then use on flyers and in-restaurant signs. We show it only for owners of the menu currently viewed.

This is the code for the reusable component, we call it GenerateQR.vue:

```
<template>
  <div class="mb-4 d-flex flex-column">
    <button
      class="btn btn-secondary mb-2"
      @click="initiateShowQR"
      v-if="!showQR"
    >
      <i class="bi bi-qr-code me-2"></i>Generate QR Code
    </button>
    <vue-qrcode :value="url" :options="{ width: 300 }" v-if="showQR" />
    <button
      class="btn btn-secondary mb-2"
      @click="showQR = false"
      v-if="showQR"
    >
      Close
    </button>
  </div>
</template>
<script>
import VueQrcode from "@chenfengyuan/vue-qrcode";
import { ref } from "vue";

export default {
  components: {
    VueQrcode,
  },
  setup() {
    const showQR = ref(false);
    const url = ref("");

    //function to pass url into the qr generator and display it
    const initiateShowQR = () => {
      //grab current window url
      url.value = window.location.href;
      //show the qr code
      showQR.value = true;
    };

    return { initiateShowQR, showQR, url };
  },
};
</script>
```

_(we use Bootstrap for the styling)_

The template is a button to click to show the QR code. When clicked, it will use the url of the current page as input to send to the imported _vue-qrcode_ component from the package we installed earlier. Note that here you could exchange this current URL for user input or any other input that you want to generate QR for. When the button is clicked, the QR will show. We hide the "Generate QR Code" button and show "Close" instead.

<img class="" src="/assets/post-media/2023-05-29/show-qr.png"/>
_Click to show QR_

<img class="" src="/assets/post-media/2023-05-29/close-qr.png"/>
_Click to close QR_

Now you can import and use this component anywhere you want like this:

```
<GenerateQR v-if="isOwner" />
```

_Here we have a check to only show this option to owners of the restaurant_
