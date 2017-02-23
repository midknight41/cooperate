// Testing Framework
import * as Code from "code";
import * as Lab from "lab";
import getHelper from "lab-testing";

import { compose } from "../lib/index";

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const testing = getHelper(lab);

const group = testing.createExperiment("cooperate");

class SpecificFeatures {

  constructor(db) {
    this._db = db;
    this.public = "public";
  }

  getSalesByRegion(regionName) {

    const query = { regionName };

    return this._db.query(query);
  }

}

class GenericFeatures {

  constructor(db) {
    this._genericDb = db;
    this._rw = "read-write";
    this._wo = "write-only";
  }

  get connected() { return this._genericDb.connected; }
  get rw() { return this._rw; }
  set rw(value) { this._rw = value; }
  set wo(value) { this._wo = value; }

  insert(data) {
    this._genericDb.insert(data);
  }

  findById(id) {
    return this._genericDb.query({ _id: id });
  }

}

class Overlapping {

  constructor(db) {
    this._db = db;
  }

  getSalesByRegion(regionName) {

    const query = { regionName };

    return this._db.query(query);
  }

  findById(id) {
    return this._db.query({ _id: id });
  }

}

group("The assemble() function", () => {

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

  lab.test("wraps two objects in a cooperate object", done => {

    const repo = compose(specific, generic);

    expect(repo).to.be.an.object();
    expect(repo.__cooperate).to.be.an.array();
    expect(repo.__cooperate).to.have.length(2);

    return done();
  });

  lab.test("methods from the two objects are available on the cooperate object", done => {

    const repo = compose(specific, generic);

    expect(repo.getSalesByRegion).to.be.a.function();
    expect(repo.insert).to.be.a.function();
    expect(repo.findById).to.be.a.function();

    return done();
  });

  lab.test("throws an error if any methods overlap (no overriding allowed)", done => {

    const overlapping = new Overlapping();

    const throws = function () {

      compose(overlapping, generic);

    }

    expect(throws).to.throw(Error, /not allowed/);
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

});
