import { UIScene } from "../scenes/UIScene";
import { GuiBase } from "./GuiBase";
import { ALIGNMODES } from "../../constants";
import { UIList } from "../components/ui/common/UIList";
import { UIButton } from "../components/ui/common/UIButton";
import { Box } from "../components/ui/Box";
import { Box2 } from "../components/ui/Box2";
import { UIText } from "../components/ui/common/UIText";
import { ButtonA } from "../components/ui/ButtonA";
import { MenuTitle } from "../components/ui/MenuTitle";
/**
 * show the action buttons player can do
 */
export class ActionMenu extends GuiBase {
  list: UIList;

  /** */
  constructor(scene: UIScene) {
    super(
      scene,
      new Box(scene, {
        width: 360,
        height: 210,
        alignModeName: ALIGNMODES.MIDDLE_CENTER,
        marginX: 220,
      })
    );

    this.name = "ActionMenu";

    // Title
    const titleBox = new Box2(scene, {
      width: 178,
      height: 58,
      alignModeName: ALIGNMODES.RIGHT_TOP,
      marginX: 8,
      marginY: -36,
      parent: this.rootUI,
    });
    new MenuTitle(scene, "ACTIONS", { parent: titleBox });

    // Button list
    this.list = new UIList(scene, {
      marginY: 28,
      itemWidth: 260,
      itemHeight: 48,
      spacingY: 12,
      parent: this.rootUI,
    });
    const buttonsIndex = ["Move", "Build", "Change Terrain"];
    buttonsIndex.forEach((name) => {
      const item = new ButtonA(scene, {
        text: name,
        hoverSkinTexture: "btn_select_skin",
      });
      this.list.addItem(item);
    });

    // Init the action button list
    // const buttons: { name: string; button: Button }[] = (this.buttons = []);
    // const buttonsIndex = ["Move", "Build", "Change Terrain"];
    // buttonsIndex.forEach((name, index) => {
    //   buttons.push({
    //     name: name,
    //     button: new ButtonA(scene, name, 260, 48, {
    //       alignModeName: ALIGNMODES.LEFT_TOP,
    //       marginY: 28 + index * 56,
    //       parent: this.rootUI,
    //       fontAlignMode: ALIGNMODES.LEFT_CENTER,
    //     }),
    //   });
    // });
    // this.currentButtonIndex = 0;
    // this.selectButton();
  }
}
