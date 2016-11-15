# Nullsafe
A nice way to do a nullsafe traversal of objects.

## Description
If you have nested objects and want a way to safely traverse it, you can use this to do it.  Before this, you would have to use lodash or do it manually.

## Usage
  ```
  const nullsafe = require('nullsafe');

  nullsafe({id: 50}).get('childThatDoesntExist').value;
  //will return 0

  nullsafe({id: 50}).get('id').value;
  //will return 50

  ```
