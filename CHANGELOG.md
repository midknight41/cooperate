### 2.0.0

The method signature for compose has been changed from a parameter array to a normal array of objects. This is a **breaking change**. 

#### Old Code

```js
  const result = compose(a, b);
```

#### New Code

```js
  const result = compose([a, b]);
```

As a result of this change, options can now be provided to the compose method. The ```hide``` option in now available.

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


### 1.1.0

Added ```hide()``` method for ```mapMembers()```.

```js
import { compose, mapMembers } from "cooperate";

const genericFeatures = new GenericFeatures(db);
const specificFeatures = new SpecificFeatures(db);

const genericWithMapping = mapMembers(genericFeatures)
  .map("findById").to("findSalesById")
  .hide("deleteItem");

const repo = compose(genericWithMapping, specificFeatures);

assert(repo.findSalesById);
assert(repo.findById === undefined);
assert(repo.deleteItem === undefined);
```
### 1.0.1

Improved parameter validation.

### 1.0.0

Added ```mapMembers()``` feature.

```js
import { compose, mapMembers } from "cooperate";

const genericFeatures = new GenericFeatures(db);
const specificFeatures = new SpecificFeatures(db);

const genericWithMapping = mapMembers(genericFeatures)
  .map("findById").to("findSalesById");

const repo = compose(genericWithMapping, specificFeatures);

// Method is remapped
assert(repo.findSalesById);
assert(repo.findById === undefined);
```
### 0.1.0

First version.
