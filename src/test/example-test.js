import { compose } from "../lib/index";
import assert from "assert";

class SpecificFeatures {

  constructor(db) {
    this._db = db;
  }

  getSalesByRegion(regionName) {

    const query = this.formatQuery_(regionName);

    return this._db.query(query);
  }

  formatQuery_(regionName) {
    return { region: regionName };
  }

}

class GenericFeatures {

  constructor(db) {
    this._db = db;
  }

  get connected() { return this._db.connected; }

  insert(data) {
    this._db.insert(data);
  }

  findById(id) {
    return this._db.query({ _id: id });
  }

}
const db = {};

const genericFeatures = new GenericFeatures(db);
const specificFeatures = new SpecificFeatures(db);

const repo = compose([genericFeatures, specificFeatures]);

// Creates an object with no shared state and does not expose private methods
assert(repo.findById);
assert(repo.getSalesByRegion);
assert(repo.insert);
assert(Object.getOwnPropertyDescriptor(repo, "connected"));
assert((repo.formatQuery_ === undefined));
assert(Object.getOwnPropertyDescriptor(repo, "_db") === undefined);
