---
title: "Dynamic map with Mapbox and Google Sheets"
layout: post
featured-image: /assets/post-media/2020-06-24/map.jpg
featured-thumbnail: /assets/post-media/2020-06-24/map-sm.jpg
description: Easy way to use Google Sheets data to render a map, utilizing a Lambda function to cache data
categories: programming
---

## Mapbox possibilities

Mapbox is a powerful service for map rendering. You can get your account and API key [here](https://www.mapbox.com/){:target="\_blank"}. Their official documentation is great. However, I find myself having to wiggle around with the solutions to make it fit my use cases sometimes. Since there are moving parts (Google API, AWS permissions) things might change slightly and code needs to be adjusted.

This will show you how to pull location data from a published Google Sheet, save it to a CSV file in an AWS bucket with a Lambda function, and then render the map with the locations to a website. I’ll use Github pages to host the website.

There are many possibilities to improve and add functionality to the map after. You can implement directions for the user, geo-location to pinpoint the user on the map or style it with Mapbox Studio.

## Avoid CORS issues

The main issue I ran into following the official docs was CORS related. Some headers in the response from Google Sheets were not accepted for CORS reasons in the web app. This seems to be a known and [ongoing Google issue](https://issuetracker.google.com/issues/36759302){:target="\_blank"}. I also had issues with redirects, getting response code 307 — temporary redirect. It took some time adjusting the code as needed.

## Get started

The official tutorial is [here](https://www.mapbox.com/impact-tools/sheet-mapper-advanced-caching){:target="\_blank"}. This uses caching of the data in a S3 bucket. You can also follow the simple tutorial [here](https://www.mapbox.com/impact-tools/sheet-mapper){:target="\_blank"}
that does not cache data but pulls directly from Google Sheets to the website. I started with the simple version, but had the CORS issues and the cached version solved it as I could request the data from a CORS enabled bucket to the front-end.

You can mostly follow the official docs. I’ll just mark in red what I had to do differently
{:.red-text}

- Create Google Sheet. You need longitude and latitude columns, and add some other information depending on what it is you’re mapping (store names, phone numbers etc) and publish it to CSV (File->Publish to the web). You can use the [template provided](https://docs.google.com/spreadsheets/d/1MiqwGe_7m6B0xFQfaS3GGRO8CmGm5xlXPICDPEeGHyo/edit?usp=drive_web&ouid=111368174749056331625){:target="\_blank"} as a start. Publish as:

![publish](/assets/post-media/2020-06-24/publish.png "publish")

- Make sure your sharing settings are:

![share](/assets/post-media/2020-06-24/share.png "share")

- Create an S3 bucket in AWS. You will use it to store the CSV with your location information. You can use the settings exactly as in the official docs. Remember to set the CORS as explained in the docs.
- Create an AWS Lambda function. Use Python 3.8 as runtime environment and [code provided](https://github.com/mapbox/impact-tools/blob/master/lambda/sheet_mapper_advanced.py){:target="\_blank"}. In the code, change bucket name to whatever you named your bucket, put the link to your spreadsheet in and give the sheet that will be saved to the bucket a name (can be anything, as long as it has the “.csv” ending. Those are all changes mentioned in the official docs.

- {:.red-text}I also had to:

At the end of the link to the published sheet, the official docs say to include:
{:.red-text}

![retry-false](/assets/post-media/2020-06-24/retry-false.png "retry-false")

This leads to the 307 temporary redirect error:
{:.red-text}
![retry-error](/assets/post-media/2020-06-24/retry-error.png "retry-error")

I needed to set:
{:.red-text}
![retry-true](/assets/post-media/2020-06-24/retry-true.png "retry-true")

- Give permission to the Lamdba to access the bucket, same as described in the official docs.
- Set a schedule for updating the cached data, same as described in the official docs.
- Set up a new project in any code editor and start out with the template index.html file [provided](https://github.com/mapbox/impact-tools/blob/master/Sheet-Mapper-Advanced-Sample-Code.html){:target="\_blank"}
- Modify with your:

  - Mapbox access token

    ![access-token](/assets/post-media/2020-06-24/access-token.png "access-token")

  - CSV file location (in the bucket)

    ![d3](/assets/post-media/2020-06-24/d3.png "d3")

  - Mapbox style. You can use the default mapbox://styles/mapbox/streets-v11 or create your own in Mapbox Studio.

- Publish on Github pages as instructed in official docs.

  However, I had to name the project [accountname]-github.io for it to work, which will make the URL of your published page: https://[accountname].github.io/[accountname]-github.io/
  {:.red-text}

## Done

Your map will render with the locations you have set in your sheet, and adjust for any updates done in the sheet according to your Lambda schedule.

![map](/assets/post-media/2020-06-24/map.png "map")

## Next steps

Next you can start looking at customizing the look to fit your organisation or project.
