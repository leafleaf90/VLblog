---
title: "Reset Firebase user passwords"
layout: post
featured-image: /assets/post-media/2023-06-13/cover_lg.jpg
featured-thumbnail: /assets/post-media/2023-06-13/cover_sm.jpg
description: Easy password reset using the Firebase SDK
categories: vue firebase
---

You can trigger a password reset for your users from the client side using the sendPasswordResetEmail method from the Firebase Auth SDK. In our app we have a HTML div just below the sign in form to trigger this method:

{% highlight vue%}

<div>
        <p>Forgot password?</p>
        <button
          @click="showResetPassword = !showResetPassword"
          class="btn btn-secondary"
          v-if="!showResetPassword"
        >
          Click to reset
        </button>
        <form
          v-if="showResetPassword"
          @submit.prevent="resetPassword"
          class="text-dark"
        >
          <div class="form-floating mb-2">
            <input
              type="email"
              required
              placeholder="name@example.com"
              autocomplete="username"
              name="resetEmail"
              v-model="resetEmail"
              class="form-control"
              id="floatingResetEmail"
            />
            <label for="floatingResetEmail">Email</label>
          </div>
          <button class="btn btn-secondary">Reset</button>
        </form>
      </div>
{% endhighlight %}

<img class="" src="/assets/post-media/2023-06-13/currentLoginPage.jpg"/>

<img class="" src="/assets/post-media/2023-06-13/currentLoginPage2.jpg"/>

In your script (this example is in Vue, using \<script setup\>, composition API), import the Firebase Auth package (preferably you’d do this globally for your app in a Firebase config file). Note that this example still uses version 8 of the Firebase SDK, we have yet to switch over to the modular version 9 (preferred due to the ability to tree-shake and thus a lighter bundle).

{% highlight js%}
//import
import firebase from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
//your config here
};

firebase.initializeApp(firebaseConfig);

//create auth instance
const projectAuth = firebase.auth();
{% endhighlight %}

You can now import the auth instance into your component that will handle the password reset (same component where the HTML for showing the reset password input resides).

```
import { projectAuth } from "@/firebase/config";

//show/hide email input for the password reset
const showResetPassword = ref(false);

//initiate resetEmail variable to store the reset email of user
const resetEmail = ref("");

//function to trigger the reset email
const resetPassword = async () => {
  try {
    await projectAuth.sendPasswordResetEmail(resetEmail.value);
  } catch (error) {
    //implement your own error handling here
    console.log(error);
  }
};

```

Done! The user will get an email with the reset link when clicking the reset button.

[Official Firebase Documentation](https://firebase.google.com/docs/auth/admin/email-action-links){:target="\_blank"}
