import { SelectTool } from "tldraw";
import { PointingCanvas } from "./MobileTool/PointingCanvas";
import { Dragging } from "./MobileTool/Dragging";

// @ts-ignore
export class MobileSelectTool extends SelectTool {
  static override id = "mobileSelect";
  static override initial = "idle";
  reactor: undefined | (() => void) = undefined;
  static override children = () => [
    ...filteredSelectTool,
    PointingCanvas,
    Dragging,
  ];
}

const filteredSelectTool = SelectTool.children().filter(
  (c) => c.id != "pointing_canvas",
);
