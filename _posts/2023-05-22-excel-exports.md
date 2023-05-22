---
title: "Excel Exports - Vue + Firebase solution"
layout: post
is_series: true
series_title: "Dev Tricks"
featured-image: /assets/post-media/2023-05-22/excel.jpg
featured-thumbnail: /assets/post-media/2023-05-22/excel.jpg
description: Utilize a cloud function to generate CSV files on-demand
categories: coding vue firebase
---

## "Exports, please!"

If you are building an app where the user can manage data, they will most likely ask for Excel/flat file imports and exports sooner or later. Here is an easy way to allow for CSV exports in a Vue front-end with Firebase data. It’s the way we handle it on Vegan Monkey [(veganmonkey.co)](https://veganmonkey.co){:target="\_blank"}.

In the product management section, we have the CSV Export button which will export all products for the user. When the user presses this button, it will call a cloud function that will generate the file for us and serve it to the user. To make this button reusable, as we might want to export as CSV from multiple places in the app, we have the button as its own little component:

```
<template>
  <div class="d-flex">
    <button
      v-if="!downloadURL && !generateCSVLoading"
      class="btn btn-secondary"
      @click="saveExportDoc()"
    >
      <i class="bi bi-file-earmark-excel me-2"></i>CSV Export
    </button>
    <Spinner v-if="generateCSVLoading" class="ms-2" />
    <a
      :href="downloadURL"
      v-if="downloadURL && !generateCSVLoading"
      class="btn btn-primary text-white ms-2"
    >
      <i class="bi bi-file-earmark-excel me-2"></i>Download CSV
    </a>
  </div>
</template>
```

This article will not focus on the CSS at all, but you can see here that we use bootstrap for the styling

This component takes three props so that we can generate exports from any collection we want:

```
props: ["operator", "queryValue", "collection", "field"]
```

In this case, we use the component like this from the parent view:

```
<exportCSV
      operator="=="
      :queryValue="user.uid"
      collection="products"
      field="userId"
    />
```

So what happens in the component? Unless there’s already a download URL available (file already generated) or we’re in the process of generating the file, we show the export button:

<img class="" src="/assets/post-media/2023-05-22/csv-export.png"/>

<img class="" src="/assets/post-media/2023-05-22/csv-export2.png"/>

If the request is currently being handled by the back-end, we show a spinner (separate component), and if we already have a download URL for the file, we show the download button. downloadURL and generateCSVLoading are ref variables defined locally in the component’s setup:

```
setup(props) {
    const generateCSVLoading = ref(false);
    let exportRecordId = null;
    const downloadURL = ref(null);
…}
```

When the user clicks the CSV Export button, we call the function saveExportDoc().

```
//save export doc to db, returns the document id
const saveExportDoc = async () => {
generateCSVLoading.value = true;
const { error, addDoc: addExport } = useCollection("file_exports");

      let recordToExport = {
        operator: props.operator,
        queryValue: props.queryValue,
        collection: props.collection,
        field: props.field,
      };

      let exportRecord = await addExport(recordToExport);
      exportRecordId = exportRecord.id;
      getDownloadUrl();
    };

```

This is an asynchronous function. First, we set generateCSVLoading to show the spinner in front-end. Then we call our composable function useCollection for a collection we have created in the Firebase database called file_exports. This gives us access to the Firebase .add functionality that allows us to add documents to Firebase. We create the object recordToExport that we will save to the collection mentioned above in Firebase. This object consists of the values passed to the component via props. We await the adding of the document to the Firebase collection, and retrieve the id of the document back and assign it to the local variable exportRecordId. At the very end of the function, we call another function: getDownloadUrl().

When the document is added to the file_exports collection, it will trigger a cloud function (node) that creates the CSV file with the help of the [async parser package](https://juanjodiaz.github.io/json2csv/#/parsers/node-async-parser){:target="\_blank"} and puts it in a storage bucket:

```
const functions = require("firebase-functions");
const { AsyncParser } = require("@json2csv/node");

exports.createCSV = functions
  .region("asia-southeast2")
  .firestore.document("file_exports/{exportId}")
  .onCreate(async (snap, context) => {
    // set main variables
    const newExport = snap.data();
    const collectionToExportFrom = newExport.collection;
    const fieldToQuery = newExport.field;
    const queryValue = newExport.queryValue;
    const operator = newExport.operator;
    const exportId = context.params.exportId;
    const fileName = collectionToExportFrom + "_" + exportId + ".csv";
    const tempFilePath = path.join(os.tmpdir(), fileName);

    // reference export record in Firestore
    const exportRef = db.collection("file_exports").doc(exportId);

    // reference storage bucket
    var bucket = admin.storage().bucket("YOUR-BUCKET-NAME");

    // query collection
    const snapshot = await db
      .collection(collectionToExportFrom)
      .where(fieldToQuery, operator, queryValue)
      .get();

    if (snapshot.empty) {
      console.log("No matching documents");
      return;
    }

    const arrayToExport = [];

    snapshot.forEach((doc) => {
      let item = doc.data();
      let imageURL = null;
      if (item.image && item.image.url) {
        imageURL = item.image.url;
      }
      let refinedItem = {};
      refinedItem.id = doc.id;
      refinedItem.name = item.title;
      refinedItem.description = item.description;
      refinedItem.prices = item.prices;
      refinedItem.imageURL = imageURL;
      arrayToExport.push(refinedItem);
    });

    const opts = {
      // option to transform the data and choose fields in the json2csv step (choosing to do it above step instead)
      // transforms: [prepareCsvData()],
      // fields: [
      //   { label: "Vegan Monkey ID", value: "id" },
      //   { label: "Product Name", value: "title" },
      //   { label: "Product Description", value: "description" },
      //   { label: "Product Prices", value: "prices" },
      //   "image.url",
      // ],
    };
```

The getDownloadUrl function called from the front-end takes it from here:

```
const getDownloadUrl = async () => {
  timeoutTime.value = timeoutTime.value * 2;
  try {
    downloadURL.value = await generateDownloadUrl();
    generateCSVLoading.value = false;
  } catch (err) {
    console.log(err);
    setTimeout(() => {
      generateDownloadLink();
    }, timeoutTime.value);
  }
};
```

This asynchronous function calls the function that generates the download link (generateDownloadUrl) at increasing time intervals to allow time for the file to be created in the storage. It will keep calling generateDownloadUrl until it finds it (i.e. until it has been created by the cloud function.

```
const generateDownloadUrl = async () => {
  try {
    let storageRef = projectStorage.ref(
      "/exports/" + "products_" + exportRecordId + ".csv"
    );
    let url = await storageRef.getDownloadURL();
    return url;
  } catch (err) {
    console.log(err.message);
    throw "file not ready yet";
  }
};
```

When the file is found in the storage, we get a reference to the storage location, and then use the Firebase function getDownloadURL() to get the URL that we assign to our variable url. At this point the user will see the button switch from spinner to “Download CSV”:

<img class="" src="/assets/post-media/2023-05-22/csv-export3.png"/>
