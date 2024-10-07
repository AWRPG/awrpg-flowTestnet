import { UIScene } from "../scenes/UIScene";
import { GuiBase } from "./GuiBase";
import { Box } from "../components/ui/Box";
import { Avatar } from "../components/ui/Avatar";
import { UIImage } from "../components/ui/common/UIImage";
import { UIText } from "../components/ui/common/UIText";
import { UISlider } from "../components/ui/common/UISlider";
import { ALIGNMODES } from "../../constants";
import { Heading2 } from "../components/ui/Heading2";
import { Heading3 } from "../components/ui/Heading3";
import { HpBar } from "../components/ui/HpBar";

export class CharacterInfo extends GuiBase {
  avatar: UIImage;
  characterName: UIText;

  hpBar: HpBar;
  hpName: UIText;
  hpNum: UIText;

  hp: number = 1000;
  maxHp: number = 1000;

  spBar: UISlider;
  spName: UIText;
  spNum: UIText;

  sp: number = 1000;
  maxSp: number = 1000;

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

    this.hpBar = new HpBar(this.scene, {
      width: 358,
      height: 30,
      marginX: 268,
      marginY: 78,
      parent: this.rootUI,
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

    this.spBar = new UISlider(this.scene, "bar_empty", "bar_yellow", null, {
      width: 358,
      height: 30,
      alignModeName: ALIGNMODES.LEFT_TOP,
      marginX: 268,
      marginY: 140,
      parent: this.rootUI,
      defaultValue: this.sp,
      max: this.maxSp,
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
