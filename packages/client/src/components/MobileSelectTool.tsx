import { SelectTool } from "tldraw";
import { PointingCanvas } from "./MobileTool/PointingCanvas";
import { Dragging } from "./MobileTool/Dragging";
import { Idle } from "./MobileTool/Idle";

// @ts-ignore
export class MobileSelectTool extends SelectTool {
  static override id = "mobileSelect";
  static override initial = "idle";
  reactor: undefined | (() => void) = undefined;
  static override children = () => [
    ...filteredSelectTool,
    Idle,
    PointingCanvas,
    Dragging,
  ];
}

const filteredSelectTool = SelectTool.children().filter(
  (c) => c.id != "pointing_canvas" && c.id != "idol",
);
