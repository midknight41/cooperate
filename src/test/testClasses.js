
export class SpecificFeatures {

  constructor(db) {
    this._db = db;
    this.public = "public";
  }

  getSalesByRegion(regionName) {

    const query = { regionName };

    return this._db.query(query);
  }

}

export class GenericFeatures {

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

export class OverlappingMethod {

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

export class OverlappingProps {

  get rw() { return "uh oh"; }
}

export class MultipleA {
  one() {
    return this.one.name;
  }
}

export class MultipleB {
  two() {
    return this.two.name;
  }
}

export class MultipleC {
  three() {
    return this.three.name;
  }

  tres() {
    return this.tres.name;
  }
}

export class MultipleCollision {
  three() {
    return this.three.name;
  }

  trois() {
    return this.trois.name;
  }
}

