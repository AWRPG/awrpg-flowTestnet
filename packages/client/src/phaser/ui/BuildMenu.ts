import { UIScene } from "../scenes/UIScene";
import { UIManager } from "./UIManager";
import { Box } from "../components/ui/Box";
import { UIAvatar } from "../components/ui/UIAvatar";
import { UIText } from "../components/ui/UIText";
import { Bar } from "../components/ui/Bar";
import { ALIGNMODES } from "../../constants";
import { Button } from "../components/ui/Button";
import { ButtonA } from "./buttons/ButtonA";
import { UIImage } from "../components/ui/UIImage";

export class BuildMenu extends UIManager {
  constructor(scene: UIScene) {
    super(
      scene,
      new Box(scene, "ui-box", 1280, 720, {
        alignModeName: ALIGNMODES.MIDDLE_CENTER,
      })
    );
    this.name = "BuildMenu";

    // Init the action button list
    const buttons: { name: string; button: Button }[] = (this.buttons = []);
    const buttonsIndex = [
      "Safe",
      "Storehouse",
      "Mining Field",
      "Bridge",
      "Node",
      "Foundry",
      "Fence",
    ];
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

    const text = new UIText(this.scene, "SAFE", {
      alignModeName: ALIGNMODES.MIDDLE_TOP,
      marginX: 168,
      marginY: 32,
      fontSize: 48,
      fontColor: "#2D3E51",
      parent: this.rootUI,
    });

    const img = new UIImage(
      this.scene,
      "img-building-safe",
      830 * 0.6,
      741 * 0.6,
      {
        alignModeName: ALIGNMODES.MIDDLE_TOP,
        marginX: 0,
        marginY: 48,
        parent: text,
      }
    );
    img.root.setAlpha(0.85);
  }

  safe() {}
}
