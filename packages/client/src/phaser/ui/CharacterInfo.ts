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
import { SpBar } from "../components/ui/SpBar";
import { Host } from "../objects/Host";

export class CharacterInfo extends GuiBase {
  avatar: UIImage;
  characterName: UIText;
  hpBar: HpBar;
  hpName: UIText;
  hpNum: UIText;
  spBar: UISlider;
  spName: UIText;
  spNum: UIText;

  constructor(scene: Phaser.Scene) {
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

    this.hpNum = new Heading3(this.scene, "1 / 1", {
      alignModeName: ALIGNMODES.RIGHT_TOP,
      marginX: 4,
      marginY: -20,
      parent: this.hpBar,
    });

    this.spBar = new SpBar(this.scene, {
      width: 358,
      height: 30,
      marginX: 268,
      marginY: 140,
      parent: this.rootUI,
    });

    this.spName = new Heading3(this.scene, "SP", {
      marginX: 4,
      marginY: -20,
      parent: this.spBar,
    });

    this.spNum = new Heading3(this.scene, "1 / 1", {
      alignModeName: ALIGNMODES.RIGHT_TOP,
      marginX: 4,
      marginY: -20,
      parent: this.spBar,
    });
  }

  show(role: Host) {
    super.show();
    const hp = role.properties.get("BLOOD") ?? 0;
    const maxHp = role.properties.get("maxBLOOD") ?? 0;
    const sp = role.properties.get("STAMINA") ?? 0;
    const maxSp = role.properties.get("maxSTAMINA") ?? 0;
    this.hpNum.text = hp + "/" + maxHp;
    this.hpBar.max = maxHp;
    this.hpBar.value = hp;
    this.spNum.text = sp + "/" + maxSp;
    this.spBar.max = maxSp;
    this.spBar.value = sp;

    // this.hpBar.listenComponentValue(
    //   role.components.PoolOf,
    //   (value: any) => {
    //     this.hpName.text = value.toString();
    //   },
    //   role.entity
    // );
  }
}
