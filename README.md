# Nullsafe
[![npm version](https://badge.fury.io/js/nullsafe.svg)](https://badge.fury.io/js/nullsafe)
[![Build Status](https://travis-ci.org/jkeam/nullsafe.svg?branch=master)](https://travis-ci.org/jkeam/nullsafe)
[![Coverage Status](https://coveralls.io/repos/github/jkeam/nullsafe/badge.svg?branch=master)](https://coveralls.io/github/jkeam/nullsafe?branch=master)

A nice way to do a nullsafe traversal of nested objects.

## Node Versions
  * 7.1.x
  * 7.0.x
  * 6.1.x
  * 6.0.x

## Motivation
If you have nested objects and want a way to safely traverse it, nullsafe will help you.  Let's take an example.  Given this object:

   ```javascript
   const amusementPark = {
     "mainAttraction": {
        "rollerCoaster": {
          "name": "Grizzly"
        }
     }
   };
   ```

You would normally have to use a few null checks in order to pull the `name` (Grizzly) out of there.

  ```javascript
  let nameOfMainAttraction;
  if (!!amusementPark && !!amusementPark.mainAttraction && !!amusementPark.mainAttraction.rollerCoaster) {
    nameOfMainAttraction = amusementPark.mainAttraction.rollerCoaster.name;
  }
  ```

Alternatively, you could also use lodash

  ```javascript
  const _ = require('lodash');
  const nameOfMainAttraction = _.get(amusementPark, 'mainAttraction.rollerCoaster.name');
  ```

But there was something about passing in a string describing how you wanted to access it that felt weird to me.  I wanted an api that allowed me to chain together actual objects as well as a way to support invocation of methods in my chain.


## Usage

### Objects
Given the same example above, this is how you would do it using `nullsafe`.

  ```javascript
  const nullsafe = require('nullsafe');
  const nameOfMainAttraction = nullsafe(amusementPark)
                                       .get('mainAttraction')
                                       .get('rollerCoaster')
                                       .get('name').value;
  ```

The way it works is simple.  The `nullsafe` method wraps your object in a proxy.  You then call the `get` method to get the attribute you want out.  You keep doing this all the way down the chain until you are done.  Then you call `value` in order to unwrap the object.  If anywhere in the chain failed, you will get a null back when you unwrap it at the end.  Example:

  ```javascript
  const nameOfMainAttraction = nullsafe(amusementPark)
                                       .get('mainAttraction')
                                       .get('waterPark')
                                       .get('name').value;
  ```

Our amusement park has no water park, but the traversal will not fail and will return a null at the end.  This works no matter how long the chain:

  ```javascript
  const nameOfMainAttraction = nullsafe(amusementPark)
                                       .get('mainAttraction')
                                       .get('waterPark')
                                       .get('slide')
                                       .get('height')
                                       .get('otherStuffThatDoesntExist').value;
  ```


### Functions
`nullsafe` also supports function calls in the chain.

  ```javascript
  const amusementPark = {
    "getSupervisorInfo": () => {
      return {
        "name": "Billy",
        "shift": "Daytime"
      };
    }
  };

  const supervisorName = nullsafe(amusementPark).call('getSupervisorInfo').get('name').value;
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

