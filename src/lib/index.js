import examine from "examine-instance";
import assert from "assert";
import MemberMaps from "./MemberMaps";

const noPrivate = /^_|_$/;

function forwardMethods(target, sourceObject, index, methods, mappings) {

  for (let i = 0; i < methods.length; i++) {

    const sourceMethod = methods[i];

    // Ditch private methods
    const isPrivate = noPrivate.exec(sourceMethod);
    if (isPrivate) continue;

    // Re-map methods if mapping rules have been provided
    let targetMethod = sourceMethod;

    if (mappings !== null && mappings.has(sourceMethod)) {
      targetMethod = mappings.get(sourceMethod).targetName;
    }

    if (target[targetMethod] !== undefined) throw new Error(`Naming collision detected with '${sourceMethod}'. Collisions can be resolved using mapMembers().`);

    target[targetMethod] = function (...params) { return this.__cooperate[index][sourceMethod](...params); };

  }

}

function forwardProperties(target, sourceObject, index, props, accessors, mappings) {

  for (let i = 0; i < props.length; i++) {

    const sourceProp = props[i];

    // Ditch private methods
    const isPrivate = noPrivate.exec(sourceProp);
    if (isPrivate) continue;


    // Re-map methods if mapping rules have been provided
    let targetProp = sourceProp;

    if (mappings !== null && mappings.has(sourceProp)) {
      targetProp = mappings.get(sourceProp).targetName;
    }

    if (target[targetProp] !== undefined) throw new Error(`Naming collision detected with '${sourceProp}'. Collisions can be resolved using mapMembers().`);

    const descriptor = {};

    if (accessors.indexOf("get") > -1) {
      descriptor.get = function () {
        return this.__cooperate[index][sourceProp];
      };
    }

    if (accessors.indexOf("set") > -1) {
      descriptor.set = function (value) { this.__cooperate[index][sourceProp] = value; };
    }

    Object.defineProperty(target, targetProp, descriptor);

  }

}

function mapAllMembers(wrapper, obj, mappings) {

  wrapper.__cooperate.push(obj);
  const examination = examine(obj);

  // create proxies to forward all methods, properties and attributes
  const currentIndex = wrapper.__cooperate.length - 1;

  forwardMethods(wrapper, obj, currentIndex, examination.methods, mappings);
  forwardProperties(wrapper, obj, currentIndex, examination.readWrite, ["get", "set"], mappings);
  forwardProperties(wrapper, obj, currentIndex, examination.attributes, ["get", "set"], mappings);
  forwardProperties(wrapper, obj, currentIndex, examination.readOnly, ["get"], mappings);
  forwardProperties(wrapper, obj, currentIndex, examination.writeOnly, ["set"], mappings);

}

export function compose(...objects) {

  const wrapper = {
    __cooperate: []
  };

  for (const obj of objects) {

    assert(obj, "null and undefined are not allowed");
    assert(typeof obj === "object", "only objects are supported for composition");

    if (obj instanceof MemberMaps) {
      mapAllMembers(wrapper, obj.sourceObject, obj.mappings);
    } else {
      mapAllMembers(wrapper, obj, null);
    }

  }

  return wrapper;

}

export function mapMembers(sourceObject) {
  return new MemberMaps(sourceObject);
}
