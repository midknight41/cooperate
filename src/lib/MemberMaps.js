import assert from "assert";
import MemberMap from "./MemberMap";

// this class represents all the mappings for a single source object
export default class MemberMaps {

  constructor(sourceObject) {

    assert(sourceObject, "sourceObject is required");

    this.sourceObject = sourceObject;
    this.mappings = new Map();
  }

  map(sourceName) {

    // create a mapping for a single method and return the mapping
    // the mapping object enables the fluent/chainable interface

    const mapping = new MemberMap(this, sourceName);
    this.registerMapping(mapping);

    return mapping;

  }

  registerMapping(mapping) {

    this.mappings.set(mapping.sourceName, mapping);
  }

}
