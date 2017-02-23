# cooperate

[![Build Status](https://travis-ci.org/midknight41/cooperate.svg?branch=master)](https://travis-ci.org/midknight41/cooperate)

**cooperate** is a convention based composition tool that let's you compose a series of objects into a single object quickly. It does not alter the original objects or prototypes but wraps them in a proxy object. The proxy will perserve the appropriate getters and setters from the original object.

If method/properties/attributes begin or end with an "_" then they will not be exposed on the proxy object.

Note: At present naming collisions are considered errors.

## Installation
```
npm install cooperate -S
```

## Example
```js
import { compose } from "cooperate";
import assert from "assert";

class SpecificFeatures {

  constructor(db) {
    this._db = db;
  }

  getSalesByRegion(regionName) {

    const query = this.formatQuery_(regionName);

    return this._db.query(query);
  }

  formatQuery_(regionName) {
    return { region: regionName };
  }

}

class GenericFeatures {

  constructor(db) {
    this._db = db;
  }

  get connected() { return this._db.connected; }

  insert(data) {
    this._db.insert(data);
  }

  findById(id) {
    return this._db.query({ _id: id });
  }

}
const db = {};

const genericFeatures = new GenericFeatures(db);
const specificFeatures = new SpecificFeatures(db);

const repo = compose(genericFeatures, specificFeatures);

// Creates an object with no shared state and does not expose private methods
assert(repo.findById);
assert(repo.getSalesByRegion);
assert(repo.insert);
assert(Object.getOwnPropertyDescriptor(repo, "connected"));

// private items are not exposed
assert((repo.formatQuery_ === undefined));
assert(Object.getOwnPropertyDescriptor(repo, "_db") === undefined);
```
