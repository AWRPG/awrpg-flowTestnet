import { UIScene } from "../../scenes/UIScene";
import { GuiBase, GuiBaseConfig } from "../GuiBase";
import { ALIGNMODES, SOURCE } from "../../../constants";
import { UIBase } from "../../components/ui/common/UIBase";
import { UIText } from "../../components/ui/common/UIText";
import { UIList } from "../../components/ui/common/UIList";
import { UIButton, UIButtonConfig } from "../../components/ui/common/UIButton";
import { ButtonA } from "../../components/ui/ButtonA";
import {
  Entity,
  getComponentValue,
  runQuery,
  HasValue,
} from "@latticexyz/recs";
import { ListMenu } from "../common/ListMenu";
import { Building } from "../../objects/Building";
import { Heading3 } from "../../components/ui/Heading3";
import { Hex } from "viem";
import {
  encodeTypeEntity,
  fromEntity,
  hexTypeToString,
} from "../../../utils/encode";
import { getBuildingStakeOuputTypes } from "../../../logics/stake";
import { getRoleAndHostAdjacentCoord } from "../../../logics/building";
import { hasMintCosts } from "../../../logics/cost";
import { getStaking } from "../../../contract/hashes";
import { unixTimeSecond } from "../../../utils/time";
import { UIController } from "../../components/controllers/UIController";
import {
  canStoreERC20Amount,
  canStoreOutputs,
} from "../../../logics/container";
import { ItemData } from "../../../api/data";

export class ItemUseMenu extends ListMenu {
  data: ItemData;
  role: Entity;
  constructor(
    scene: UIScene,
    data: ItemData,
    role: Entity,
    config?: GuiBaseConfig
  ) {
    super(scene, "", config, {
      width: 268,
      height: 300,
    });
    this.name = "ItemUseMenu";
    this.data = data;
    this.role = role;
    this.rootUI.setDepth(20);
  }

  show() {
    super.show();
    this.updateList();
  }

  updateList() {
    const items: ButtonA[] = [];
    const item_drop = new ButtonA(this.scene, {
      width: this.list.displayWidth,
      text: "Drop",
      fontStyle: "400",
      onConfirm: async () => {
        const id = this.data.id;
        UIController.focus = this.focusUI;
        if (id !== undefined) {
          await this.systemCalls.dropERC721(this.data.entity as Hex);
        } else {
          await this.systemCalls.dropERC20(
            this.role as Hex,
            this.data.entity as Hex,
            1n
          );
        }
        this.scene.mainMenu?.roles.onRolesListSelected();
      },
    });
    items.push(item_drop);

    this.list.items = items;
    if (this.list.itemsCount > 0) this.list.itemIndex = 0;
  }

  hidden() {
    console.log("hidden");
    super.hidden();
    UIController.focus = this.scene.mainMenu?.roles.bag;
  }
}
