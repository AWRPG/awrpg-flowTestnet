import { UIScene } from "../scenes/UIScene";
import { UIManager } from "./UIManager";
import { Box } from "../components/ui/Box";
import { UIAvatar } from "../components/ui/UIAvatar";
import { UIText } from "../components/ui/UIText";
import { Bar } from "../components/ui/Bar";
import { ALIGNMODES } from "../../constants";

export class CharacterInfo extends UIManager {
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
    super(
      scene,
      new Box(scene, "ui-box", ALIGNMODES.LEFT_BOTTOM, 680, 192, 8, 8)
    );
    this.setData("hp", 1);
    this.setData("sp", 1);

    this.avatar = new UIAvatar(
      this.scene,
      "avatar-farmer-1-1",
      ALIGNMODES.LEFT_BOTTOM,
      256,
      256,
      1,
      1,
      this.rootUI
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
      this.rootUI
    );

    this.hpBar = new Bar(
      this.scene,
      "bar_red",
      "bar_empty",
      ALIGNMODES.LEFT_TOP,
      358,
      30,
      268,
      78,
      {
        value: this.hp,
        maxValue: this.maxHp,
      },
      this.rootUI
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
      140,
      {
        value: this.sp,
        maxValue: this.maxSp,
      },
      this.rootUI
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

  onDataChanged(parent: unknown, key: string, data: unknown) {
    switch (key) {
      case "hp":
        this.hpNum.setText(data as string);
        break;
      case "sp":
        this.spNum.setText(data as string);
    }
  }
}
