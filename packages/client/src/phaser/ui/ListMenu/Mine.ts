import { Entity } from "@latticexyz/recs";
import { RolesListMenu } from "../common/RolesListMenu";
import { MoveoutTips } from "../MoveoutTips";
import { Building } from "../../objects/Building";
import { GuiBase } from "../GuiBase";

export class Mine extends RolesListMenu {
  moveoutTips?: MoveoutTips;
  building?: Building;

  show(
    prevGui?: GuiBase,
    datas?: {
      entity: Entity;
      type: string;
      id: number;
      name: string;
    }[],
    building?: Building
  ) {
    super.show(prevGui, datas);
    if (building) this.building = building;
  }

  onConfirm() {
    if (!this.item) return;
    const entity = this.item!.data.entity as Entity;
    this.hidden(false);
    this.moveoutTips = new MoveoutTips(this.scene);
    this.moveoutTips.show(entity, this.building, this);
  }
}
