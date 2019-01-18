export class InputManager {
  keysDown: { [id: string]: boolean };
  keysPressed: { [id: string]: boolean };
  mouseDown: {
    left: boolean;
    right: boolean;
  };
  mousePressed: {
    left: boolean;
    right: boolean;
  };
  mouseDelta: { x: number; y: number };
  tempMouseDelta: { x: number; y: number };
  queue: Function[];
  constructor() {
    this.keysDown = {};
    this.keysPressed = {};
    this.mouseDown = { left: false, right: false };
    this.mousePressed = { left: false, right: false };
    this.mouseDelta = { x: 0, y: 0 };
    this.tempMouseDelta = { x: 0, y: 0 };
    this.queue = [];
  }
  update() {
    // swap in the latest mouse coords
    this.mouseDelta = this.tempMouseDelta;
    this.tempMouseDelta = { x: 0, y: 0 };
    // reset which keys were struck
    this.keysPressed = {};
    this.mousePressed = { left: false, right: false };
    // play back the events
    this.queue.map(e => e());
    this.queue = [];
  }
  register(window: Window) {
    window.addEventListener("mousedown", () => {
      this.queue.push(() => (this.mouseDown.left = true));
      this.queue.push(() => (this.mousePressed.left = true));
    });
    window.addEventListener("contextmenu", e => {
      e.preventDefault();
      this.queue.push(() => (this.mouseDown.right = true));
      this.queue.push(() => (this.mousePressed.right = true));
    });
    window.addEventListener("mouseup", e => {
      if (e.button === 2) {
        this.queue.push(() => (this.mouseDown.right = false));
      } else {
        this.queue.push(() => (this.mouseDown.left = false));
      }
    });
    window.addEventListener("keyup", e => {
      this.queue.push(() => (this.keysDown[e.key] = false));
    });

    window.addEventListener("keydown", e => {
      this.queue.push(() => {
        this.keysDown[e.key] = true;
        this.keysPressed[e.key] = true;
      });
    });

    window.addEventListener("mousemove", ev => {
      // update this directly because we don't want to queue up dozens of
      // mouse moves per frame
      this.tempMouseDelta.x += ev.movementX;
      this.tempMouseDelta.y += ev.movementY;
    });
  }
}
