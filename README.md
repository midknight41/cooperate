
## Example
```js
import { assemble } from "cooperate";
import db from "./databaseEngine";

const genericFeatures = new GenericDbFeatures(db);
const specificFeatures = new SpecificDbFeatures(db);

const repo = assemble(genericFeatures, specificFeatures);

repo.upsert(data);
repo.getSalesByRegion("UK");

// Generic Features
class GenericDbFeatures {
  findOne(id) {
    
  }

  upsert(data) {

  }

  internalMethod_() {

  }

  _anotherInternalMethod() {

  }

}

//Specific Features
class SpecificDbFeatures {

  getAllSaleItems() {

  }

}

// Creates an object with no shared state and does not expose private methods
{

  "__cooperate": [genericFeatures, specificFeatures] 

  "findOne": function(...params) { return this.__cooperate[0].findOne(...params);}
  "upsert": function(...params) { return this.__cooperate[0].upsert(...params);}
  "getAllSaleItems": function(...params) { return this.__cooperate[1].getAllSaleItems(...params);}

}

```

## Configure your own convention

```js

import { configure } from "cooperate";

const opts = {
  privacy: true,
  privacyPattern: /_private*/,
};

const compose = configure(opts).compose;

```
