---
title: "Dev Tricks 1 - Sets"
layout: post
is_series: true
series_title: "Dev Tricks"
featured-image: /assets/post-media/2023-05-17/junior-dev-trick-1-sets-lg.jpg
featured-thumbnail: /assets/post-media/2023-05-17/junior-dev-trick-1-sets-sm.jpg
description: A neat trick to get rid of duplicates from collections
categories: programming dart
---

## The Challenge

Imagine this: you’re at an interview for a position as a junior developer. It might be JavaScript, Rust, Python, Swift, Dart or any other reasonably modern language. You get this challenge:

_Given a list of n names, show me an efficient way to give me a collection that is guaranteed to have no duplicates._

A common (roundabout) way to solve this is to devise a function that iterates through the list and adds any new values to a new list, which can then be returned. This works, but if you know some basics about sets, you can solve this much faster.

## The Solution

A set is a type of collection, just like lists are, but with a crucial difference: they can’t have any duplicate values. Knowing this, you can just go ahead and convert the list to a set, and voila: you have what you need. The syntax will differ depending on the language, but in Dart you can use the spread operator to achieve this in one line:

```
final givenList = ['Foo', 'Bar', 'Baz', 'Foo'];
final mySet = {...givenList}
```

## Advanced

So how does Dart, in this case, decide which values can be included in the set and which ones are considered duplicates and should be left out? It uses hashing. You can check the hash value by yourself with:

```
final bar = 'Bar';
const anotherBar = 'Bar';
print(bar.hashCode); //159652034
print(anotherBar.hashCode); //159652034
```

As you can see, the hash values for ‘Bar’ are identical.

These are the same and can’t appear in the same set. However, if you change one of them to use lowercase, ‘bar’, hash code will change: 4231433. These can both appear in the same set.
