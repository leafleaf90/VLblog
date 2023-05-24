---
title: "OpenAI - Integrate to Vue front-end"
layout: post
is_series: true
series_title: "Dev Tricks"
featured-image: /assets/post-media/2023-05-24/cover-lg.jpg
featured-thumbnail: /assets/post-media/2023-05-24/cover-sm.jpg
description: Utilize a cloud function to call the OpenAI endpoints
categories: coding vue openai
---

## Powering our "Insta Mode"

On our platform [(veganmonkey.co)](https://veganmonkey.co){:target="\_blank"} we offer restaurants some inspiration for their social media posts. In addition to the regular product and menu management, we have what we call the Insta Mode:

<img class="half-image" src="/assets/post-media/2023-05-24/get-caption.gif"/>

The user can scroll through all their products in what looks like an Instagram feed. The initial caption is their current product description. By clicking “New AI Caption” they get a new caption with popular hashtags, all based on the ingredients they have listed and the current description.

Follow the below steps to implement a similar service in your webapp. This project uses Vue.js and Firebase, along with node.js cloud functions.

## API Access

First, you’ll need to sign up for a developer account at https://openai.com/. Generate an API key and save it in your project’s .env file.

You can’t call the Open AI endpoints from the front-end for security reasons (to not expose your API key), so you’ll have to do this from server-side. In this case, we use a cloud function that we can call from our front-end with the relevant product information to create our caption.

## Server-side

The cloud function looks like this:

```
exports.getDishCaption = functions
  .region("asia-southeast2")
  .https.onCall(async (data, context) => {
    // set openai API key (from .env file)
    const configuration = new Configuration({
      apiKey: process.env.OPEN_AI_KEY,
    });

    // create openai API instance
    const openai = new OpenAIApi(configuration);

    let languagesInput = "";

    // if user has selected multiple languages for the caption
    if (data.language && data.language.numberOfLanguages > 1) {
      languagesInput =
        "Generate the caption in " +
        data.language.numberOfLanguages +
        " languages. The languages are: " +
        data.language.title +
        ". Do a line break after each language caption. Start each caption right away without stating what language the caption is in, for example, don't start " +
        "the caption with 'English Caption:' or 'English:'. Include hashtags only one time, after the last language caption (don't add any hashtags after the other language captions).";
    }
    // if user has selected only one language for the caption
    else if (data.language && data.language.numberOfLanguages === 1) {
      languagesInput =
        "Generate the caption in " +
        data.language.title +
        " language. Start the caption right away without stating what language the caption is in.";
    }

    try {
      // generate caption using the openai API endpoint
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful, trendy, social media content creator that creates Instagram posts captions. Provide only one caption at a time. " +
              "Provide 5 hashtags at the end of the caption that will maximize visibility on Instagram. Hashtags should be only in English language. Don't ask anything, just provide a caption that is ready to post as is. " +
              "Don't use any double quotes for the content (don't use \"). The products are vegan, so if you mention anything that sounds like animal products, make sure to say it's vegan.",
          },
          {
            role: "user",
            content:
              "Create an instagram caption for a " +
              data.productType +
              " which has the following name: " +
              data.title +
              ". You can take some inspiration from how I describe it: " +
              data.description +
              "'. But make sure to add your own twist to it. I categorize this as a " +
              data.productSubType +
              languagesInput,
          },
        ],
      });
      const [choice] = completion.data.choices;
      const caption = choice.message ?? "no response";
      return {
        status: 200,
        body: { result: caption },
      };
    } catch (e) {
      if (e.response) {
        return { status: e.response.status, body: error.response.data };
      } else {
        return {
          status: 500,
          body: {
            error: { message: "An error occur, please try again later." },
          },
        };
      }
    }
  });
```

We check user input in terms of how many languages are selected, what product is selected and what properties it has. This gets fed to the Open AI endpoint as the user role. As system role, we send the same instructions with each request.

Note that the error handling here is quite generic, you might want to implement more specific error messages.

## Front-end

```
<button
  class="btn btn-secondary"
  @click="getCaption()"
>
  Try First
</button>
```

The button triggers a getCaption function:

```
const getCaption = async () => {
let productTypeName = await getProductTypeName(
          props.product.productType
        );
        let productSubTypeName = await getProductSubTypeName(
          props.product.ProductSubType[0]
        );
        try {
          const response = await getCaption({
            title: props.product.title,
            description: props.product.description,
            productType: productTypeName,
            productSubType: productSubTypeName,
            language: language.value,
          });
          console.log(response.data);
          if (response.data.status == 200) {
            aiCaption.value = response.data.body.result.content;
          } else {
            aiCaption.value =
              "Sorry, we couldn't generate a caption for this product. Please try again later." +
              response.data.body;
          }
          loadingAICaption.value = false;
        } catch (e) {
          console.log(e);
          loadingAICaption.value = false;
          aiCaption.value =
            "Sorry, we couldn't generate a caption for this product. Please try again later.";
        }
}
```

This will update the reactive variable aiCaption for the user to see.
