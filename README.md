# Nullsafe
[![npm version](https://badge.fury.io/js/nullsafe.svg)](https://badge.fury.io/js/nullsafe)
[![Build Status](https://travis-ci.org/jkeam/nullsafe.svg?branch=master)](https://travis-ci.org/jkeam/nullsafe)
[![Coverage Status](https://coveralls.io/repos/github/jkeam/nullsafe/badge.svg?branch=master)](https://coveralls.io/github/jkeam/nullsafe?branch=master)

A nice way to do a nullsafe traversal of nested objects.

## Supported Node Versions
  * 11
  * 10
  * 9
  * 8
  * 7
  * 6

## Motivation
If you have nested objects and want a way to safely traverse it, nullsafe will help you.  Let's take an example.  Given this object:

   ```javascript
   const pet = {
     "biggest": {
        "kitty": {
          "name": "Missy"
        }
     }
   };
   ```

You would normally have to use a few null checks in order to pull the `name` (Missy) out of there.

  ```javascript
  let name;
  if (pet && pet.biggest && pet.biggest.kitty) {
    name = pet.biggest.kitty.name;
  }
  ```

Alternatively, you could also use lodash

  ```javascript
  const _ = require('lodash');
  const name = _.get(pet, 'biggest.kitty.name');
  ```

But I wanted to be able to pass around optional objects, objects that could either contain a value or not.  And I wanted these special optional objects to be safe against anything I invoked against it.

Lastly, I didn't want to care about the differences between `null` and `undefined`.  This library will treat the two as the same and always return `null` when the target (thing being wrapped) is either a `null` or `undefined`.


# Usage
Include the library and wrap your object.

  ```javascript
  const nullsafe = require('nullsafe');
  const person = {
    name: 'Jon'
  };
  const zip = nullsafe(person)
                      .get('address')  // does not exist
                      .get('zip');     // does not exist

  const isNull = zip.isNull();     // true
  const value  = zip.value;        // null
  ```


## Api

### Immediately Resolve
If you have an object, and want to immediately evaluate some path, you can.  For example:

  ```javascript
  const nullsafe = require('nullsafe');
  const nullableName = nullsafe(pet, ['biggest', 'kitty', 'name']);
  const name = nullableName.value;

  // or just this
  //   const name = nullsafe(pet, ['biggest', 'kitty', 'name']).value;
  ```

The advantage of immediately resolving the path is that no intermediate objects are created.  In this example above, no proxy objects are created for pet, biggest, or kitty; only the final attribute `name` is wrapped.


### Objects
The most common use case is for passing around objects that could be null.

  ```javascript
  const nullsafe = require('nullsafe');
  const name = nullsafe(pet)
                       .get('biggest')
                       .get('kitty')
                       .get('name').value;
  ```

The way it works is simple.  The `nullsafe` method wraps your object in a proxy.  You then call the `get` method to get the attribute you want out.  You keep doing this all the way down the chain until you are done.  Then you call `value` in order to unwrap the object.  If anywhere in the chain failed, you will get a null back when you unwrap it at the end.  Example:

  ```javascript
  const let = nullsafe(pet)
                      .get('biggest')
                      .get('doggy')
                      .get('name').value;
  ```

We don't have a doggy yet, but the traversal will not fail and will return a null at the end.  This works no matter how long the chain:

  ```javascript
  const nameOfMainAttraction = nullsafe(pet)
                                       .get('biggest')
                                       .get('parrot')
                                       .get('name')
                                       .get('otherStuffThatDoesntExist').value;
  ```


### Functions
`nullsafe` also supports function calls in the chain.

  ```javascript
  const kennel = {
    "getSupervisorInfo": () => {
      return {
        "name": "Billy",
        "shift": "Daytime"
      };
    }
  };

  const supervisorName = nullsafe(kennel).call('getSupervisorInfo').get('name').value;
  // Billy
  ```

Notice the `call` method that will invoke the `getSupervisorInfo` method.  Call then wraps the results in a proxy object that we can then chain against.  You could of course chain `get` or `call` for as long as you want.

We could also pass in parameters:

  ```javascript
  const mathFunctions = {
    "addTwo": (num) => {
      return num + 2;
    },
    "multiplyTogether": (first, second) => {
      return first * second;
    }
  };

  const math = nullsafe(mathFunctions);
  const sum = math.call('addTwo', 5).value;  // 7
  const product = math.call('multiplyTogether', 10, 4).value;  // 40
  ```

Or if you prefer apply over call, which is basically the same thing except that the arguments are all passed in a single array:

  ```javascript
  const mathFunctions = {
    "addTwo": (num) => {
      return num + 2;
    },
    "multiplyTogether": (first, second) => {
      return first * second;
    }
  };

  const math = nullsafe(mathFunctions);
  const sum = math.apply('addTwo', [5]).value;  // 7
  const product = math.apply('multiplyTogether', [10, 4]).value;  // 40
  ```


## Arrays
Array dereferencing is also supported.

  ```javascript
  const school = {
    "students": [
      {
        "name": "Jane"
      },
      {
        "name": "Robin"
      }
    ]
  };

  const firstStudentName = nullsafe(school).get('students', 0).get('name').value;  // Jane
  const bogusStudentName = nullsafe(school).get('students', 100).get('name').value;  // null
  ```

To access elements in an array, you just pass as the second argument to `get` the array index that you want to access.


## Unnested Objects
You could also use it to null check non-nested objects as well.

  ```javascript
  const nullThing = null;
  const someFunction = () => "hi";
  const someArray = [100, 200];

  const greeting = nullsafe(someFunction).call().value;  // hi
  const num = nullsafe(someArray).get(1).value;  // 200

  const nullFunction = nullsafe(nullThing).call().value;  // null
  const nullArrayAccess = nullsafe(nullThing).get(2).value;  // null
  const nullObjectAccess = nullsafe(nullThing).get('id').value;  // null
  ```

## Raw Value
In the rare cases you care if the value that is wrapped is an actual `undefined` vs `null` value, you can get that by calling `rawValue`.

  ```javascript
  // rawValue
  const undefinedThing = nullsafe(undefined).rawValue; // undefined
  const nullThing = nullsafe(null).rawValue; // null
  const name = nullsafe('jon').rawValue; // jon

  // value
  const undefinedThing2 = nullsafe(undefined).value; // null
  const nullThing2 = nullsafe(null).value; // null
  const name2 = nullsafe('jon').value; // jon
  ```

## Performance
Benchmarks performed using [Benchmark.js](https://github.com/bestiejs/benchmark.js/).  Benchmark code can be found [here](https://github.com/jkeam/nullsafe_benchmark).

Run on:
* MacBook Pro (15-inch, 2016)
* macOS High Sierra 10.13.4 (17E202)
* Processor 2.6 GHz Intel Core i7
* Memory 16 GB 2133 MHz LPDDR3

Comparing:
1.  Lodash v4.17.11
2.  Ramda v0.26.1
3.  Nullsafe v2.0.1

Run 1

```
Lodash#get x 3,352,635 ops/sec ±3.80% (79 runs sampled)
Ramda#path x 16,985,122 ops/sec ±2.32% (84 runs sampled)
Nullsafe#value x 17,435,296 ops/sec ±1.96% (76 runs sampled)
Nullsafe#rawValue x 17,489,960 ops/sec ±1.37% (88 runs sampled)
Fastest is Nullsafe#rawValue,Nullsafe#value,Ramda#path
```

Run 2

```
Lodash#get x 3,807,708 ops/sec ±2.22% (84 runs sampled)
Ramda#path x 18,124,155 ops/sec ±1.67% (89 runs sampled)
Nullsafe#value x 17,382,109 ops/sec ±1.51% (83 runs sampled)
Nullsafe#rawValue x 17,557,116 ops/sec ±1.26% (86 runs sampled)
Fastest is Ramda#path
```

Run 3
```
Lodash#get x 3,856,657 ops/sec ±1.90% (86 runs sampled)
Ramda#path x 17,466,883 ops/sec ±2.48% (86 runs sampled)
Nullsafe#value x 17,630,377 ops/sec ±1.03% (89 runs sampled)
Nullsafe#rawValue x 17,630,998 ops/sec ±1.07% (89 runs sampled)
Fastest is Nullsafe#value,Nullsafe#rawValue,Ramda#path
```

Run 4
```
Lodash#get x 3,864,329 ops/sec ±2.37% (77 runs sampled)
Ramda#path x 18,743,263 ops/sec ±1.83% (80 runs sampled)
Nullsafe#value x 17,284,128 ops/sec ±1.59% (86 runs sampled)
Nullsafe#rawValue x 17,538,949 ops/sec ±1.36% (89 runs sampled)
Fastest is Ramda#path
```

Run 5
```
Lodash#get x 4,136,289 ops/sec ±1.94% (81 runs sampled)
Ramda#path x 18,449,161 ops/sec ±1.07% (86 runs sampled)
Nullsafe#value x 17,517,517 ops/sec ±1.33% (84 runs sampled)
Nullsafe#rawValue x 17,648,284 ops/sec ±1.35% (87 runs sampled)
Fastest is Ramda#path
```
