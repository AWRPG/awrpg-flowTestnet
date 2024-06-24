import { SetupResult } from "../../mud/setup";
import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  network: SetupResult["network"];
  components: SetupResult["components"];
  systemCalls: SetupResult["systemCalls"];

  constructor(
    setupResult: SetupResult,
    config?: Phaser.Types.Scenes.SettingsConfig
  ) {
    super(config);
    this.network = setupResult.network;
    this.components = setupResult.components;
    this.systemCalls = setupResult.systemCalls;
  }

  preload() {}

  create() {}

  update() {}

  createAnimations() {}
}
