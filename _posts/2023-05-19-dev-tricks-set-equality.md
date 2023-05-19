---
title: "Dev Tricks 2 - Equality of Sets"
layout: post
is_series: true
series_title: "Dev Tricks"
featured-image: /assets/post-media/2023-05-17/junior-dev-trick-1-sets-lg.jpg
featured-thumbnail: /assets/post-media/2023-05-17/junior-dev-trick-1-sets-sm.jpg
description: Equality of sets might not behave the way you expect it to
categories: programming dart
---

## The Problem

Equality of sets in Dart can be tricky to grasp. Let’s look at a simple example where we create a class:

```
class Business {
 final String name;
 final int employeesCount;

 //constructor
 Business({
   required this.name,
   required this.employeesCount,
 })
};
```

We create two instances of business:

```
  final business1 = Business(name: 'Google', employeeCount: 100);
  final business2 = Business(name: Google, employeeCount: 100);
```

If you add these to a set, businesses, you might expect the set to only hold one of these, as their variables are identical to the eye, and since sets can not contain duplicates, it wouldn’t allow it. However, if we try, we see that this is not the case:

```
  final business1 = Business(name: 'Google', employeeCount: 100);
  final business2 = Business(name: 'Google', employeeCount: 100);

  final businesses = {business1, business2};

  print(businesses); // {Business: Google, 100, Business: Google, 100}

```

The set contains both identical businesses. Why? We know that sets use hash code to determine equality. Let’s look at the hash code of the two objects:

```
  print(business1.hashCode); //198795268
  print(business2.hashCode); //641765269
```

The hash codes differ. The hashTag method sees them as different instances and thus they have different hash codes.

## A Solution

To make equality within sets more straightforward to work with for our Business objects, we can override the hashCode getter. Within the class definition, add the override:

```
  @override
  int get hashCode => Object.hash(name, employeeCount);

With the override, we try the hasCodes again:
  print(business1.hashCode); //409927635
  print(business2.hashCode); //409927635
```

We now have the same hash codes for the business objects, since we now look at the hash of the name and the employee variables within the object.

However, if you try to put them both in the same set, they will still both appear. Why? Well, sets work not only with the hash code, but also with the equality operator (==). We need to override the equality operator for this class to get what we expect.

```
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Business &&
          name == other.name &&
          employeeCount == other.employeeCount;
```

What this does is that it checks is that the Object the operator applies to (left-hand side) and the right-hand side (“other”) is either identical as specified by the core Dart identical function or that it is a business object that has equality for both variables inside of it.

After implementing this, if you now try to put them both into a set, only one will be added to the set as the equality check does resolve to true.
