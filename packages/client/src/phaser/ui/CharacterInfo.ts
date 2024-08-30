import { UIScene } from "../scenes/UIScene";
import { Box } from "../components/ui/Box";
import { UIAvatar } from "../components/ui/UIAvatar";
import { UIText } from "../components/ui/UIText";
import { Bar } from "../components/ui/Bar";
import { ALIGNMODES } from "../../constants";

export class CharacterInfo {
  scene: UIScene;

  characterBox: Box;
  avatar: UIAvatar;
  characterName: UIText;
  hpBar: Bar;

  constructor(scene: UIScene) {
    this.scene = scene;

    this.characterBox = new Box(
      this.scene,
      "ui-box",
      ALIGNMODES.LEFT_BOTTOM,
      1024,
      192,
      8,
      8
    );

    this.avatar = new UIAvatar(
      this.scene,
      "avatar-farmer-1-1",
      ALIGNMODES.LEFT_BOTTOM,
      256,
      256,
      1,
      1,
      this.characterBox
    );

    this.characterName = new UIText(
      this.scene,
      "Brief Kandle",
      ALIGNMODES.LEFT_TOP,
      268,
      24,
      32,
      undefined,
      "ToaHI",
      this.characterBox
    );

    this.hpBar = new Bar(
      this.scene,
      "bar_red",
      "bar_empty",
      ALIGNMODES.LEFT_TOP,
      358,
      30,
      268,
      40,
      this.characterBox
    );

    new UIText(
      this.scene,
      "HP",
      ALIGNMODES.LEFT_TOP,
      18,
      7,
      16,
      undefined,
      undefined,
      this.hpBar
    );
  }
}
