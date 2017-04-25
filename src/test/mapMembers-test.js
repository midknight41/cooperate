import { expect } from "code";
import * as Lab from "lab";
import getHelper from "lab-testing";
import { compose, mapMembers } from "../lib";

const lab = exports.lab = Lab.script();
const testing = getHelper(lab);
const group = testing.createExperiment("cooperate", "MemberMaps");

class TestClass {

  constructor(uniqueValue) {
    this.uniqueValue_ = uniqueValue;
  }

  getItem(id) {
    return `${this.uniqueValue_}-${id}`;
  }

  get uniqueValue() { return this.uniqueValue_; }
}

group("The mapMembers() function", () => {

  testing.throws.functionParameterTest(mapMembers, ["sourceObject"], {});

  let descriptor;

  lab.beforeEach(done => {

    const obj = new TestClass("object-1");

    descriptor = mapMembers(obj);

    return done();

  });

  lab.test("can properly register a mapping", done => {

    const sourceName = "getItem";
    const targetName = "getTestItem";

    descriptor
      .map(sourceName).to(targetName);

    expect(descriptor).to.be.an.object();
    expect(descriptor.mappings.get(sourceName).sourceName).to.equal(sourceName);
    expect(descriptor.mappings.get(sourceName).targetName).to.equal(targetName);

    return done();

  });

  lab.experiment("when used with compose()", () => {

    let raw;

    lab.beforeEach(done => {

      const obj = new TestClass("object-1");

      descriptor = mapMembers(obj);

      descriptor
        .map("getItem").to("getTestItem")
        .map("uniqueValue").to("moreUniqueValue");

      raw = new TestClass("raw-object-1");

      return done();

    });

    lab.test("the cooperate wrapper is correct", done => {

      const result = compose(raw, descriptor);

      expect(result).to.be.an.object();
      expect(result.__cooperate).to.be.an.object();
      expect(result.__cooperate.size).to.equal(2);

      return done();

    });

    lab.test("the mapping of a method alters the output of compose correctly", done => {

      const result = compose(raw, descriptor);

      expect(result.getItem).to.be.a.function();
      expect(result.getTestItem).to.be.a.function();
      expect(result.getItem(1)).to.equal("raw-object-1-1");
      expect(result.getTestItem(1)).to.equal("object-1-1");

      return done();

    });

    lab.test("the mapping of a property alters the output of compose correctly", done => {

      const result = compose(raw, descriptor);

      expect(result.uniqueValue).to.equal("raw-object-1");
      expect(result.moreUniqueValue).to.equal("object-1");

      return done();

    });

  });

});

group("The map() method", () => {

  const obj = new TestClass();
  const descriptor = mapMembers(obj);

  testing.throws.methodParameterTest(descriptor, descriptor.map, ["from"], "abc");

});

group("The to() method", () => {

  const obj = new TestClass();
  const descriptor = mapMembers(obj);

  const mapping = descriptor.map("abc");

  testing.throws.methodParameterTest(mapping, mapping.to, ["to"], "abc");

});

group("The hide() method", () => {

  const obj = new TestClass();
  const descriptor = mapMembers(obj);

  testing.throws.methodParameterTest(descriptor, descriptor.hide, ["from"], "abc");

});

group("The hide() method", () => {

  lab.test("marks a member for hiding from a mapping", done => {

    const obj = new TestClass();
    const descriptor = mapMembers(obj);

    const mapping = descriptor.map("abc");

    mapping.hide();

    expect(mapping.hidden).to.be.true();

    return done();

  });

  lab.test("marks a member for hiding from the parent", done => {

    const obj = new TestClass();
    const descriptor = mapMembers(obj);

    descriptor.hide("abc");

    expect(descriptor.mappings.get("abc").hidden).to.be.true();

    return done();

  });

  lab.experiment("when used with compose()", () => {

    lab.test("a hidden method is not exposed on the cooperate object", done => {

      const obj = new TestClass();
      const descriptor = mapMembers(obj);

      descriptor.hide("getItem");

      const result = compose(descriptor);

      expect(result).to.be.an.object();
      expect(result.getItem).to.be.undefined();

      return done();

    });

  });

});
