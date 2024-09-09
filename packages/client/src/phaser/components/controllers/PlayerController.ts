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
  SOURCE,
  MENU,
  MAIN_MENU,
  EXPLORE_MENU,
  TARGET,
  terrainMapping,
} from "../../../constants";
import {
  setNewTargetTile,
  KEY_TO_DIRECTION,
  combineToEntity,
  calculatePathMoves,
} from "../../../logics/move";
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
import { Hex } from "viem";

/**
 * Handle user client interface
 */
export class PlayerController {
  scene: GameScene;
  uiScene: UIScene;
  components: ClientComponents;
  keyboardListener: Phaser.Input.Keyboard.KeyboardPlugin | undefined;
  cursorMoveInterval = 125;
  cursorLastDate: number = 0;
  movable: boolean = true;
  moveEntity: Entity | undefined;
  tileData: TileData | undefined;
  menu: Entity | undefined;

  constructor(scene: GameScene, components: ClientComponents) {
    this.scene = scene;
    this.uiScene = scene.scene.get("UIScene") as UIScene;
    this.components = components;
    this.keyboardListener = this.scene.input.keyboard?.on(
      "keydown",
      this.onKeyboard,
      this
    );
  }

  /**
   * Keyboard input
   */
  onKeyboard(event: KeyboardEvent) {
    // Update
    const {
      SelectedHost,
      SelectedEntity,
      TargetTile,
      TileEntity,
      ConsoleMessage,
    } = this.components;
    const tileData = (this.tileData = getTargetTerrainData(
      this.components,
      this.scene.systemCalls
    ));
    const entity = tileData ? tileData.coordEntity : null;
    const type = entity
      ? isRole(this.components, entity)
        ? "role"
        : isBuilding(this.components, entity)
          ? "building"
          : null
      : null;

    const source = getComponentValue(SelectedHost, SOURCE)?.value;

    const menu = (this.menu = getComponentValue(SelectedEntity, MENU)?.value);
    if (menu) this.movable = false;
    const onMenu = menu || this.uiScene.isFocusOn();

    // Move cursor on tiles
    if (this.movable && this.isArrowKeysDown(event.key)) {
      if (!tileData) return;
      if (Date.now() - this.cursorLastDate < this.cursorMoveInterval)
        // check time interval
        return;
      this.cursorLastDate = Date.now();
      this.uiScene.terrainUI?.hidden();
      // move to new tile
      setNewTargetTile(this.components, KEY_TO_DIRECTION[event.key]);
    }

    // Move on menu
    else if (this.uiScene.isFocusOn() && this.isArrowKeysDown(event.key)) {
      const ui = this.uiScene.focusUI[this.uiScene.focusUI.length - 1];
      if (!ui?.buttons) return;
      if (["w", "W"].includes(event.key)) ui.prevButton();
      if (["s", "S"].includes(event.key)) ui.nextButton();
    }

    // Select the host & terrain
    else if (!onMenu && ["f", "F"].includes(event.key)) {
      if (!tileData || !entity) return;
      const entityObj: Host = this.scene.hosts[entity];
      // Select character
      if (type === "role") {
        this.setCharacterInfo(entityObj);
        // Player role
        if (entityObj.isPlayer) {
          this.openTileHighlight(entity, 0.75);
          this.movable = false;
          this.uiScene.actionMenu?.show();
        }
        // Other Role
        else {
          this.openTileHighlight(entity, 0.75);
        }
      }
      // Building
      else if (type === "building") {
        console.log("TODO:Building");
      }
      // Miner
      // TODO: actions to miner?
    }

    // Select the action menu
    else if (onMenu && ["f", "F"].includes(event.key)) {
      const ui = this.uiScene.focusUI[this.uiScene.focusUI.length - 1];
      if (!ui) return;
      if (ui.name === "ActionMenu" && ui.buttons) {
        if (!tileData || !entity) return;
        const actionName = ui.buttons[ui.currentButtonIndex]?.name;
        switch (actionName) {
          // Move to & Enter buildings
          case "Move":
            this.movable = true;
            this.uiScene.actionMenu?.hidden();
            this.openTileHighlight(entity);
            this.moveEntity = entity;
            this.scene.hosts[entity].root.setAlpha(0.5);
            this.scene.cursor?.setAccessory(entity, "role"); // Bundle hostObj to cursor
            this.uiScene.moveTips?.show();
            break;

          // Attack
          // 1. Selected a host
          // 2. Select any tile
          case "Attack":
            break;

          // Build or Create NPC
          case "Build":
            break;

          // Change terrains
          case "Change Terrain":
            break;

          // [In a miner] Start Mining
          // [In a miner] Stop Mining
        }
      } else if (ui.name === "MoveTips") {
        const moveEntity = this.scene.cursor?.accessories;
        if (!this.moveEntity || !this.scene.cursor) return;
        const moves = calculatePathMoves(this.components, this.moveEntity);
        if (!moves || moves.length === 0) return;
        this.scene.systemCalls.move(this.moveEntity as Hex, moves as number[]);
        this.closeTileHighlight(this.moveEntity);
        this.scene.cursor.clearAccessory(this.moveEntity);
        this.scene.hosts[this.moveEntity].movesAnimation(moves);
        this.uiScene.moveTips?.hidden();
      }
    }

    // Show/hide terrain UI
    else if (event.key === "r" || event.key === "R") {
      if (!tileData) return;
      // Show/hide terrain ui
      if (this.uiScene.terrainUI?.isVisible === false) {
        const terrainName = terrainMapping[tileData.terrainType];
        this.uiScene.terrainUI.show(false);
        this.uiScene.terrainUI.setData("terrainName", terrainName);
      } else {
        this.uiScene.terrainUI?.hidden();
      }
    }

    // Hide Menu
    else if (["Escape", "Meta", "x", "X"].includes(event.key)) {
      if (!onMenu) {
        removeComponent(ConsoleMessage, SOURCE);
        setComponent(SelectedEntity, MENU, { value: MAIN_MENU });
      } else {
        removeComponent(SelectedEntity, MENU);
        switch (this.uiScene.focusUI.pop()) {
          case this.uiScene.actionMenu:
            if (entity) this.closeTileHighlight(entity);
            this.movable = true;
            this.uiScene.actionMenu?.hidden();
            break;
          case this.uiScene.moveTips:
            this.uiScene.moveTips?.hidden();
            this.uiScene.actionMenu?.show();
            if (entity) {
              // this.openTileHighlight(entity, 0.75);
            }
            this.movable = false;
            if (this.moveEntity) {
              this.openTileHighlight(this.moveEntity, 0.75);
              this.scene.cursor?.clearAccessory(this.moveEntity);
              this.scene.hosts[this.moveEntity].root.setAlpha(1);
              const coord = getHostPosition(
                this.components,
                this.scene.network,
                this.moveEntity
              );
              if (!coord) return;
              setComponent(TargetTile, TARGET, {
                value: combineToEntity(coord.x, coord.y),
              });
              this.moveEntity = undefined;
            }
        }
      }
    }

    // [TODO] other actions
    else {
      if (event.key === "j") {
        if (onMenu || !source) return;
        setComponent(SelectedEntity, MENU, { value: EXPLORE_MENU });
      } else if (event.key === "Escape") {
        if (!source) {
          selectFirstHost(this.components, this.scene.network.playerEntity);
        }
        removeComponent(ConsoleMessage, SOURCE);
        if (onMenu) return removeComponent(SelectedEntity, MENU);
        return setComponent(SelectedEntity, MENU, { value: MAIN_MENU });
      } else if (event.key === "q") {
        selectNextHost(this.components, this.scene.network.playerEntity);
      } else if (event.key === "k") {
        if (onMenu) return;
        if (source) {
          const coord = getHostPosition(
            this.components,
            this.scene.network,
            source
          );
          if (!coord) return;
          setComponent(TargetTile, TARGET, {
            value: combineToEntity(coord.x, coord.y),
          });
        }
      }
    }
  }

