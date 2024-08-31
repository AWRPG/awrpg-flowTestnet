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
  hpName: UIText;
  hpNum: UIText;

  hp: number = 1;
  maxHp: number = 1;

  spBar: Bar;
  spName: UIText;
  spNum: UIText;

  sp: number = 1;
  maxSp: number = 1;

  constructor(scene: UIScene) {
    this.scene = scene;

    this.characterBox = new Box(
      this.scene,
      "ui-box",
      ALIGNMODES.LEFT_BOTTOM,
      680,
      192,
      8,
      8
    );

    this.hidden();

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
      12,
      {
        fontSize: 36,
      },
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
      48,
      {
        value: this.hp,
        maxValue: this.maxHp,
      },
      this.characterBox
    );

    this.hpName = new UIText(
      this.scene,
      "HP",
      ALIGNMODES.LEFT_TOP,
      4,
      -20,
      {
        fontSize: 16,
        fontFamily: "'Roboto Mono'",
      },
      this.hpBar
    );

    this.hpNum = new UIText(
      this.scene,
      this.hp + " / " + this.maxHp,
      ALIGNMODES.RIGHT_TOP,
      4,
      -20,
      {
        fontSize: 16,
        fontFamily: "'Roboto Mono'",
      },
      this.hpBar
    );

    this.spBar = new Bar(
      this.scene,
      "bar_yellow",
      "bar_empty",
      ALIGNMODES.LEFT_TOP,
      358,
      30,
      268,
      110,
      {
        value: this.sp,
        maxValue: this.maxSp,
      },
      this.characterBox
    );

    this.spName = new UIText(
      this.scene,
      "SP",
      ALIGNMODES.LEFT_TOP,
      4,
      -20,
      {
        fontSize: 16,
        fontFamily: "'Roboto Mono'",
      },
      this.spBar
    );

    this.spNum = new UIText(
      this.scene,
      this.sp + " / " + this.maxSp,
      ALIGNMODES.RIGHT_TOP,
      4,
      -20,
      {
        fontSize: 16,
        fontFamily: "'Roboto Mono'",
      },
      this.spBar
    );
  }

  show() {
    this.characterBox.root.setVisible(true);
  }

  hidden() {
    this.characterBox.root.setVisible(false);
  }
}
