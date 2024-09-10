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
  UI_NAME,
  HIGHLIGHT_MODE,
} from "../../../constants";
import {
  setNewTargetTile,
  KEY_TO_DIRECTION,
  combineToEntity,
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
import { UIManager } from "../../ui/UIManager";

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
    const entity = tileData ? tileData.coordEntity : undefined;
    const type = entity
      ? isRole(this.components, entity)
        ? "role"
        : isBuilding(this.components, entity)
          ? "building"
          : undefined
      : undefined;

    const source = getComponentValue(SelectedHost, SOURCE)?.value;

    const menu = (this.menu = getComponentValue(SelectedEntity, MENU)?.value);
    if (menu) this.movable = false;
    const onMenu = menu || this.uiScene.isFocusOn();

    // Move cursor on tiles
    if (this.movable && this.isArrowKeysDown(event.key) && tileData) {
      if (Date.now() - this.cursorLastDate < this.cursorMoveInterval) return; // check time interval
      this.cursorLastDate = Date.now();
      this.uiScene.terrainUI?.hidden();
      setNewTargetTile(this.components, KEY_TO_DIRECTION[event.key]); // move to new tile
    }

    // Move cursor on menu
    else if (this.uiScene.isFocusOn() && this.isArrowKeysDown(event.key)) {
      const ui = this.getFocusUI();
      if (!ui || !this.isMenu(ui)) return;
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
          if (entityObj.isMoving) return;
          this.uiScene.characterInfo?.show(false);
          this.movable = false;
          this.uiScene.actionMenu?.show();
        }
        // Other Role
        else {
          this.uiScene.characterInfo?.show(false);
        }
      }
      // Building
      else if (type === "building") {
        console.log("TODO:Building");
      }
      // Miner
      // [TODO]: actions to miner?
    }

    // Select items on menu
    else if (onMenu && ["f", "F"].includes(event.key)) {
      const ui = this.getFocusUI();
      if (!ui) return;
      // Action Menu
      if (ui.name === UI_NAME.ACTION_MENU) {
        if (!tileData || !entity || !ui.buttons) return;
        const actionName = ui.buttons[ui.currentButtonIndex].name;
        switch (actionName) {
          case "Move": // Move to & Enter buildings
            this.movable = true;
            this.uiScene.actionMenu?.hidden(false);
            this.openTileHighlight(entity);
            this.moveEntity = entity;
            this.scene.hosts[entity].root.setAlpha(0.5);
            this.scene.cursor?.setAccessory(entity, "role"); // Bundle hostObj to cursor
            this.uiScene.moveTips?.show();
            break;
          case "Attack": // Selected a host or Select a range tils
            break;
          case "Build": // Build a buiding (or Create a NPC)
            this.movable = false;
            this.moveEntity = undefined;
            this.uiScene.actionMenu?.hidden(false);
            this.uiScene.buildMenu?.show();
            break;
          case "Change Terrain": // Change terrains
            break;
          // [In a miner] Start Mining
          // [In a miner] Stop Mining
        }
      }
      // Move Tips
      else if (ui.name === UI_NAME.MOVE_TIPS) {
        if (!this.moveEntity || !this.scene.cursor) return;
        if (type === "role" || type === "building") return;
        if (this.scene.hosts[this.moveEntity].movesUpdate()) {
          this.closeTileHighlight(this.moveEntity);
          this.uiScene.characterInfo?.hidden();
          this.scene.cursor.clearAccessory(this.moveEntity);
          this.uiScene.moveTips?.hidden();
        }
      }
      // Build Menu
      else if (ui.name === UI_NAME.BUILD_MENU) {
        if (!ui.buttons || !entity) return;
        this.movable = true;
        this.uiScene.buildMenu?.hidden(false);
        this.uiScene.buildTips?.show();
        const buildName = ui.buttons[ui.currentButtonIndex].name;
        switch (buildName) {
          case "Safe":
            this.openTileHighlight(entity, 1, HIGHLIGHT_MODE.BUILD, 1, 2, 2);
            this.moveEntity = entity;
            break;
        }
      }
      // Build Tips
      else if (ui.name === UI_NAME.BUILD_TIPS) {
        if (!this.moveEntity || !this.scene.cursor) return;
        if (this.scene.hosts[this.moveEntity]) {
          this.closeTileHighlight(this.moveEntity);
          this.uiScene.characterInfo?.hidden();
          this.scene.cursor.clearAccessory(this.moveEntity);
          this.uiScene.buildTips?.hidden();
          console.log("Build Complete!");
        }
      }
    }

    // Show/hide terrain UI
    else if (tileData && ["r", "R"].includes(event.key)) {
      if (this.uiScene.terrainUI?.isVisible === false) {
        const terrainName = terrainMapping[tileData.terrainType];
        this.uiScene.terrainUI.setData("terrainName", terrainName);
        this.uiScene.terrainUI.show(false);
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
        switch (this.uiScene.focusUI.at(-1)) {
          case this.uiScene.actionMenu: // Close Action Menu
            this.uiScene.actionMenu?.hidden();
            this.closeTileHighlight(entity);
            this.uiScene.characterInfo?.hidden();
            this.movable = true;
            break;
          case this.uiScene.buildMenu: // Close Build Menu
            this.uiScene.buildMenu?.hidden();
            this.openFocusUI();
            break;
          case this.uiScene.buildTips: // Close Build Tips
            this.uiScene.buildTips?.hidden();
          /* falls through */
          case this.uiScene.moveTips: // Close Move Tips
            this.uiScene.moveTips?.hidden();
            this.movable = false;
            this.openFocusUI();
            if (this.moveEntity) {
              this.closeTileHighlight(this.moveEntity);
              this.scene.cursor?.clearAccessory(this.moveEntity);
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
  openTileHighlight(
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
      this.components,
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
  closeTileHighlight(target: Entity | undefined) {
    if (target && this.scene.tileHighlights[target]) {
      this.scene.tileHighlights[target].hide();
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

  getFocusUI(): UIManager | undefined {
    return this.uiScene.focusUI?.length > 0
      ? this.uiScene.focusUI[this.uiScene.focusUI.length - 1]
      : undefined;
  }

  isMenu(ui: UIManager | undefined): boolean {
    return !ui || !ui?.buttons ? false : true;
  }

  openFocusUI() {
    const ui = this.uiScene.focusUI.at(-1);
    if (ui) ui.show(false);
  }
}
