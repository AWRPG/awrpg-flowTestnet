import { SetupResult } from "../../mud/setup";
import { Vector } from "../../utils/vector";
import { CharacterInfo } from "../ui/CharacterInfo";
import { getComponentValue } from "@latticexyz/recs";
import { SOURCE } from "../../constants";

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
    // console.log(this.components);
  }

  preload() {
    this.load.image("ui-box", "src/assets/ui/UI_Paper_Frame_01_Standard.png");
    this.load.image("avatar-farmer-1-1", "src/assets/avatars/farmer_1_1.png");
    this.load.image("bar_empty", "src/assets/ui/bar_empty.png");
    this.load.image("bar_red", "src/assets/ui/bar_red.png");
    this.load.image("bar_blue", "src/assets/ui/bar_blue.png");
    this.load.image("bar_yellow", "src/assets/ui/bar_yellow.png");
  }

  create() {
    this.characterInfo = new CharacterInfo(this);
  }

  onDataChanged(parent: unknown, key: string, data: unknown) {
    const { SelectedHost, Commander } = this.components;
    const selectedHost = getComponentValue(SelectedHost, SOURCE)?.value;
    console.log(selectedHost);
    // console.log(parent);
    console.log(key);
    console.log(data);
  }
}
