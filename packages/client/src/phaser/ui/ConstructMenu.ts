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
import { UIEvents } from "../components/ui/common/UIEvents";
import { GameData } from "../components/GameData";
import { Building } from "../../api/data";

export class ConstructMenu extends GuiBase {
  list: UIList;
  img: UIImage;
  text: UIText;
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
    this.name = "ConstructMenu";

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
    this.focusUI = this.list;

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
      text: "mine shaft",
      onConfirm: () => {
        if (!this.role) return;
        this.hidden();
        UIController.scene.constructTips?.show(this.role);
      },
    });
    this.list.addItem(item1);

    const item2 = new ButtonA(scene, {
      text: "safe",
      onConfirm: () => {
        if (!this.role) return;
        this.hidden();
        UIController.scene.constructTips?.show(this.role);
      },
    });
    this.list.addItem(item2);

    this.text = new UIText(this.scene, "SAFE", {
      alignModeName: ALIGNMODES.MIDDLE_TOP,
      marginX: 168,
      marginY: 32,
      fontSize: 48,
      fontColor: "#2D3E51",
      parent: this.rootUI,
    });

    this.img = new UIImage(this.scene, "img-building-safe", {
      width: 830 * 0.6,
      height: 741 * 0.6,
      alignModeName: ALIGNMODES.MIDDLE_TOP,
      marginX: 0,
      marginY: 48,
      parent: this.text,
    });
    this.img.root.setAlpha(0.85);

    this.list.on(UIEvents.SELECT_CHANGE, this.onListSelected, this);
  }

  show(role?: Host) {
    super.show();
    this.role = role ?? this.role;
    SceneObjectController.focus = this.role;
    UIController.controllable = true;
  }

  onListSelected() {
    if (this.list.itemIndex === undefined) return;
    const data = GameData.getDataByIndex(
      "buildings",
      this.list.itemIndex
    ) as Building;
    this.img.setTexture(data.img);
    this.text.text = data.name.toUpperCase();
  }
}
