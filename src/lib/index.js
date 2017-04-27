import examine from "examine-instance";
import assert from "assert";
import MemberMaps from "./MemberMaps";
import CooperateWrapper from "./CooperateWrapper";

const noPrivate = /^_|_$/;

function forwardMethods(wrapper, sourceObject, index, methods, mappings) {

  // for each public method, we want to create a proxy method on the wrapping object
  for (let i = 0; i < methods.length; i++) {

    const sourceMethod = methods[i];

    // We don't want to map any private methods
    const isPrivate = noPrivate.exec(sourceMethod);
    if (isPrivate) continue;

    // change the proxy method name if a different name was provided
    let targetMethod = sourceMethod;

    if (mappings !== null && mappings.has(sourceMethod)) {

      if (mappings.get(sourceMethod).hidden) continue;
      targetMethod = mappings.get(sourceMethod).targetName;
    }

    // Naming collisions are not allowed, throw error if detected
    if (wrapper[targetMethod] !== undefined) throw new Error(`Naming collision detected with '${sourceMethod}'. Collisions can be resolved using mapMembers().`);

    // create the proxy method on the wrapping object
    wrapper[targetMethod] = function (...params) { return this.__cooperate.get(index)[sourceMethod](...params); };

  }

}

function forwardProperties(wrapper, sourceObject, index, props, accessors, mappings) {

  // for each public property, we want to create appropriate proxy accessors on the wrapping object
  for (let i = 0; i < props.length; i++) {

    const sourceProp = props[i];

    // We don't want to map any private properties
    const isPrivate = noPrivate.exec(sourceProp);
    if (isPrivate) continue;

    // Re-map properties if mapping rules have been provided
    let targetProp = sourceProp;

    if (mappings !== null && mappings.has(sourceProp)) {

      if (mappings.get(sourceProp).hidden) continue;
      targetProp = mappings.get(sourceProp).targetName;

    }

    // Naming collisions are not allowed, throw error if detected
    if (wrapper[targetProp] !== undefined) throw new Error(`Naming collision detected with '${sourceProp}'. Collisions can be resolved using mapMembers().`);

    const descriptor = {};

    // add get accessor if required
    if (accessors.indexOf("get") > -1) {
      descriptor.get = function () {
        return this.__cooperate.get(index)[sourceProp];
      };
    }

    // add set accessor if required
    if (accessors.indexOf("set") > -1) {
      descriptor.set = function (value) { this.__cooperate.get(index)[sourceProp] = value; };
    }

    // add the property to the wrapping object
    Object.defineProperty(wrapper, targetProp, descriptor);

  }

}

function mapAllMembers(wrapper, obj, mappings) {

  // TODO: replace with a uuid
  const key = `idx_${wrapper.__cooperate.size}`;

  wrapper.__cooperate.set(key, obj);
  const examination = examine(obj);

  // create proxies to forward all methods, properties and attributes
  forwardMethods(wrapper, obj, key, examination.methods, mappings);
  forwardProperties(wrapper, obj, key, examination.readWrite, ["get", "set"], mappings);
  forwardProperties(wrapper, obj, key, examination.attributes, ["get", "set"], mappings);
  forwardProperties(wrapper, obj, key, examination.readOnly, ["get"], mappings);
  forwardProperties(wrapper, obj, key, examination.writeOnly, ["set"], mappings);

}


function processOptions(obj, options) {

  let descriptor;

  // All downstream processing will be of a MemberMaps
  if (obj instanceof MemberMaps) {
    descriptor = obj;
  } else {
    descriptor = new MemberMaps(obj);
  }

  // If any hide options were provided mark that object for hiding downstream
  if (options.hide.length > 0) {
    for (const method of options.hide) {
      descriptor.hide(method);
    }
  }

  return descriptor;

}

export function compose(objectArray, options) {

  // make options safe to use
  const opts = options || {};
  opts.hide = opts.hide || [];

  assert(Array.isArray(objectArray), "an array of objects is required");

  const wrapper = new CooperateWrapper();

  // take all the source objects, discover public members, and create proxy members on the proxy object.
  for (const obj of objectArray) {

    assert(obj, "null and undefined are not allowed");
    assert(typeof obj === "object" && !Array.isArray(obj), "only objects are supported for composition");

    const descriptor = processOptions(obj, opts);
    mapAllMembers(wrapper, descriptor.sourceObject, descriptor.mappings);

  }

  return wrapper;

}

export function mapMembers(sourceObject) {
  return new MemberMaps(sourceObject);
}
