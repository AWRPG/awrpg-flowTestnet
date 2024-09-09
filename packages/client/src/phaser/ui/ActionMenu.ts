import { UIScene } from "../scenes/UIScene";
import { UIManager } from "./UIManager";
import { ALIGNMODES } from "../../constants";
import { Box } from "../components/ui/Box";
import { Button } from "../components/ui/Button";
import { UIText } from "../components/ui/UIText";
import { ButtonA } from "./buttons/ButtonA";

/**
 * show the action buttons player can do
 */
export class ActionMenu extends UIManager {
  constructor(scene: UIScene) {
    super(
      scene,
      new Box(scene, "ui-box", 360, 210, {
        alignModeName: ALIGNMODES.MIDDLE_CENTER,
        marginX: 220,
      })
    );

    this.name = "ActionMenu";

    // Title Background
    const titleBox = new Box(scene, "ui-box-title-out-side2", 178, 58, {
      alignModeName: ALIGNMODES.RIGHT_TOP,
      marginX: 8,
      marginY: -36,
      parent: this.rootUI,
      leftWidth: 24,
      rightWidth: 24,
      topHeight: 24,
      bottomHeight: 24,
    });

    // Title text
    new UIText(scene, "ACTIONS", {
      alignModeName: ALIGNMODES.MIDDLE_CENTER,
      parent: titleBox,
      fontColor: "#2D3E51",
      fontSize: 32,
    });

    // Init the action button list
    const buttons: { name: string; button: Button }[] = (this.buttons = []);
    const buttonsIndex = ["Move", "Build", "Change Terrain"];
    buttonsIndex.forEach((name, index) => {
      buttons.push({
        name: name,
        button: new ButtonA(scene, name, 260, 48, {
          alignModeName: ALIGNMODES.LEFT_TOP,
          marginY: 28 + index * 56,
          parent: this.rootUI,
          fontAlignMode: ALIGNMODES.LEFT_CENTER,
        }),
      });
    });
    this.currentButtonIndex = 0;
    this.selectButton();
  }
}
