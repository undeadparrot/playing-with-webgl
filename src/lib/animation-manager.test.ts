import {
  AnimationManager,
  getSampleAction,
  getActiveChannels,
  getChannelValue,
  applyBoneUpdates
} from "./animation-manager";

describe("for an AnimationManager", () => {
  const manager = new AnimationManager([getSampleAction()]);
  expect(manager).not.toBeNull();
  it("has an action", () => {
    expect(manager.actions).toHaveLength(1);
  });
  const action = manager.actions[0];
  it("can start an action", () => {
    manager.startAction("Walk");
    expect(action.isStarted).toBeTruthy();
  });
  it("progresses the action over time", () => {
    manager.work(1);
    expect(action.time).toBe(1);
    expect(action.isStarted).toBeTruthy();
    manager.work(3);
    expect(action.isStarted).toBeTruthy();
    expect(action.time).toBe(4);
  });
  it("has no affect on bones not in running actions", () => {
    expect(manager.getBoneUpdates({ name: "LegLeft" })).toEqual([]);
  });

  it("updates bones in running actions", () => {
    const results = manager.getBoneUpdates("LegRight");
    expect(results[0].value).toEqual(0);
    manager.work(2);
    const results2 = manager.getBoneUpdates("LegRight");
    expect(results2[0].value).toEqual(0.5);
    manager.work(2);
    const results3 = manager.getBoneUpdates("LegRight");
    expect(results3[0].value).toEqual(1.0);
  });
  it("stops the action after it runs", () => {
    manager.work(1);
    expect(action.time).toBe(9);
    expect(action.isStarted).toBeFalsy();
    const results = manager.getBoneUpdates("LegRight");
    expect(results).toHaveLength(0);
  });
});

describe("for a set of one channel", () => {
  const x = {
    property: "rotation",
    component: 1,
    fromValue: 0,
    toValue: 1,
    startFrame: 4,
    stopFrame: 8
  };
  it("does not use a channel outside its time window", () => {
    expect(getActiveChannels([x], x.startFrame - 1)).toEqual([]);
    expect(getActiveChannels([x], x.stopFrame + 1)).toEqual([]);
    expect(getActiveChannels([x], x.startFrame + 1)).toContain(x);
    expect(getActiveChannels([x], x.stopFrame - 1)).toContain(x);
  });
  it("interpolates values over time", () => {
    expect(getChannelValue(x, x.startFrame)).toEqual(x.fromValue);
    expect(getChannelValue(x, x.startFrame)).toEqual(0);

    expect(getChannelValue(x, x.stopFrame)).toEqual(x.toValue);
    expect(getChannelValue(x, x.stopFrame)).toEqual(1);

    expect(getChannelValue(x, 6)).toEqual(0.5);
  });
});

describe("applying bone updates", () => {
  const getBone = () => ({
    rotation: [1, 2, 3],
    translation: [1, 2, 3]
  });
  const updateToRotationY = {
    channel: {
      component: 1,
      property: "rotation"
    },
    value: 1.0
  };
  const updateToRotationYAgain = {
    channel: {
      component: 1,
      property: "rotation"
    },
    value: 2.0
  };
  const updateToTranslationX = {
    channel: {
      component: 0,
      property: "translation"
    },
    value: 1.0
  };
  it("updates the bone's rotation ", () => {
    const bone = getBone();
    applyBoneUpdates(bone, [updateToRotationY]);
    expect(bone.rotation).toEqual([1, 3, 3]);
  });
  it("supports multiple updates the bone's rotation ", () => {
    const bone = getBone();
    applyBoneUpdates(bone, [updateToRotationY, updateToRotationYAgain]);
    expect(bone.rotation).toEqual([1, 5, 3]);
  });
  it("supports updating multiple properties of the bone ", () => {
    const bone = getBone();
    applyBoneUpdates(bone, [
      updateToRotationY,
      updateToRotationYAgain,
      updateToTranslationX
    ]);
    expect(bone.rotation).toEqual([1, 5, 3]);
    expect(bone.translation).toEqual([2, 2, 3]);
  });
});
