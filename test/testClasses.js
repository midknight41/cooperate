
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

class OverlappingMethod {

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

class OverlappingProps {

  get rw() { return "uh oh"; }
}

class MultipleA {
  one() {
    return this.one.name;
  }
}

class MultipleB {
  two() {
    return this.two.name;
  }
}

class MultipleC {
  three() {
    return this.three.name;
  }

  tres() {
    return this.tres.name;
  }
}

class MultipleCollision {
  three() {
    return this.three.name;
  }

  trois() {
    return this.trois.name;
  }
}

module.exports = {
  MultipleCollision,
  MultipleC,
  MultipleB,
  MultipleA,
  OverlappingProps,
  OverlappingMethod,
  GenericFeatures,
  SpecificFeatures
};
