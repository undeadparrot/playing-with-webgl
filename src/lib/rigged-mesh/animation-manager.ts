import * as glm from "gl-matrix";
import { TBone } from "./model";

function flatten<T>(input: T[][]): T[] {
  return Array.prototype.concat(...input);
}

export type TAnimActionChannel = {
  fromValue: number; // 0.0
  toValue: number; // 1.0
  startFrame: number; // 0
  stopFrame: number; // 2
  property: string; // rotation
  component: number; // rotation[1]
};

export type TAnimAction = {
  name: string;
  secondsPerFrame: number; //
  framecount: number; // stop action on this frame
  isStarted: boolean;
  time: number;
  channelsByBoneName: { [boneName: string]: TAnimActionChannel[] };
};

export const getSampleAction = (): TAnimAction => ({
  name: "Walk",
  secondsPerFrame: 1,
  framecount: 9,
  isStarted: false,
  time: 0,
  channelsByBoneName: {
    LegRight: [
      {
        property: "rotation",
        component: 1,
        fromValue: 0,
        toValue: 1,
        startFrame: 4,
        stopFrame: 8
      }
    ]
  }
});

export const getActiveChannels = (
  channels: TAnimActionChannel[],
  frame: number
) => channels.filter(_ => frame >= _.startFrame && frame <= _.stopFrame);

export function getChannelValue(channel: TAnimActionChannel, frame: number) {
  const frameRange = channel.stopFrame - channel.startFrame;
  const offset = frame - channel.startFrame;
  const percentage = offset / frameRange;
  const valueRange = channel.toValue - channel.fromValue;
  const quat = glm.quat.create();
  glm.quat.slerp(quat, channel.fromValue, channel.toValue, percentage);
  return quat;
}

export function applyBoneUpdates(
  bone: TBone,
  updates: { channel: TAnimActionChannel; value: number }[]
) {
  updates.map(({ channel, value }) => {
    bone[channel.property] = value;
  });
}

export class AnimationManager {
  actions: TAnimAction[];
  constructor(actions) {
    if (actions == undefined) {
      throw Error("Must provide action library");
    }
    this.actions = actions;
  }

  getBoneUpdates(name): { channel: TAnimActionChannel; value: number }[] {
    const actions = this.actions.filter(
      _ => _.isStarted && _.channelsByBoneName[name] !== undefined
    );
    return flatten(
      actions.map(action => {
        const frame = action.time / action.secondsPerFrame;
        return getActiveChannels(action.channelsByBoneName[name], frame).map(
          channel => {
            const value = getChannelValue(channel, frame);
            return { channel, value };
          }
        );
      })
    );
  }

  workAction(action: TAnimAction, deltaTime: number) {
    action.time += deltaTime;
    const frame = action.time / action.secondsPerFrame;
    if (frame >= action.framecount) {
      action.isStarted = false;
    }
  }

  public work(deltaTime: number) {
    this.actions
      .filter(_ => _.isStarted)
      .map(_ => this.workAction(_, deltaTime));
  }

  public startAction(name: string) {
    const action = this.actions.filter(_ => _.name == name)[0];
    action.isStarted = true;
    action.time = 0;
  }
}
