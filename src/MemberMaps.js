const assert = require("assert");
const MemberMap = require("./MemberMap");

// this class represents all the mappings for a single source object
class MemberMaps {

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

  hide(sourceName) {

    // shortcut for map("method").hide()
    // a hidden member will not appear on the cooperate object

    const mapping = new MemberMap(this, sourceName);
    mapping.hide();

    this.registerMapping(mapping);

    return this;

  }

  registerMapping(mapping) {

    this.mappings.set(mapping.sourceName, mapping);
  }

}

module.exports = MemberMaps;
