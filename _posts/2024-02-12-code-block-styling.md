---
title: "Styled code blocks"
layout: post
is_series: true
series_title: "Building this blog"
featured-image: /assets/post-media/2024-02-12/cover_lg.jpg
featured-thumbnail: /assets/post-media/2024-02-12/cover_sm.jpg
description: Rouge with Jekyll
categories: coding jekyll
---

I used to show style my code snippets with some very simple CSS. It looked something like this:

<img  src="/assets/post-media/2024-02-12/codeSnippet1a.png"/>

This was done with minimal styling (background color, font) on the html tag \<code\>. This does not provide any granular control or ability to do language-based styling though. Luckily, there is an easy way to achieve much better styling for code blocks in Jekyll, with support for around 200 different languages. Since version 3, Jekyll uses [Rouge](https://github.com/rouge-ruby/rouge) for syntax highlighting out of the box. All you need to do to get advanced html tagging for your code blocks is:

{% raw %}
{% highlight \<language\> %}

YOUR CODE

{% endhighlight %}
{% endraw %}

For example

{% raw %}
{% highlight javascript %}

YOUR JAVASCRIPT CODE

{% endhighlight %}
{% endraw %}

_(P.S. If you ever need to write out liquid tags like above, enclose the part with raw and endraw liquid tags)_

If you do this and inspect your code, you will see that it has been tagged and is ready for advanced styling:

<img  src="/assets/post-media/2024-02-12/codeTagging.png"/>

Now we only need to apply a CSS theme that will style these tags. You can see a list of available themes [here](https://github.com/mzlogin/rouge-themes){:target="\_blank"}. You can also create your own styles if you wish to do so. Next, use the Rouge-command "rougify" to create a CSS-file with the theme you choose:

{% highlight javascript %}

> rougify style base16.dark > base16_dark.css{% endhighlight %}

This will create the file in your project root. I prefer to place it in the assets folder. Now you just need to include it in your html. In my default layout html file I add this:

{% highlight html %}
// default.html

<head>
…
    <link rel="stylesheet" href={{ "assets/base16_dark.css" | relative_url }} />
… 
</head>
{% endhighlight %}

The code snippet we looked at in the beginning of this post now looks like this:
{% highlight javascript %}
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

Note that I’ve styled the code elements and the .highlight class (Rouge class) further in my main CSS file to make sure it scrolls if the code block is wide and also add some rounding to the corners of code blocks because I like the look of it:

{% highlight css %}
code {
padding: 1.5rem;
display: block;
overflow: auto;
}

.highlight {
border-radius: 25px;
margin: 0px;
}
{% endhighlight %}
