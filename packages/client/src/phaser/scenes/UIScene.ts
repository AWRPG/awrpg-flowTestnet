import { SetupResult } from "../../mud/setup";
import { CharacterInfo } from "../ui/CharacterInfo";
import { TerrainUI } from "../ui/TerrainUI";
import { ActionMenu } from "../ui/ActionMenu";
import { UIManager } from "../ui/UIManager";
import { UIBase } from "../components/ui/UIBase";

export class UIScene extends Phaser.Scene {
  /**
   * components
   */
  components: SetupResult["components"];
  /**
   * width of the window
   */
  width: number = 1280;

  /**
   * height of the window
   */
  height: number = 720;

  /**
   * the UI Component which is focused on now
   */
  focusUI: UIManager | undefined;

  /**
   * show the information of current host
   */
  characterInfo: CharacterInfo | undefined;

  /**
   * show the information of current terrain
   */
  terrainUI: TerrainUI | undefined;

  /**
   * show the action buttons player can do
   */
  actionMenu: ActionMenu | undefined;

  moveTips: UIManager | undefined;

  /**
   * @param setupResult
   * @param config
   */
  constructor(setupResult: SetupResult, config: Phaser.Types.Core.GameConfig) {
    super({ ...config, key: "UIScene", active: true });
    this.components = setupResult.components;

    // Get the size of game
    this.width = Number(config.scale?.width);
    this.height = Number(config.scale?.height);
  }

  preload() {
    this.load.image("ui-empty", "src/assets/ui/empty.png");
    this.load.image("ui-box", "src/assets/ui/box_1.png");
    this.load.image(
      "ui-box-title-in-side2",
      "src/assets/ui/box_title_in_side2.png"
    );
    this.load.image(
      "ui-box-title-out-side2",
      "src/assets/ui/box_title_out_side2.png"
    );
    this.load.image("avatar-farmer-1-1", "src/assets/avatars/farmer_1_1.png");
    this.load.image("bar_empty", "src/assets/ui/bar_empty.png");
    this.load.image("bar_red", "src/assets/ui/bar_red.png");
    this.load.image("bar_blue", "src/assets/ui/bar_blue.png");
    this.load.image("bar_yellow", "src/assets/ui/bar_yellow.png");
    this.load.image("btn_decor1", "src/assets/ui/btn_decor1.png");
    this.load.image("btn_decor2", "src/assets/ui/btn_decor2.png");
    this.load.image("btn_decor3", "src/assets/ui/btn_decor3.png");
    this.load.image("btn_decor4", "src/assets/ui/btn_decor4.png");
    this.load.image("btn_select_skin", "src/assets/ui/btn_select_skin.png");
  }

  create() {
    this.characterInfo = new CharacterInfo(this);
    this.terrainUI = new TerrainUI(this);
    this.actionMenu = new ActionMenu(this);
    this.moveTips = new UIManager(this, new UIBase(this, 0, 0, {}));
    this.moveTips.name = "MoveTips";
  }

  /**
   * Determines whether the current focus is on the UIScene based on whether each complex UI component is displayed or not.
   * [Note] Display of some components like TerrainUI have no options or are not in the center of the screen does not affect the focus.
   */
  isFocusOn() {
    if (this.actionMenu?.isVisible || this.moveTips?.isVisible) return true;
  }
}
