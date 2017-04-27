# cooperate

[![Build Status](https://travis-ci.org/midknight41/cooperate.svg?branch=master)](https://travis-ci.org/midknight41/cooperate)

**cooperate** is a convention based composition tool that let's you compose a series of objects into a single object quickly. It does not alter the original objects or prototypes but wraps them in a proxy object. The proxy object will forward the method calls to the appropriate underlying object methods and perserves the appropriate behaviour of your getters and setters too.

See [Change Log](./CHANGELOG.md) for changes from previous versions.

## Installation
```
npm install cooperate -S
```

## Why use it?

Inheritance can be a bit of a pain for many reasons and a great alternative is to use composition. This is traditionally done like this:

```js
class MainClass {

  constructor(capability1, capability2) {
    this.capability1_ = capability1;
    this.capability2_ = capability2;
  }

  doStuff(value) {
    this.capability1_.doStuff(value);
  }

  doMoreStuff(value) {
    this.capability2_.doMoreStuff(value);
  }

}

const capability1 = new Capability1();
const capability2 = new Capability2();

const combined = new MainClass(capability1, capability2);
```

While this approach avoids some of the pain points of inheritance it does require you do a lot of method forwarding which is repetitive, time-consuming and boring. That's where **cooperate** comes in. **cooperate** inspects the objects that you would like to combine and does all that method forwarding for you with a single line of code. 

```js

import { compose } from "cooperate";

const capability1 = new Capability1();
const capability2 = new Capability2();

const combined = compose([capability1, capability2]);
```

JavaScript does not really have the concept of privacy but it is very common for developers to use an ```_``` to mark methods as private. **cooperate** follows this convention and will not expose anything that begins or ends with an ```_``` on the combined object.

## Detailed Example
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

const repo = compose([genericFeatures, specificFeatures]);

// Creates an object with no shared state
assert(repo.findById);
assert(repo.getSalesByRegion);
assert(repo.insert);
assert(Object.getOwnPropertyDescriptor(repo, "connected"));

// private members are not exposed
assert(repo.formatQuery_ === undefined);
assert(Object.getOwnPropertyDescriptor(repo, "_db") === undefined);
```

## Dealing with naming collisions

With any form of composition you will eventually come across a problem with two things that have the same name. **cooperate** will throw an error if you try and do this as it cannot decide what to do without your help. 

### Mapping Members

To help with this problem, **cooperate** provides the ```mapMembers()``` function. This lets you define your method forward rules per object.

#### Example 1

```js
import { compose, mapMembers } from "cooperate";

const genericFeatures = new GenericFeatures(db);
const specificFeatures = new SpecificFeatures(db);

const genericWithMapping = mapMembers(genericFeatures)
  .map("findById").to("findSalesById");

const repo = compose([genericWithMapping, specificFeatures]);

// Method is remapped
assert(repo.findSalesById);
assert(repo.findById === undefined);
```

#### Example 2

```js

import { compose, mapMembers } from "cooperate";
import createRepo from "./Repo";

const product = createRepo("products");
const sale = createRepo("sales");

const productWithMapping = mapMembers(product)
  .map("getItem").to("getProduct")
  .map("updateItem").to("updateProduct")
  .map("insertItem").to("insertProduct")
  .map("deleteItem").to("deleteProduct");

const salesWithMapping = mapMembers(sale)
  .map("getItem").to("getSale")
  .map("updateItem").to("updateSale")
  .map("insertItem").to("insertSale")
  .map("deleteItem").to("deleteSale");

const combinedRepo = compose([productWithMapping, salesWithMapping]);

```
### Hiding Members

The ```mapMembers()``` can also be used with members that you don't want to expose on the **cooperate** object. This can be achieved with the ```hide()``` method.

```js
import { compose, mapMembers } from "cooperate";
import assert from "assert";

const genericFeatures = new GenericFeatures(db);
const specificFeatures = new SpecificFeatures(db);

const genericWithMapping = mapMembers(genericFeatures)
  .map("findById").to("findSalesById")
  .hide("deleteItem");

const repo = compose([genericWithMapping, specificFeatures]);

assert(repo.findSalesById);
assert(repo.findById === undefined);
assert(repo.deleteItem === undefined);
```
If the objects you are trying to compose have a uniform interface then there is also an option on the ```compose()``` method to make this easier.

```js
import { compose } from "cooperate";
import assert from "assert";

// Assume all three capabilities here support a property called isWorking.
import capability1 from "./ capability1";
import capability2 from "./ capability2"; 
import capability3 from "./ capability3";

const service = compose([capability1, capability2, capability3], { hide: ["isWorking"] });

// no naming collisions and no isWorking property on the resulting object
assert(service.isWorking === undefined);
```
