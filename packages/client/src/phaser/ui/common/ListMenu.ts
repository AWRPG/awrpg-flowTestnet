import { UIScene } from "../../scenes/UIScene";
import { GuiBase, GuiBaseConfig } from "../GuiBase";
import { ALIGNMODES } from "../../../constants";
import { UIBase } from "../../components/ui/common/UIBase";
import { Box } from "../../components/ui/Box";
import { UIEvents } from "../../components/ui/common/UIEvents";
import { UIList } from "../../components/ui/common/UIList";
import { PlayerInput } from "../../components/controllers/PlayerInput";
import { Heading2 } from "../../components/ui/Heading2";
import { ButtonA } from "../../components/ui/ButtonA";

export class ListMenu extends GuiBase {
  list: UIList;
  title: Heading2;
  constructor(scene: UIScene, title: string, config?: GuiBaseConfig) {
    super(
      scene,
      new Box(scene, {
        width: 520,
        height: 680,
        alignModeName: ALIGNMODES.MIDDLE_CENTER,
      }),
      config
    );
    this.name = "ListMenu";

    this.title = new Heading2(scene, title, {
      width: 520,
      height: 200,
      marginY: 24,
      alignModeName: ALIGNMODES.MIDDLE_TOP,
      parent: this.rootUI,
    });

    // Init the list
    this.list = new UIList(scene, {
      itemWidth: 520,
      itemHeight: 48,
      marginY: 96,
      spacingY: 12,
      parent: this.rootUI,
      onCancel: () => this.hidden(),
    });
    this.focusUI = this.list;
  }

  show(prevGui?: GuiBase, datas?: unknown[], ...params: unknown[]) {
    super.show();
    if (prevGui) this.prevGui = prevGui;
    if (datas) this.updateList(datas);
    PlayerInput.onlyListenUI();
    this.list.on(UIEvents.SELECT_CHANGE, this.onSelected, this);
    this.list.on(UIEvents.CONFIRM, this.onConfirm, this);
  }

  hidden(prev: boolean = true) {
    this.list.off(UIEvents.SELECT_CHANGE, this.onSelected, this);
    this.list.off(UIEvents.CONFIRM, this.onConfirm, this);
    super.hidden();
    if (prev) this.prevGui?.show();
  }

  updateList(datas: unknown[] = []) {
    const items: UIBase[] = [];
    datas.forEach((data) => {
      const item = new ButtonA(this.scene, {
        width: this.list.width - 68,
        text: this.spliceText(data),
        fontStyle: "400",
        data,
      });
      items.push(item);
    });
    this.items = items;
    if (this.list.itemsCount > 0) this.list.itemIndex = 0;
  }

  spliceText(data: unknown) {
    return "You need to use spliceText()";
  }

  onSelected() {}

  get items(): UIBase[] {
    return this.list.items;
  }

  set items(value: UIBase[]) {
    this.list.items = value;
  }

  get item(): UIBase | undefined {
    return this.list.item;
  }

  set item(value: UIBase) {
    this.list.item = value;
  }
}
