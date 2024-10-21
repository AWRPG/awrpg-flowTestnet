import { UIScene } from "../scenes/UIScene";
import { GuiBase } from "./GuiBase";
import { ALIGNMODES } from "../../constants";
import { UIList } from "../components/ui/common/UIList";
import { Box } from "../components/ui/Box";
import { Box2 } from "../components/ui/Box2";
import { UIText } from "../components/ui/common/UIText";
import { ButtonA } from "../components/ui/ButtonA";
import { MenuTitle } from "../components/ui/MenuTitle";
import { UIController } from "../components/controllers/UIController";
import { SceneObjectController } from "../components/controllers/SceneObjectController";
import { Role } from "../objects/Role";
import { UIBase } from "../components/ui/common/UIBase";
import { UIEvents } from "../components/ui/common/UIEvents";
import {
  calculatePathMoves,
  calculatePathCoords,
  Direction,
  setNewTargetTile,
} from "../../logics/move";
import { Hex } from "viem";
import { Coord } from "../../utils/pathFinding";
import { PlayerInput } from "../components/controllers/PlayerInput";

/**
 * show the action buttons player can do
 */
export class MoveTips extends GuiBase {
  role?: Role;
  prevGui?: GuiBase;
  path?: Coord[] | null;

  /** */
  constructor(scene: UIScene) {
    super(
      scene,
      new Box2(scene, {
        width: 660,
        height: 90,
        marginY: 20,
        alignModeName: ALIGNMODES.MIDDLE_TOP,
      })
    );
    this.name = "MoveTips";
    this.focusUI = this.rootUI;
    this.rootUI.on(UIEvents.UP, this.onUp, this);
    this.rootUI.on(UIEvents.DOWN, this.onDown, this);
    this.rootUI.on(UIEvents.LEFT, this.onLeft, this);
    this.rootUI.on(UIEvents.RIGHT, this.onRight, this);
    this.rootUI.on(UIEvents.CONFIRM, this.onConfirm, this);
    this.rootUI.on(UIEvents.CANCEL, this.onCancel, this);

    new UIText(scene, "[WASD] / [Arrow] move\n [F] confirm   [X] cancel", {
      fontFamily: "ThaleahFat",
      fontSize: 32,
      fontColor: "#233",
      textAlign: "center",
      lineSpacing: 12,
      alignModeName: ALIGNMODES.MIDDLE_TOP,
      marginY: 16,
      fontStyle: "500",
      parent: this.rootUI,
    });
  }

  show(role: Role, prevGui?: GuiBase) {
    super.show();
    this.role = role;
    this.prevGui = prevGui;
    // Bundle a fork object of role to cursor
    const fakeObj = SceneObjectController.cursor?.setAccessory(
      this.role.entity
    ) as Role;
    fakeObj.setPosition(0, 0).alpha = 0.75;
    fakeObj.y -= 3;
    fakeObj.doWalkAnimation();
    SceneObjectController.openTileHighlight(role.entity);
    PlayerInput.onlyListenUI();
  }

  hidden() {
    super.hidden();
  }

  onUp() {
    SceneObjectController.setTargetTilePosition(Direction.UP);
    this.onARROW();
  }
  onDown() {
    SceneObjectController.setTargetTilePosition(Direction.DOWN);
    this.onARROW();
  }
  onLeft() {
    SceneObjectController.setTargetTilePosition(Direction.LEFT);
    this.onARROW();
  }
  onRight() {
    SceneObjectController.setTargetTilePosition(Direction.RIGHT);
    this.onARROW();
  }

  onARROW() {
    if (!this.role) return;
    const highlights =
      SceneObjectController.scene.tileHighlights[this.role.entity];
    if (this.path) highlights.changeTypeByCoords("move", this.path);
    this.path = calculatePathCoords(this.components, this.role.entity);
    if (!this.path || this.path.length > 20) return;
    this.path.forEach((coord) => {
      coord.x -= this.role?.tileX ?? 0;
      coord.y -= this.role?.tileY ?? 0;
    });
    highlights.changeTypeByCoords("build", this.path);
  }

  onConfirm() {
    if (!this.role) return;

    // get the steps to move
    const moves = calculatePathMoves(this.components, this.role.entity);
    if (!moves || moves.length === 0 || moves.length > 20) return;

    // Post to chain
    this.systemCalls.move(this.role.entity as Hex, moves as number[]);

    // Flag the role state
    this.role.isMoving = true;

    // Put the fork object on Scene
    SceneObjectController.cursor?.putAccessory(this.role.entity);

    // Close the GUI
    const highlights =
      SceneObjectController.scene.tileHighlights[this.role.entity];
    if (this.path) highlights.clearPartHighlight(this.path);
    else SceneObjectController.closeTileHighlight(this.role.entity);
    this.hidden();

    // Scene focus back to the observer
    SceneObjectController.resetFocus();
    PlayerInput.onlyListenSceneObject();
  }

  onCancel() {
    // Update GUI
    this.hidden();
    this.prevGui?.show();

    // Clear fork object
    if (!this.role) return;
    SceneObjectController.closeTileHighlight(this.role.entity);
    SceneObjectController.cursor?.clearAccessory(this.role.entity);

    // Reset the target tile
    setNewTargetTile(this.components, this.role.tilePosition);
  }
}
