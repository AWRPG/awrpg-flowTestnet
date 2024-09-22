import { UIScene } from "../scenes/UIScene";
import { UIManager } from "./UIManager";
import { Box } from "../components/ui/Box";
import { Avatar } from "../components/ui/Avatar";
import { UIImage } from "../components/ui/common/UIImage";
import { UIText } from "../components/ui/common/UIText";
import { Bar } from "../components/ui/Bar";
import { ALIGNMODES } from "../../constants";
import { Heading2 } from "../components/ui/Heading2";
import { Heading3 } from "../components/ui/Heading3";

export class CharacterInfo extends UIManager {
  avatar: UIImage;
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
      new Box(scene, {
        alignModeName: ALIGNMODES.LEFT_BOTTOM,
        width: 680,
        height: 192,
        marginX: 8,
        marginY: 8,
      })
    );
    this.name = "CharacterInfo";
    this.setData("hp", 1);
    this.setData("sp", 1);

    this.avatar = new Avatar(this.scene, "avatar-farmer-1-1", {
      alignModeName: ALIGNMODES.LEFT_BOTTOM,
      width: 256,
      height: 256,
      marginX: 1,
      marginY: 1,
      parent: this.rootUI,
    });

    this.characterName = new Heading2(this.scene, "Brief Kandle", {
      marginX: 268,
      marginY: 12,
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

    this.hpName = new Heading3(this.scene, "HP", {
      marginX: 4,
      marginY: -20,
      parent: this.hpBar,
    });

    this.hpNum = new Heading3(this.scene, this.hp + " / " + this.maxHp, {
      alignModeName: ALIGNMODES.RIGHT_TOP,
      marginX: 4,
      marginY: -20,
      parent: this.hpBar,
    });

    this.spBar = new Bar(this.scene, "bar_yellow", "bar_empty", 358, 30, {
      alignModeName: ALIGNMODES.LEFT_TOP,
      marginX: 268,
      marginY: 140,
      parent: this.rootUI,
      value: this.sp,
      maxValue: this.maxSp,
    });

    this.spName = new Heading3(this.scene, "SP", {
      marginX: 4,
      marginY: -20,
      parent: this.spBar,
    });

    this.spNum = new Heading3(this.scene, this.sp + " / " + this.maxSp, {
      alignModeName: ALIGNMODES.RIGHT_TOP,
      marginX: 4,
      marginY: -20,
      parent: this.spBar,
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
