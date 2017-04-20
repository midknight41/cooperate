import assert from "assert";
import MemberMap from "./MemberMap";

export default class MemberMaps {

  constructor(sourceObject) {

    assert(sourceObject, "sourceObject is required");

    this.sourceObject = sourceObject;
    this.mappings = new Map();
  }

  map(sourceName) {

    const mapping = new MemberMap(this, sourceName);
    this.registerMapping(mapping);

    return mapping;

  }

  registerMapping(mapping) {

    this.mappings.set(mapping.sourceName, mapping);
  }

}

