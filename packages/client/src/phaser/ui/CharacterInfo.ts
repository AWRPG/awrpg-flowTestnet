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
      new Box(scene, "ui-box", 680, 192, {
        alignModeName: ALIGNMODES.LEFT_BOTTOM,
        marginX: 8,
        marginY: 8,
      })
    );
    this.name = "CharacterInfo";
    this.setData("hp", 1);
    this.setData("sp", 1);

    this.avatar = new UIAvatar(this.scene, "avatar-farmer-1-1", 256, 256, {
      alignModeName: ALIGNMODES.LEFT_BOTTOM,
      marginX: 1,
      marginY: 1,
      parent: this.rootUI,
    });

    this.characterName = new UIText(this.scene, "Brief Kandle", {
      alignModeName: ALIGNMODES.LEFT_TOP,
      marginX: 268,
      marginY: 12,
      fontSize: 36,
      parent: this.rootUI,
    });

    this.hpBar = new Bar(this.scene, "bar_red", "bar_empty", 358, 30, {
      alignModeName: ALIGNMODES.LEFT_TOP,
      marginX: 268,
      marginY: 78,
      parent: this.rootUI,
      value: this.hp,
      maxValue: this.maxHp,
    });

    this.hpName = new UIText(this.scene, "HP", {
      alignModeName: ALIGNMODES.LEFT_TOP,
      marginX: 4,
      marginY: -20,
      parent: this.hpBar,
      fontSize: 16,
      fontFamily: "'Roboto Mono'",
    });

    this.hpNum = new UIText(this.scene, this.hp + " / " + this.maxHp, {
      alignModeName: ALIGNMODES.RIGHT_TOP,
      marginX: 4,
      marginY: -20,
      parent: this.hpBar,
      fontSize: 16,
      fontFamily: "'Roboto Mono'",
    });

    this.spBar = new Bar(this.scene, "bar_yellow", "bar_empty", 358, 30, {
      alignModeName: ALIGNMODES.LEFT_TOP,
      marginX: 268,
      marginY: 140,
      parent: this.rootUI,
      value: this.sp,
      maxValue: this.maxSp,
    });

    this.spName = new UIText(this.scene, "SP", {
      alignModeName: ALIGNMODES.LEFT_TOP,
      marginX: 4,
      marginY: -20,
      parent: this.spBar,
      fontSize: 16,
      fontFamily: "'Roboto Mono'",
    });

    this.spNum = new UIText(this.scene, this.sp + " / " + this.maxSp, {
      alignModeName: ALIGNMODES.RIGHT_TOP,
      marginX: 4,
      marginY: -20,
      parent: this.spBar,
      fontSize: 16,
      fontFamily: "'Roboto Mono'",
    });
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