  /**
   * Is the arrow key down
   */
  isArrowKeysDown(key: string) {
    if (
      ["w", "a", "s", "d", "W", "A", "S", "D"].includes(key) ||
      key.includes("Arrow")
    )
      return true;
  }

  /**
   * Open the tile highlight of a role
   */
  openTileHighlight(target: Entity, alpha: number = 1) {
    if (this.scene.tileHighlights[target]) this.closeTileHighlight(target);
    this.scene.tileHighlights[target] = new TileHighlight(
      target,
      this.components,
      this.scene,
      { canControl: true, alpha }
    );
    this.uiScene.characterInfo?.show(false);
  }

  /**
   * Close the tile highlight of a role
   */
  closeTileHighlight(target: Entity) {
    if (this.scene.tileHighlights[target]) {
      this.scene.tileHighlights[target].destroy();
      delete this.scene.tileHighlights[target];
      this.uiScene.characterInfo?.hidden();
    }
  }

  setCharacterInfo(entityObj: Host) {
    const hp = entityObj.properties.get("BLOOD");
    const maxHp = entityObj.properties.get("maxBLOOD");
    const sp = entityObj.properties.get("STAMINA");
    const maxSp = entityObj.properties.get("maxSTAMINA");
    this.uiScene.characterInfo?.setData("hp", hp + "/" + maxHp);
    this.uiScene.characterInfo?.setData("sp", sp + "/" + maxSp);
  }
}
