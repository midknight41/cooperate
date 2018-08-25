// Testing Framework
import * as Code from "code";
import * as Lab from "lab";
import getHelper from "lab-testing";
import { AssertionError } from "assert";

import { compose } from "../lib/index";
import {
  SpecificFeatures, GenericFeatures,
  OverlappingMethod, OverlappingProps,
  MultipleA, MultipleB, MultipleC, MultipleCollision
} from "./testClasses";

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const testing = getHelper(lab);

const group = testing.createExperiment("cooperate");

group("The compose() function", () => {

  let db;
  let generic;
  let specific;

  lab.beforeEach(() => {


    db = {
      connected: true,
      insert: () => { return; },
      query: () => { return; }
    };

    generic = new GenericFeatures(db);
    specific = new SpecificFeatures(db);

  });

  testing.throws.functionParameterTest(compose, ["objectArray"], [{}, {}]);

  lab.test("doesn't allow null in the array", () => {

    const throws = function () {
      compose([null, {}]);
    };

    expect(throws).to.throw(AssertionError, /null and undefined/);
  });

  lab.test("doesn't allow undefined in the array", () => {
    const throws = function () {
      compose([undefined, {}]);
    };
    expect(throws).to.throw(AssertionError, /null and undefined/);
  });

  lab.test("only allows objects as parameters", () => {
    const throws = function () {
      compose(["test", 1]);
    };
    expect(throws).to.throw(AssertionError, /only objects/);
  });

  lab.test("only allows objects as parameters (not even array)", () => {
    const throws = function () {
      compose([[], {}]);
    };
    expect(throws).to.throw(AssertionError, /only objects/);
  });

  lab.test("wraps two objects in a cooperate object", () => {
    const repo = compose([specific, generic]);
    expect(repo).to.be.an.object();
    expect(repo.__cooperate).to.be.an.object();
    expect(repo.__cooperate.size).to.equal(2);
  });

  lab.test("methods from the two objects are available on the cooperate object", () => {
    const repo = compose([specific, generic]);
    expect(repo.getSalesByRegion).to.be.a.function();
    expect(repo.insert).to.be.a.function();
    expect(repo.findById).to.be.a.function();
  });

  lab.test("throws an error if any methods overlap (naming collision)", () => {
    const overlapping = new OverlappingMethod();
    const throws = function () {
      compose([overlapping, generic]);
    };
    expect(throws).to.throw(Error, /collision/);
  });

  lab.test("throws an error if any properties overlap (naming collision)", () => {
    const overlapping = new OverlappingProps();
    const throws = function () {
      compose([overlapping, generic]);
    };
    expect(throws).to.throw(Error, /collision/);
  });

  lab.test("read-only properties from two objects are available on the cooperate object", () => {
    const repo = compose([specific, generic]);
    const descriptor = Object.getOwnPropertyDescriptor(repo, "connected");
    expect(descriptor.get).to.be.a.function();
    expect(descriptor.set).to.be.undefined();
    expect(repo.connected).to.be.true();
  });

  lab.test("read-write properties from two objects are available on the cooperate object", () => {
    const repo = compose([specific, generic]);
    const descriptor = Object.getOwnPropertyDescriptor(repo, "rw");
    expect(descriptor.get).to.be.a.function();
    expect(descriptor.set).to.be.a.function();
    expect(repo.rw).to.equal("read-write");
    repo.rw = "altered";
    expect(repo.rw).to.equal("altered");
  });

  lab.test("write-only properties from two objects are available on the cooperate object", () => {
    const repo = compose([specific, generic]);
    const descriptor = Object.getOwnPropertyDescriptor(repo, "wo");
    expect(descriptor.set).to.be.a.function();
    expect(descriptor.get).to.be.undefined();
  });

  lab.test("attributes from two objects are available on the cooperate object", () => {
    const repo = compose([specific, generic]);
    const descriptor = Object.getOwnPropertyDescriptor(repo, "public");
    expect(descriptor.set).to.be.a.function();
    expect(descriptor.get).to.be.a.function();
    expect(repo.public).to.equal("public");
  });

  lab.test("private items are not available on the cooperate object", () => {
    const repo = compose([specific, generic]);
    const props = Object.getOwnPropertyNames(repo);
    expect(props).to.have.length(8);
    for (const prop of props) {
      if (prop === "__cooperate")
        continue;
      expect(prop.indexOf(/^_|_$/)).to.equal(-1);
    }
  });

  lab.experiment("when working with options", () => {

    function noNegativeOptionsEffect(opts) {

      const one = new MultipleA();
      const two = new MultipleB();

      const result = compose([one, two], opts);

      expect(result.one).to.be.a.function();
      expect(result.two).to.be.a.function();

    }

    lab.test("A null options object has no negative effects", done =>
      noNegativeOptionsEffect(done, null));

    lab.test("An undefined options object has no negative effects", done =>
      noNegativeOptionsEffect(done, undefined));

    lab.test("An empty options object has no negative effects", done =>
      noNegativeOptionsEffect(done, {}));

    lab.test("A null hide option has no negative effects", done =>
      noNegativeOptionsEffect(done, { hide: null }));

    lab.test("An undefined hide option has no negative effects", done =>
      noNegativeOptionsEffect(done, { hide: undefined }));

    lab.test("An empty array hide option has no negative effects", done =>
      noNegativeOptionsEffect(done, { hide: [] }));

    lab.test("it can hide a method properly when the option is supplied", () => {
      const one = new MultipleC();
      const two = new MultipleCollision();
      const result = compose([one, two], {hide: ["three"]});
      expect(result.tres).to.be.a.function();
      expect(result.trois).to.be.a.function();
      expect(result.three).to.be.undefined();
    });
  });

  lab.experiment("when it wraps another cooperate object", () => {

    lab.test("it maps all members correctly on both objects", () => {
      const objA = new MultipleA();
      const objB = new MultipleB();
      const objC = new MultipleC();
      const first = compose([objA, objB]);
      const result = compose([first, objC]);
      expect(result).to.be.an.object();
      expect(result.one).to.be.a.function();
      expect(result.two).to.be.a.function();
      expect(result.three).to.be.a.function();
      expect(result.one()).to.equal("one");
      expect(result.two()).to.equal("two");
      expect(result.three()).to.equal("three");
    });

    lab.test("it errors on a naming collision", () => {
      const objA = new MultipleA();
      const objB = new MultipleB();
      const objC = new MultipleC();
      const bad = new MultipleCollision();
      const first = compose([objA, objB]);
      const throws = function () {
        return compose([first, objC, bad]);
      };
      expect(throws).to.throw(Error, /collision/);
    });

  });

});
