import { SelectTool, StateNode, TLEventHandlers } from "tldraw";

import { Dragging } from "./MobileTool/Dragging";
import { PointingCanvas } from "./MobileTool/PointingCanvas";

export class MobileTool extends StateNode {
  static override id = "mobile";
  static override initial = "idle";
  static override children = () => [
    ...filteredSelectTool,
    PointingCanvas,
    Translating,
    Dragging,
  ];
}

const filteredSelectTool = SelectTool.children().filter(
  (c) => c.id == "pointing_shape" || c.id == "idle",
);

export class Translating extends StateNode {
  static override id = "translating";

  override onPointerUp: TLEventHandlers["onPointerUp"] = () => {
    this.complete();
  };

  override onComplete: TLEventHandlers["onComplete"] = () => {
    this.complete();
  };

  protected complete() {
    this.parent.transition("idle");
  }
}
