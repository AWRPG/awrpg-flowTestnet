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
  isRole,
  selectFirstHost,
  selectNextHost,
} from "../../../logics/entity";
import { getHostPosition } from "../../../logics/path";
import { getTargetTerrainData } from "../../../logics/terrain";

/**
 * Handle user client interface
 */
export class PlayerController {
  scene: GameScene;
  uiScene: UIScene;
  components: ClientComponents;
  keyboardListener: Phaser.Input.Keyboard.KeyboardPlugin | undefined;
  cursorMoveInterval = 45;
  cursorLastDate: number = 0;

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
    const tileData = getTargetTerrainData(
      this.components,
      this.scene.systemCalls
    );
    const tileCoord = tileData ? tileData.targetCoord : null;
    const source = getComponentValue(SelectedHost, SOURCE)?.value;
    const menu = getComponentValue(SelectedEntity, MENU)?.value;

    // Move cursor
    if (!menu && this.isArrowKeysDown(event.key)) {
      if (Date.now() - this.cursorLastDate > this.cursorMoveInterval) {
        this.cursorLastDate = Date.now();
        setNewTargetTile(this.components, KEY_TO_DIRECTION[event.key]);
      }
    }
    // Select/unselect the host
    else if (tileData && !menu && (event.key === "f" || event.key === "F")) {
      const entity = tileData.coordEntity;
      const isRoleType = isRole(this.components, entity as Entity);
      if (isRoleType) {
        // Player
        this.switchTileHighlight(entity);
        // Building
        // Miner
        // Terrain
      }
    }
    // Show/hide tile highlight
    else if (!menu && (event.key === "r" || event.key === "R")) {
      // [TODO]
    }
    // Show/hide Menu
    else if ((source && event.key === "Escape") || event.key === "Meta") {
      if (!menu) {
        removeComponent(ConsoleMessage, SOURCE);
        setComponent(SelectedEntity, MENU, { value: MAIN_MENU });
      } else {
        removeComponent(SelectedEntity, MENU);
      }
    }
    // [TODO] other actions
    else {
      if (event.key === "j") {
        if (menu || !source) return;
        setComponent(SelectedEntity, MENU, { value: EXPLORE_MENU });
      } else if (event.key === "Escape") {
        if (!source) {
          selectFirstHost(this.components, this.scene.network.playerEntity);
        }
        removeComponent(ConsoleMessage, SOURCE);
        if (menu) return removeComponent(SelectedEntity, MENU);
        return setComponent(SelectedEntity, MENU, { value: MAIN_MENU });
      } else if (event.key === "q") {
        selectNextHost(this.components, this.scene.network.playerEntity);
      } else if (event.key === "k") {
        if (menu) return;
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

  switchTileHighlight(target: Entity) {
    if (!this.scene.tileHighlights[target]) {
      this.scene.tileHighlights[target] = new TileHighlight(
        target,
        this.components,
        this.scene,
        { canControl: true }
      );
      this.showCharacterInfo(target);
    } else {
      this.scene.tileHighlights[target].destroy();
      delete this.scene.tileHighlights[target];
      this.hideCharacterInfo(target);
    }
  }

  showCharacterInfo(target: Entity) {
    const hp = this.scene.hosts[target]?.root.getData(
      hexToString(BLOOD, { size: 32 })
    ) as number;
    const maxHp = this.scene.hosts[target]?.root.getData(
      "max" + hexToString(BLOOD, { size: 32 })
    ) as number;
    this.uiScene.characterInfo?.hpNum.setText(hp + " / " + maxHp);
    const sp = this.scene.hosts[target]?.root.getData(
      hexToString(BLOOD, { size: 32 })
    ) as number;
    const maxSp = this.scene.hosts[target]?.root.getData(
      "max" + hexToString(STAMINA, { size: 32 })
    ) as number;
    this.uiScene.characterInfo?.spNum.setText(sp + " / " + maxSp);
    this.uiScene.characterInfo?.show();
    this.scene.hosts[target]?.root.on(
      "changedata",
      this.uiScene.onDataChanged,
      this.uiScene
    );
  }

  hideCharacterInfo(target: Entity) {
    this.uiScene?.characterInfo?.hidden();
    this.scene.hosts[target]?.root.off("changedata");
  }
}
