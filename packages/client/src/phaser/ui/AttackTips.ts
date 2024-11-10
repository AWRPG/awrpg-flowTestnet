import { UIScene } from "../scenes/UIScene";
import { GuiBase } from "./GuiBase";
import { ALIGNMODES, HIGHLIGHT_MODE, OBSERVER } from "../../constants";
import { Box2 } from "../components/ui/Box2";
import { Heading2 } from "../components/ui/Heading2";
import { UIText } from "../components/ui/common/UIText";
import { SceneObjectController } from "../components/controllers/SceneObjectController";
import { Role } from "../objects/Role";
import { UIBase } from "../components/ui/common/UIBase";
import {
  calculatePathMoves,
  calculatePathCoords,
  Direction,
  setNewTargetTile,
} from "../../logics/move";
import { Coord } from "../../utils/pathFinding";
import { PlayerInput } from "../components/controllers/PlayerInput";
import { MAX_MOVES } from "../../contract/constants";
import { getEntityOnCoord } from "../../logics/map";
import { isRole, isBuilding } from "../../logics/entity";
import { BuildingData, BuildingSpecs } from "../../api/data";
import { getRoleAndHostAdjacentCoord } from "../../logics/building";
import { canStoreERC721 } from "../../logics/container";
import { Hex, toHex } from "viem";
import { getCombatRange } from "../../logics/combat";

export class AttackTips extends GuiBase {
  role?: Role;
  path?: Coord[] | null;
  targetHighlights: Phaser.GameObjects.Sprite[] = [];

  /** */
  constructor(scene: UIScene) {
    super(
      scene,
      new UIBase(scene, {
        width: 660,
        height: scene.game.scale.height,
        alignModeName: ALIGNMODES.MIDDLE_TOP,
      })
    );
    this.name = "AttackTips";
    this.focusUI = this.rootUI;

    const box2 = new Box2(scene, {
      width: 660,
      height: 90,
      marginY: 20,
      alignModeName: ALIGNMODES.MIDDLE_TOP,
      parent: this.rootUI,
    });

    new UIText(scene, "[WASD] / [Arrow] move\n [F] confirm   [X] cancel", {
      fontFamily: "ThaleahFat",
      fontSize: 32,
      fontColor: "#233",
      textAlign: "center",
      lineSpacing: 12,
      alignModeName: ALIGNMODES.MIDDLE_TOP,
      marginY: 16,
      fontStyle: "500",
      parent: box2,
    });
  }

  show(role: Role, prevGui?: GuiBase) {
    super.show();
    this.onMenuListen();
    this.role = role;
    this.prevGui = prevGui;
    const range = getCombatRange(this.components, role.entity);
    this.targetHighlights = [];
    const highlight = SceneObjectController.openTileHighlight(
      role.entity,
      1,
      HIGHLIGHT_MODE.ATTACK,
      range,
      1,
      1
    );
    this.scene.tweens.add({
      targets: highlight,
      alpha: 0.8,
      duration: 1500,
      repeat: -1,
      yoyo: true,
    });
    PlayerInput.onlyListenUI();
  }

  hidden() {
    this.offMenuListen();
    // const cursor = SceneObjectController.scene.cursor;
    // if (cursor) cursor.visible = true;
    super.hidden();
  }

  onUp() {
    const cursor = SceneObjectController.scene.cursor;
    if (cursor) this.onArrow(cursor.tileX, cursor.tileY - 1);
    SceneObjectController.setTargetTilePosition(Direction.UP);
  }
  onDown() {
    const cursor = SceneObjectController.scene.cursor;
    if (cursor) this.onArrow(cursor.tileX, cursor.tileY + 1);
    SceneObjectController.setTargetTilePosition(Direction.DOWN);
  }
  onLeft() {
    const cursor = SceneObjectController.scene.cursor;
    if (cursor) this.onArrow(cursor.tileX - 1, cursor.tileY);
    SceneObjectController.setTargetTilePosition(Direction.LEFT);
  }
  onRight() {
    const cursor = SceneObjectController.scene.cursor;
    if (cursor) this.onArrow(cursor.tileX + 1, cursor.tileY);
    SceneObjectController.setTargetTilePosition(Direction.RIGHT);
  }

  onArrow(tileX: number, tileY: number) {
    if (!this.role) return;
    const highlights =
      SceneObjectController.scene.tileHighlights[this.role.entity];
    const tileSize = highlights.tileSize;

    // Reset highlight effect
    // SceneObjectController.scene.cursor!.visible = true;
    this.targetHighlights.forEach((highlight) => {
      if (highlight.texture.key === "highlight-attack3") {
        // highlight.setScale(1);
        // highlight.setTexture("highlight-attack2");
      }
    });
    this.targetHighlights = [];

    // Show the focus highlight tile
    const x = tileX - this.role.tileX;
    const y = tileY - this.role.tileY;
    highlights.highlightObjs.forEach((highlight) => {
      if (highlight.x / tileSize === x && highlight.y / tileSize === y) {
        if (highlight.texture.key === "highlight-attack2") {
          // SceneObjectController.scene.cursor!.visible = false; // Hide cursor
          // highlight.setScale(1.2);
          // highlight.setTexture("highlight-attack3");
          this.targetHighlights.push(highlight);
        }
      }
    });
  }

  onConfirm() {
    const cursor = SceneObjectController.scene.cursor;
    const highlight = this.targetHighlights[0];
    if (!this.role || !highlight || !cursor) return;

    highlight.setTexture("highlight-attack3");
    this.scene.tweens.add({
      targets: highlight,
      alpha: 0,
      duration: 150,
      repeat: 2,
      yoyo: true,
      onComplete: () => {
        // Close the GUI
        this.hidden();
        if (this.role)
          SceneObjectController.closeTileHighlight(this.role.entity);

        // Scene focus back to the observer
        SceneObjectController.resetFocus();
        PlayerInput.onlyListenSceneObject();
      },
    });
    const tileSize = this.role.tileSize;
    const sth = getEntityOnCoord(this.components, cursor.tilePosition);
    this.systemCalls.attack(this.role.entity as Hex, sth as Hex);
  }

  onCancel() {
    // Update GUI
    this.hidden();
    this.prevGui?.show();

    // Clear copy object
    if (!this.role) return;
    SceneObjectController.closeTileHighlight(this.role.entity);
    SceneObjectController.cursor?.clearAccessory(this.role.entity);

    // Reset the target tile
    setNewTargetTile(this.components, this.role.tilePosition);
  }
}
