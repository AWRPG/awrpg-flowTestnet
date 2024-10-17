import { GameScene } from "../../scenes/GameScene";
import { UIScene } from "../../scenes/UIScene";
import { ClientComponents } from "../../../mud/createClientComponents";
import {
  Entity,
  getComponentValue,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import {
  OBSERVER,
  SOURCE,
  MENU,
  MAIN_MENU,
  EXPLORE_MENU,
  TARGET,
  terrainMapping,
  UI_NAME,
  HIGHLIGHT_MODE,
  POOL_TYPES,
} from "../../../constants";
import { setNewTargetTile, combineToEntity } from "../../../logics/move";
import { TileHighlight } from "../../objects/TileHighlight";
import {
  isBuilding,
  isRole,
  selectFirstHost,
  selectNextHost,
} from "../../../logics/entity";
import { getHostPosition } from "../../../logics/path";
import { getTargetTerrainData, TileData } from "../../../logics/terrain";
import { Host } from "../../objects/Host";
import { GuiBase } from "../../ui/GuiBase";
import { SceneObject } from "../../objects/SceneObject";
import { UIConfig } from "../ui/common/UIConfig";
import { Observer as ObserverObject } from "../../objects/Observer";
import { UIController } from "./UIController";

export class SceneObjectController {
  static scene: GameScene;
  static cursorMoveInterval: number = 125;
  static cursorLastDate: number = 0;
  static observer?: ObserverObject;
  private static _focus?: SceneObject;

  /** Is sceneobject controller can use now */
  private static _controllable: boolean = true;

  static init(scene?: GameScene) {
    if (scene) this.scene = scene;
    this.focus = this.observer = new ObserverObject(
      OBSERVER,
      this.scene.components,
      this.scene
    );
  }

  static get focus(): SceneObject | undefined {
    return this._focus;
  }

  static set focus(obj: SceneObject | undefined) {
    if (this._focus === obj) return;
    if (this._focus) this._focus.onBlur();
    this._focus = obj;
    if (this._focus) this._focus.onFocus();
  }

  static resetFocus() {
    this.focus = this.observer;
  }

  static get controllable(): boolean {
    return this._controllable;
  }

  static set controllable(value: boolean) {
    this._controllable = value;
    if (value === true) UIController.controllable = false;
  }

  /** */
  static moveCursor(direction: number) {
    if (Date.now() - this.cursorLastDate < this.cursorMoveInterval) return; // check time interval
    this.cursorLastDate = Date.now();
    setNewTargetTile(this.scene.components, direction);
    const tileData = getTargetTerrainData(
      this.scene.components,
      this.scene.systemCalls
    );
    if (tileData)
      UIController.scene.terrainUI?.show(terrainMapping[tileData.terrainType]);
  }

  /**
   * Open the tile highlight of a role
   */
  static openTileHighlight(
    target: Entity,
    alpha: number = 1,
    mode?: string,
    distance?: number,
    width?: number,
    height?: number
  ) {
    if (this.scene.tileHighlights[target]) {
      this.closeTileHighlight(target);
      delete this.scene.tileHighlights[target];
    }
    this.scene.tileHighlights[target] = new TileHighlight(
      target,
      this.scene.components,
      this.scene,
      mode
    );
    this.scene.tileHighlights[target].calcHighlight({
      distance,
      width,
      height,
    });

    this.scene.tileHighlights[target].show(alpha);
  }

  /**
   * Close the tile highlight of a role
   */
  static closeTileHighlight(target: Entity | undefined) {
    if (target && this.scene.tileHighlights[target]) {
      this.scene.tileHighlights[target].hide();
    }
  }
}
