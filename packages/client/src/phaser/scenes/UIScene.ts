import { SetupResult } from "../../mud/setup";
import { CharacterInfo } from "../ui/CharacterInfo";
import { TerrainUI } from "../ui/TerrainUI";
import { ActionMenu } from "../ui/ActionMenu";
import { UIManager } from "../ui/UIManager";

export class UIScene extends Phaser.Scene {
  /**
   * width of the window
   */
  width: number = 1280;

  /**
   * height of the window
   */
  height: number = 720;

  characterInfo: CharacterInfo | undefined;
  terrainUI: TerrainUI | undefined;
  actionMenu: ActionMenu | undefined;

  focusUI: UIManager | undefined;

  network: SetupResult["network"];
  components: SetupResult["components"];
  systemCalls: SetupResult["systemCalls"];

  /**
   * @param setupResult
   * @param config
   */
  constructor(setupResult: SetupResult, config: Phaser.Types.Core.GameConfig) {
    super({ ...config, key: "UIScene", active: true });
    this.width = Number(config.scale?.width);
    this.height = Number(config.scale?.height);

    this.network = setupResult.network;
    this.components = setupResult.components;
    this.systemCalls = setupResult.systemCalls;
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
  }

  isFocusOn() {
    if (this.actionMenu?.isVisible) return true;
  }
}
