import { SetupResult } from "../../mud/setup";
import { Vector } from "../../utils/vector";
import { UIAvatar } from "../ui/UIAvatar";
import { Box } from "../ui/Box";
import { UIText } from "../ui/UIText";
import { Bar } from "../ui/Bar";
import { ALIGNMODES } from "../../constants";

export class UIScene extends Phaser.Scene {
  /**
   * width of the window
   */
  width: number = 1280;

  /**
   * height of the window
   */
  height: number = 720;

  /**
   * align mode to window
   */
  alignModes: {
    none: Vector;
    leftTop: Vector;
    leftBottom: Vector;
  };

  /**
   *
   */
  avatarBox: Box | undefined;
  avatar: UIAvatar | undefined;

  /**
   * @param setupResult
   * @param config
   */
  constructor(setupResult: SetupResult, config: Phaser.Types.Core.GameConfig) {
    super({ ...config, key: "UIScene", active: true });
    this.width = Number(config.scale?.width);
    this.height = Number(config.scale?.height);

    this.alignModes = {
      none: { x: 0, y: 0 },
      leftTop: { x: 0, y: 0 },
      leftBottom: { x: 0, y: this.height },
    };
  }

  preload() {
    this.load.image("ui-box", "src/assets/ui/UI_Paper_Frame_01_Standard.png");
    this.load.image("avatar-farmer-1-1", "src/assets/avatars/farmer_1_1.png");
    this.load.image("bar_empty", "src/assets/ui/bar_empty.png");
    this.load.image("bar_red", "src/assets/ui/bar_red.png");
  }

  create() {
    this.avatarBox = new Box(
      this,
      "ui-box",
      ALIGNMODES.LEFT_BOTTOM,
      1024,
      192,
      8,
      8
    );
    this.avatar = new UIAvatar(
      this,
      "avatar-farmer-1-1",
      ALIGNMODES.LEFT_BOTTOM,
      256,
      256,
      1,
      1,
      this.avatarBox
    );
    new UIText(
      this,
      "Brief Kandle",
      ALIGNMODES.LEFT_TOP,
      268,
      24,
      32,
      "#111111",
      "ToaHI",
      this.avatarBox
    );

    new Bar(
      this,
      "bar_red",
      "bar_empty",
      ALIGNMODES.LEFT_TOP,
      358,
      30,
      268,
      70,
      this.avatarBox
    );
  }
}
