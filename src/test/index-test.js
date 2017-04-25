// Testing Framework
import * as Code from "code";
import * as Lab from "lab";
import getHelper from "lab-testing";
import { AssertionError } from "assert";
import examine from "examine-instance";

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

  lab.beforeEach(done => {


    db = {
      connected: true,
      insert: () => { return; },
      query: () => { return; }
    };

    generic = new GenericFeatures(db);
    specific = new SpecificFeatures(db);


    return done();
  });

  testing.throws.functionParameterTest(compose, ["object1", "object2"], {}, {});

  lab.test("only allows objects as parameters", done => {

    const throws = function () {
      compose("test", 1);
    };

    expect(throws).to.throw(AssertionError, /only objects/);

    return done();

  });

  lab.test("only allows objects as parameters (not even array)", done => {

    const throws = function () {
      compose([], {});
    };

    expect(throws).to.throw(AssertionError, /only objects/);

    return done();

  });

  lab.test("wraps two objects in a cooperate object", done => {

    const repo = compose(specific, generic);

    expect(repo).to.be.an.object();
    expect(repo.__cooperate).to.be.an.object();
    expect(repo.__cooperate.size).to.equal(2);

    return done();
  });

  lab.test("methods from the two objects are available on the cooperate object", done => {

    const repo = compose(specific, generic);

    expect(repo.getSalesByRegion).to.be.a.function();
    expect(repo.insert).to.be.a.function();
    expect(repo.findById).to.be.a.function();

    return done();
  });

  lab.test("throws an error if any methods overlap (naming collision)", done => {

    const overlapping = new OverlappingMethod();

    const throws = function () {

      compose(overlapping, generic);

    };

    expect(throws).to.throw(Error, /collision/);
    return done();
  });

  lab.test("throws an error if any properties overlap (naming collision)", done => {

    const overlapping = new OverlappingProps();

    const throws = function () {

      compose(overlapping, generic);

    };

    expect(throws).to.throw(Error, /collision/);
    return done();
  });

  lab.test("read-only properties from two objects are available on the cooperate object", done => {

    const repo = compose(specific, generic);

    const descriptor = Object.getOwnPropertyDescriptor(repo, "connected");

    expect(descriptor.get).to.be.a.function();
    expect(descriptor.set).to.be.undefined();
    expect(repo.connected).to.be.true();

    return done();

  });

  lab.test("read-write properties from two objects are available on the cooperate object", done => {

    const repo = compose(specific, generic);

    const descriptor = Object.getOwnPropertyDescriptor(repo, "rw");

    expect(descriptor.get).to.be.a.function();
    expect(descriptor.set).to.be.a.function();
    expect(repo.rw).to.equal("read-write");

    repo.rw = "altered";

    expect(repo.rw).to.equal("altered");

    return done();

  });

  lab.test("write-only properties from two objects are available on the cooperate object", done => {

    const repo = compose(specific, generic);

    const descriptor = Object.getOwnPropertyDescriptor(repo, "wo");

    expect(descriptor.set).to.be.a.function();
    expect(descriptor.get).to.be.undefined();

    return done();

  });

  lab.test("attributes from two objects are available on the cooperate object", done => {

    const repo = compose(specific, generic);

    const descriptor = Object.getOwnPropertyDescriptor(repo, "public");

    expect(descriptor.set).to.be.a.function();
    expect(descriptor.get).to.be.a.function();
    expect(repo.public).to.equal("public");

    return done();

  });

  lab.test("private items are not available on the cooperate object", done => {

    const repo = compose(specific, generic);

    const props = Object.getOwnPropertyNames(repo);

    expect(props).to.have.length(8);

    for (const prop of props) {

      if (prop === "__cooperate") continue;

      expect(prop.indexOf(/^_|_$/)).to.equal(-1);
    }

    return done();

  });

  lab.experiment("when it wraps another cooperate object", () => {

    lab.test("it maps all members correctly on both objects", done => {

      const a = new MultipleA();
      const b = new MultipleB();
      const c = new MultipleC();

      const first = compose(a, b);
      const result = compose(first, c);

      expect(result).to.be.an.object();
      expect(result.one).to.be.a.function();
      expect(result.two).to.be.a.function();
      expect(result.three).to.be.a.function();
      expect(result.one()).to.equal("one");
      expect(result.two()).to.equal("two");
      expect(result.three()).to.equal("three");

      return done();

    });

    lab.test("it errors on a naming collision", done => {

      const a = new MultipleA();
      const b = new MultipleB();
      const c = new MultipleC();
      const bad = new MultipleCollision();

      const first = compose(a, b);

      const throws = function () {
        return compose(first, c, bad);
      };

      expect(throws).to.throw(Error, /collision/);

      return done();

    });

  });

});
