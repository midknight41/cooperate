import examine from "examine-instance";
import assert from "assert";

const noPrivate = /^_|_$/;

function forwardMethods(target, sourceObject, index, methods) {

  for (let i = 0; i < methods.length; i++) {

    const method = methods[i];

    // Ditch private methods
    const isPrivate = noPrivate.exec(method);
    if (isPrivate) continue;

    if (target[method] !== undefined) throw new Error(`overriding the existing method '${method}' is not allowed.`);

    target[method] = function (...params) { return this.__cooperate[index][method](...params); };

  }

}

function forwardProperties(target, sourceObject, index, props, accessors) {

  for (let i = 0; i < props.length; i++) {

    const prop = props[i];

    // Ditch private methods
    const isPrivate = noPrivate.exec(prop);
    if (isPrivate) continue;

    if (target[prop] !== undefined) throw new Error(`overriding the existing property/attribute '${prop}' is not allowed.`)

    if (accessors.length === 0) return;

    const descriptor = {};

    if (accessors.indexOf("get") > -1) {
      descriptor.get = function () {
        return this.__cooperate[index][prop];
      };
    }

    if (accessors.indexOf("set") > -1) {
      descriptor.set = function (value) { this.__cooperate[index][prop] = value; };
    }

    Object.defineProperty(target, prop, descriptor);

  }

}

export function assemble(...objects) {

  const wrapper = {
    __cooperate: []
  };

  for (const obj of objects) {

    assert(obj, "null and undefined are not allowed");

    wrapper.__cooperate.push(obj);

    const examination = examine(obj);

    // create proxies to forward all methods, properties and attributes
    const currentIndex = wrapper.__cooperate.length - 1;

    forwardMethods(wrapper, obj, currentIndex, examination.methods);
    forwardProperties(wrapper, obj, currentIndex, examination.readWrite, ["get", "set"]);
    forwardProperties(wrapper, obj, currentIndex, examination.attributes, ["get", "set"]);
    forwardProperties(wrapper, obj, currentIndex, examination.readOnly, ["get"]);
    forwardProperties(wrapper, obj, currentIndex, examination.writeOnly, ["set"]);

  }

  return wrapper;

}
