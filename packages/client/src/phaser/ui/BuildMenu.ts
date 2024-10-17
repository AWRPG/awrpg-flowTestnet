import { UIScene } from "../scenes/UIScene";
import { GuiBase } from "./GuiBase";
import { Box } from "../components/ui/Box";
import { UIText } from "../components/ui/common/UIText";
import { ALIGNMODES, HIGHLIGHT_MODE } from "../../constants";
import { ButtonA } from "../components/ui/ButtonA";
import { UIImage } from "../components/ui/common/UIImage";
import { UIList } from "../components/ui/common/UIList";
import { SceneObjectController } from "../components/controllers/SceneObjectController";
import { Host } from "../objects/Host";
import { UIController } from "../components/controllers/UIController";

export class BuildMenu extends GuiBase {
  list: UIList;
  role?: Host;

  constructor(scene: UIScene) {
    super(
      scene,
      new Box(scene, {
        width: 1280,
        height: 720,
        alignModeName: ALIGNMODES.MIDDLE_CENTER,
      })
    );
    this.name = "BuildMenu";

    // Init the action button list
    this.list = new UIList(scene, {
      marginY: 28,
      itemWidth: 260,
      itemHeight: 48,
      spacingY: 12,
      parent: this.rootUI,
      onCancel: () => {
        this.hidden();
        SceneObjectController.resetFocus();
        SceneObjectController.controllable = true;
      },
    });

    // const buttonsIndex = [
    //   "Safe",
    //   "Storehouse",
    //   "Mining Field",
    //   "Bridge",
    //   "Node",
    //   "Foundry",
    //   "Fence",
    // ];
    // buttonsIndex.forEach((name) => {
    //   this.list.addItem(new ButtonA(scene, { text: name }));
    // });
    const item1 = new ButtonA(scene, {
      text: "Safe",
      onConfirm: () => {
        if (!this.role) return;
        this.hidden();
        UIController.scene.buildTips?.show(this.role);
      },
    });
    this.list.addItem(item1);
    this.focusUI = this.list;

    const text = new UIText(this.scene, "SAFE", {
      alignModeName: ALIGNMODES.MIDDLE_TOP,
      marginX: 168,
      marginY: 32,
      fontSize: 48,
      fontColor: "#2D3E51",
      parent: this.rootUI,
    });

    const img = new UIImage(this.scene, "img-building-safe", {
      width: 830 * 0.6,
      height: 741 * 0.6,
      alignModeName: ALIGNMODES.MIDDLE_TOP,
      marginX: 0,
      marginY: 48,
      parent: text,
    });
    img.root.setAlpha(0.85);
  }

  show(role?: Host) {
    super.show();
    this.role = role ?? this.role;
    SceneObjectController.focus = this.role;
    UIController.controllable = true;
  }
}
