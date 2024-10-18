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
import { Building, BuildingSpecs } from "../../api/data";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { encodeTypeEntity } from "../../utils/encode";
import { toHex } from "viem";

export class ConstructMenu extends GuiBase {
  list: UIList;
  img: UIImage;
  text: UIText;
  role?: Host;
  data: Building[];

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

    this.data = GameData.getData("buildings") as Building[];
    const items: ButtonA[] = [];
    this.data.forEach((building) => {
      items.push(new ButtonA(scene, { text: building.name }));
    });
    this.list.items = items;

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
    this.list.on(UIEvents.CONFIRM, this.onListConfirm, this);
  }

  show(role?: Host) {
    super.show();
    this.role = role ?? this.role;
    SceneObjectController.focus = this.role;
    UIController.controllable = true;
  }

  onListSelected() {
    const index = this.list.itemIndex;
    if (index === undefined) return;
    this.img.setTexture(this.data[index].img);
    this.text.text = this.data[index].name.toUpperCase();
  }

  onListConfirm() {
    const index = this.list.itemIndex;
    if (index === undefined || !this.role || !this.data) return;
    this.hidden();
    const buildingSpecs = this.getBuildingSpecs(this.data[index].type);
    if (!buildingSpecs) return;
    UIController.scene.constructTips?.show(this.role, buildingSpecs);
  }

  getBuildingSpecs(type: string): BuildingSpecs | undefined {
    return getComponentValue(
      this.components.BuildingSpecs,
      encodeTypeEntity(toHex(type, { size: 16 })) as Entity
    );
  }
}
