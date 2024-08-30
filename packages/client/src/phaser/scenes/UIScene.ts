import { SetupResult } from "../../mud/setup";
import { Vector } from "../../utils/vector";
import { CharacterInfo } from "../ui/CharacterInfo";

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

  /**
   * @param setupResult
   * @param config
   */
  constructor(setupResult: SetupResult, config: Phaser.Types.Core.GameConfig) {
    super({ ...config, key: "UIScene", active: true });
    this.width = Number(config.scale?.width);
    this.height = Number(config.scale?.height);
  }

  preload() {
    this.load.image("ui-box", "src/assets/ui/UI_Paper_Frame_01_Standard.png");
    this.load.image("avatar-farmer-1-1", "src/assets/avatars/farmer_1_1.png");
    this.load.image("bar_empty", "src/assets/ui/bar_empty.png");
    this.load.image("bar_red", "src/assets/ui/bar_red.png");
  }

  create() {
    this.characterInfo = new CharacterInfo(this);
  }
}
