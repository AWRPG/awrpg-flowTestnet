import { UIScene } from "../../scenes/UIScene";
import { GuiBase, GuiBaseConfig } from "../GuiBase";
import { ALIGNMODES } from "../../../constants";
import { UIBase, UIBaseConfig } from "../../components/ui/common/UIBase";
import { UIImage } from "../../components/ui/common/UIImage";
import { Box2 } from "../../components/ui/Box2";
import { Box3 } from "../../components/ui/Box3";
import { UIEvents } from "../../components/ui/common/UIEvents";
import { UIList } from "../../components/ui/common/UIList";
import { PlayerInput } from "../../components/controllers/PlayerInput";
import { Heading2 } from "../../components/ui/Heading2";
import { ButtonA } from "../../components/ui/ButtonA";

export class TextInput extends GuiBase {
  confirmBtn: ButtonA;
  cancelBtn: ButtonA;
  constructor(scene: UIScene, config?: GuiBaseConfig) {
    super(
      scene,
      new UIImage(scene, "ui-box-title-in-side2", {
        width: 600,
        height: 200,
        nineSlice: 28,
        alignModeName: ALIGNMODES.MIDDLE_CENTER,
      }),
      config
    );
    this.name = "TextInput";
    console.log("TextInput");
    this.rootUI.setDepth(100);

    const bg = new Box3(scene, {
      width: 400,
      height: 58,
      alignModeName: ALIGNMODES.MIDDLE_TOP,
      marginY: 32,
      parent: this.rootUI,
    });

    this.confirmBtn = new ButtonA(scene, {
      width: 200,
      height: 48,
      text: "Confirm",
      parent: bg,
      alignModeName: ALIGNMODES.LEFT_BOTTOM,
      marginY: -72,
      marginX: -40,
    });

    this.cancelBtn = new ButtonA(scene, {
      width: 200,
      height: 48,
      text: "Cancel",
      parent: bg,
      alignModeName: ALIGNMODES.RIGHT_BOTTOM,
      marginY: -72,
    });
  }

  show() {
    super.show();
  }
}
