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

    for (let i = 0; i < 25; i++) {
      let item = new BookListButton(scene, {
        width: this.rolesList.itemWidth,
        text: "Host " + i.toString(),
      });
      this.rolesList.addItem(item);
    }
  }
}
