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
import { runQuery, HasValue, Entity } from "@latticexyz/recs";
import { fromEntity } from "../../../utils/encode";
import { Hex } from "viem";
import { hexTypeToString } from "../../../utils/encode";
import { UIItem } from "../../components/ui/UIItem";
import { getERC20Balances } from "../../../logics/container";
import { selectHost } from "../../../logics/entity";
import { getEntitiesInCustodian } from "../../../logics/custodian";

export class Roles extends DoublePage {
  rolesList: UIList;
  bag: UIList;
  constructor(scene: UIScene, parent: GuiBase) {
    super(scene, parent, "Roles", "Bag");
    this.name = "MainMenuRoles";

    const zoom = StandardGameSize.maxWidth;

    this.rolesList = new UIList(scene, {
      width: this.contentW - 8,
      height: 512,
      itemWidth: this.contentW - 48,
      itemHeight: 32,
      spacingY: 12,
      parent: this.contentL,
      overflow: "scroll",
      onCancel: () => {
        parent.hidden();
      },
    });
    this.focusUI = this.rolesList;

    this.bag = new UIList(scene, {
      width: this.contentW - 16,
      height: 320,
      alignModeName: ALIGNMODES.MIDDLE_TOP,
      itemWidth: 48,
      itemHeight: 48,
      spacingX: 12,
      spacingY: 12,
      parent: this.contentR,
      overflow: "scroll",
      onCancel: () => {
        parent.hidden();
      },
    });
  }

  show() {
    this.focusUI = this.rolesList;
    super.show();
    const roles = [
      ...runQuery([
        HasValue(this.components.Commander, {
          value: this.network.playerEntity,
        }),
      ]),
    ];
    const items = [];
    for (let i = 0; i < roles.length; i++) {
      const { type, id } = fromEntity(roles[i] as Hex);
      const name = hexTypeToString(type);
      const item = new BookListButton(this.scene, {
        width: this.rolesList.itemWidth,
        text: name + " " + id.toString(),
        data: roles[i],
      });
      items.push(item);
    }
    this.rolesList.items = items;
    this.rolesList.on(UIEvents.SELECT_CHANGE, this.onRolesListSelected, this);
    this.rolesList.itemIndex = 0;
    this.bag.on(UIEvents.LEFT, this.onLeft, this);
    this.rolesList.on(UIEvents.RIGHT, this.onRight, this);
  }

  hidden() {
    this.offMenuListen(this.rolesList);
    this.rolesList.off(UIEvents.SELECT_CHANGE, this.onRolesListSelected, this);
    super.hidden();
  }

  /** Choose the role to watch details */
  onRolesListSelected() {
    // Clear
    this.bag.removeAllItems();

    // Add
    const item = this.rolesList.item;
    if (!item) return;
    const role = item.data as Entity;
    selectHost(this.components, role);

    let itemsCount = 0;

    const erc721Entities = [
      ...runQuery([HasValue(this.components.Owner, { value: role })]),
    ];
    erc721Entities.forEach((entity, index) => {
      const { type, id } = fromEntity(entity as Hex);
      const itemType = hexTypeToString(type);
      const item = new UIItem(this.scene, itemType, {
        width: this.contentW - 48,
        amount: 1,
        id: Number(id),
      });
      this.bag.addItem(item);
    });
    itemsCount += erc721Entities.length;

    const erc20Items = getERC20Balances(this.components, role as Hex).map(
      (erc20Item) => {
        return { type: erc20Item.erc20Type, amount: Number(erc20Item.balance) };
      }
    );
    erc20Items.forEach((erc20Item) => {
      const itemType = hexTypeToString(erc20Item.type);
      const item = new UIItem(this.scene, itemType, {
        width: this.contentW - 48,
        amount: erc20Item.amount,
      });
      this.bag.addItem(item);
    });
    itemsCount += erc20Items.length;

    const equipments = getEntitiesInCustodian(this.components, role);
    equipments.forEach((equipment) => {
      const { type, id } = fromEntity(equipment as Hex);
      const itemType = hexTypeToString(type);
      const item = new UIItem(this.scene, itemType, {
        width: this.contentW - 48,
        amount: 1,
        id: Number(id),
      });
      this.bag.addItem(item);
    });
    itemsCount += equipments.length;
  }

  onLeft() {
    super.onLeft();
    this.bag.onItemUnSelected(this.bag.item);
    this.focusUI = this.rolesList;
    if (this.rolesList.item) this.rolesList.onItemSelected(this.rolesList.item);
    else this.rolesList.itemIndex = 0;
  }

  onRight() {
    super.onRight();
    this.rolesList.onItemUnSelected(this.rolesList.item);
    this.focusUI = this.bag;
    if (this.bag.item) this.bag.itemIndex = this.bag.itemIndex;
    else this.bag.itemIndex = 0;
  }
}
