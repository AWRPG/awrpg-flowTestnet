import { UIScene } from "../../scenes/UIScene";
import { GuiBase } from "../GuiBase";
import { DoublePage } from "./DoublePage";
import { ALIGNMODES } from "../../../constants";
import { UIBase, StandardGameSize } from "../../components/ui/common/UIBase";
import { UIEvents } from "../../components/ui/common/UIEvents";
import { UIImage } from "../../components/ui/common/UIImage";
import { UIList } from "../../components/ui/common/UIList";
import { PlayerInput } from "../../components/controllers/PlayerInput";
import { SceneObjectController } from "../../components/controllers/SceneObjectController";
import { Box } from "../../components/ui/Box";
import { BookListButton } from "../../components/ui/BookListButton";
import { Heading3 } from "../../components/ui/Heading3";
import { MainMenuTitle } from "../../components/ui/MainMenuTitle";
import { runQuery, HasValue } from "@latticexyz/recs";
import { fromEntity } from "../../../utils/encode";
import { Hex, hexToString } from "viem";

export class Roles extends DoublePage {
  rolesList: UIList;
  constructor(scene: UIScene, parent: GuiBase) {
    super(scene, parent, "Roles");
    this.name = "MainMenuRoles";

    const zoom = StandardGameSize.maxWidth;

    this.rolesList = new UIList(scene, {
      width: Math.ceil(this.contentW * 0.99),
      height: 512,
      itemWidth: this.contentW * 0.92,
      itemHeight: 32,
      spacingY: 6,
      parent: this.contentL,
      overflow: "scroll",
      onCancel: () => {
        parent.hidden();
      },
    });
    this.focusUI = this.rolesList;

    const hosts = [
      ...runQuery([
        HasValue(this.components.Commander, {
          value: this.network.playerEntity,
        }),
      ]),
    ];

    for (let i = 0; i < hosts.length; i++) {
      const { type, id } = fromEntity(hosts[i] as Hex);
      const name = hexToString(type).replace(/\0/g, "");
      console.log(hosts[i]);
      let item = new BookListButton(scene, {
        width: this.rolesList.itemWidth,
        text: name + id.toString(),
      });
      this.rolesList.addItem(item);
    }
  }
}
