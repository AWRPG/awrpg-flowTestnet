import { GuiBase } from "../components/ui/common/GuiBase";
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

export class CharacterInfo extends GuiBase {
  rootUI: Box;
  avatar: UIImage;
  characterName: UIText;
  hpBar: HpBar;
  hpName: UIText;
  hpNum: UIText;
  spBar: UISlider;
  spName: UIText;
  spNum: UIText;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.name = "CharacterInfo";
    this.hidden();

    this.rootUI = new Box(scene, {
      alignModeName: ALIGNMODES.LEFT_BOTTOM,
      width: 680,
      height: 192,
      marginX: 8,
      marginY: 8,
    });

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
}
