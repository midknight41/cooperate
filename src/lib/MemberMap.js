// This simple class makes the fluent interface work
export default class MemberMap {

  constructor(parent, sourceName) {

    if (!sourceName) {
      throw new Error("the source field name cannot be null");
    }

    this.sourceName = sourceName;
    this.parent_ = parent;
    this.hidden_ = false;
  }

  get hidden() { return this.hidden_; }

  to(targetName) {

    if (!targetName || typeof targetName !== "string") {
      throw new Error("the target field name must be a string");
    }

    this.targetName = targetName;

    return this.parent_;

  }

  hide() {
    this.hidden_ = true;
    return this.parent_;
  }

}
