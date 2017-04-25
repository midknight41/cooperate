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
