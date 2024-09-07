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
  TerrainType,
  terrainTypeMapping,
  terrainMapping,
} from "../../../constants";
import {
  setNewTargetTile,
  KEY_TO_DIRECTION,
  combineToEntity,
} from "../../../logics/move";
import { TileHighlight } from "../../objects/TileHighlight";
import { hexToString } from "viem";
import { BLOOD, STAMINA } from "../../../contract/constants";
import {
  isBuilding,
  isRole,
  selectFirstHost,
  selectNextHost,
} from "../../../logics/entity";
import { getHostPosition } from "../../../logics/path";
import { getTargetTerrainData, TileData } from "../../../logics/terrain";
import { Host } from "../../objects/Host";

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
    const onMenu = menu || this.uiScene.isFocusOn();

    // Move cursor on tiles
    if (!onMenu && this.isArrowKeysDown(event.key)) {
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
      const ui = this.uiScene.focusUI;
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
      const ui = this.uiScene.focusUI;
      if (!ui?.buttons) return;
      if (ui.name === "ActionMenu") {
        if (!tileData || !entity) return;
        const actionName = ui.buttons[ui.currentButtonIndex]?.name;
        // const forkHost: Host = new Host(this.scene, this.components, {
        //   entity,
        //   isPlayer: false,
        //   onClick: () => {},
        // });
        switch (actionName) {
          // Move to & Enter buildings
          case "Move":
            this.uiScene.actionMenu?.hidden();
            this.openTileHighlight(entity);
            // Bundle hostObj to cursor
            // forkHost.setTilePosition(
            //   tileData.targetCoord.x + 3,
            //   tileData.targetCoord.y
            // );
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
      }
    }

    // Show/hide terrain UI
    else if (!onMenu && (event.key === "r" || event.key === "R")) {
      if (!tileData) return;
      // Show/hide terrain ui
      if (this.uiScene.terrainUI?.isVisible === false) {
        const terrainName = terrainMapping[tileData.terrainType];
        this.uiScene.terrainUI.show();
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
        this.uiScene.actionMenu?.hidden();
        if (entity) this.closeTileHighlight(entity);
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
    this.uiScene.characterInfo?.show();
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
