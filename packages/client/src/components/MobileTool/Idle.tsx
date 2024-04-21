import {
  Editor,
  Group2d,
  HIT_TEST_MARGIN,
  pointInPolygon,
  StateNode,
  throttle,
  TLArrowShape,
  TLEventHandlers,
  TLShape,
  Vec,
  VecLike,
} from "tldraw";

export class Idle extends StateNode {
  static override id = "idle";
  isDarwin = window.navigator.userAgent.toLowerCase().indexOf("mac") > -1;

  override onEnter = () => {
    this.parent.setCurrentToolIdMask(undefined);
    updateHoveredId(this.editor);
    this.editor.updateInstanceState(
      { cursor: { type: "default", rotation: 0 } },
      { ephemeral: true },
    );
  };

  override onPointerMove: TLEventHandlers["onPointerMove"] = () => {
    updateHoveredId(this.editor);
  };

  override onPointerDown: TLEventHandlers["onPointerDown"] = (info) => {
    if (this.editor.getIsMenuOpen()) return;

    const shouldEnterCropMode =
      info.ctrlKey && getShouldEnterCropMode(this.editor);

    if (info.ctrlKey && !shouldEnterCropMode) {
      // On Mac, you can right click using the Control keys + Click.
      if (
        info.target === "shape" &&
        this.isDarwin &&
        this.editor.inputs.keys.has("ControlLeft")
      ) {
        if (!this.editor.isShapeOrAncestorLocked(info.shape)) {
          this.parent.transition("pointing_shape", info);
          return;
        }
      }

      this.parent.transition("brushing", info);
      return;
    }
    switch (info.target) {
      case "canvas": {
        // Check to see if we hit any shape under the pointer; if so,
        // handle this as a pointer down on the shape instead of the canvas
        const hitShape = getHitShapeOnCanvasPointerDown(this.editor);
        if (hitShape && !hitShape.isLocked) {
          this.onPointerDown({
            ...info,
            shape: hitShape,
            target: "shape",
          });
          return;
        }

        const selectedShapeIds = this.editor.getSelectedShapeIds();
        const onlySelectedShape = this.editor.getOnlySelectedShape();
        const {
          inputs: { currentPagePoint },
        } = this.editor;

        if (
          selectedShapeIds.length > 1 ||
          (onlySelectedShape &&
            !this.editor
              .getShapeUtil(onlySelectedShape)
              .hideSelectionBoundsBg(onlySelectedShape))
        ) {
          if (isPointInRotatedSelectionBounds(this.editor, currentPagePoint)) {
            this.onPointerDown({
              ...info,
              target: "selection",
            });
            return;
          }
        }

        this.parent.transition("pointing_canvas", info);
        break;
      }

      case "shape": {
        const { shape } = info;
        if (this.isOverArrowLabelTest(shape)) {
          // We're moving the label on a shape.
          this.parent.transition("pointing_arrow_label", info);
          break;
        }

        if (this.editor.isShapeOrAncestorLocked(shape)) {
          this.parent.transition("pointing_canvas", info);
          break;
        }
        this.parent.transition("pointing_shape", info);
        break;
      }
      case "handle": {
        if (this.editor.getInstanceState().isReadonly) break;
        if (this.editor.inputs.altKey) {
          this.parent.transition("pointing_shape", info);
        } else {
          this.parent.transition("pointing_handle", info);
        }
        break;
      }

      case "selection": {
        switch (info.handle) {
          case "mobile_rotate":
          case "top_left_rotate":
          case "top_right_rotate":
          case "bottom_left_rotate":
          case "bottom_right_rotate": {
            this.parent.transition("pointing_rotate_handle", info);
            break;
          }
          case "top":
          case "right":
          case "bottom":
          case "left": {
            if (shouldEnterCropMode) {
              this.parent.transition("pointing_crop_handle", info);
            } else {
              this.parent.transition("pointing_resize_handle", info);
            }
            break;
          }
          case "top_left":
          case "top_right":
          case "bottom_left":
          case "bottom_right": {
            if (shouldEnterCropMode) {
              this.parent.transition("pointing_crop_handle", info);
            } else {
              this.parent.transition("pointing_resize_handle", info);
            }
            break;
          }
          default: {
            const hoveredShape = this.editor.getHoveredShape();
            if (
              hoveredShape &&
              !this.editor.getSelectedShapeIds().includes(hoveredShape.id) &&
              !hoveredShape.isLocked
            ) {
              this.onPointerDown({
                ...info,
                shape: hoveredShape,
                target: "shape",
              });
              return;
            }

            this.parent.transition("pointing_selection", info);
          }
        }
        break;
      }
    }
  };

  override onCancel: TLEventHandlers["onCancel"] = () => {
    if (
      this.editor.getFocusedGroupId() !== this.editor.getCurrentPageId() &&
      this.editor.getSelectedShapeIds().length > 0
    ) {
      this.editor.popFocusedGroupId();
    } else {
      this.editor.mark("clearing selection");
      this.editor.selectNone();
    }
  };

  isOverArrowLabelTest(shape: TLShape | undefined) {
    if (!shape) return false;

    const pointInShapeSpace = this.editor.getPointInShapeSpace(
      shape,
      this.editor.inputs.currentPagePoint,
    );

    // todo: Extract into general hit test for arrows
    if (this.editor.isShapeOfType<TLArrowShape>(shape, "arrow")) {
      // How should we handle multiple labels? Do shapes ever have multiple labels?
      const labelGeometry =
        this.editor.getShapeGeometry<Group2d>(shape).children[1];
      // Knowing what we know about arrows... if the shape has no text in its label,
      // then the label geometry should not be there.
      if (
        labelGeometry &&
        pointInPolygon(pointInShapeSpace, labelGeometry.vertices)
      ) {
        return true;
      }
    }

    return false;
  }
}

function _updateHoveredId(editor: Editor) {
  // todo: consider replacing `get hoveredShapeId` with this; it would mean keeping hoveredShapeId in memory rather than in the store and possibly re-computing it more often than necessary
  const hitShape = editor.getShapeAtPoint(editor.inputs.currentPagePoint, {
    hitInside: false,
    hitLabels: false,
    margin: HIT_TEST_MARGIN / editor.getZoomLevel(),
    renderingOnly: true,
  });

  if (!hitShape) return editor.setHoveredShape(null);

  let shapeToHover: TLShape | undefined = undefined;

  const outermostShape = editor.getOutermostSelectableShape(hitShape);

  if (outermostShape === hitShape) {
    shapeToHover = hitShape;
  } else {
    if (
      outermostShape.id === editor.getFocusedGroupId() ||
      editor.getSelectedShapeIds().includes(outermostShape.id)
    ) {
      shapeToHover = hitShape;
    } else {
      shapeToHover = outermostShape;
    }
  }

  return editor.setHoveredShape(shapeToHover.id);
}

export const updateHoveredId =
  process.env.NODE_ENV === "test"
    ? _updateHoveredId
    : throttle(_updateHoveredId, 32);

export function getShouldEnterCropMode(editor: Editor): boolean {
  const onlySelectedShape = editor.getOnlySelectedShape();
  return !!(
    onlySelectedShape &&
    !editor.isShapeOrAncestorLocked(onlySelectedShape) &&
    editor.getShapeUtil(onlySelectedShape).canCrop(onlySelectedShape)
  );
}

export function getHitShapeOnCanvasPointerDown(
  editor: Editor,
  hitLabels = false,
): TLShape | undefined {
  const zoomLevel = editor.getZoomLevel();
  const {
    inputs: { currentPagePoint },
  } = editor;

  return (
    // hovered shape at point
    editor.getShapeAtPoint(currentPagePoint, {
      hitInside: false,
      hitLabels,
      margin: HIT_TEST_MARGIN / zoomLevel,
      renderingOnly: true,
    }) ??
    // selected shape at point
    editor.getSelectedShapeAtPoint(currentPagePoint)
  );
}

function isPointInRotatedSelectionBounds(editor: Editor, point: VecLike) {
  const selectionBounds = editor.getSelectionRotatedPageBounds();
  if (!selectionBounds) return false;

  const selectionRotation = editor.getSelectionRotation();
  if (!selectionRotation) return selectionBounds.containsPoint(point);

  return pointInPolygon(
    point,
    selectionBounds.corners.map((c) =>
      Vec.RotWith(c, selectionBounds.point, selectionRotation),
    ),
  );
}
