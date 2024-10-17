import { UIController } from "../../controllers/UIController";
import { UIBase, UIBaseConfig } from "./UIBase";
import { UIConfig } from "./UIConfig";

export interface UIListConfig extends UIBaseConfig {
  itemIndentation?: number;
  itemWidth?: number;
  itemHeight?: number;
  spacingX?: number; // horizontal spacing
  spacingY?: number; // vertical spacing
}

export class UIList extends UIBase {
  /** indentation of each item */
  itemIndentation: number = 0;

  /** horizontal spacing */
  spacingX: number = 0;

  /** vertical spacing */
  spacingY: number = 0;

  protected _item?: UIBase;
  protected _itemIndex: number = -1;

  /** list items */
  protected _items: UIBase[] = [];

  /** the width of each item */
  protected _itemWidth: number = 180;

  /** the height of each item */
  protected _itemHeight: number = 32;

  /** */
  constructor(scene: Phaser.Scene, config: UIListConfig = {}) {
    super(scene, config);
    this.itemIndentation = config.itemIndentation ?? 0;
    this.itemWidth = config.itemWidth ?? 0;
    this.itemHeight = config.itemHeight ?? 0;
    this.spacingX = config.spacingX ?? 0;
    this.spacingY = config.spacingY ?? 0;
  }

  /**
   * Add a child item to items.
   * @param item the UI to add
   * @param index If other UI for this index, the other UI will be shifted back in order.
   */
  addItem(item: UIBase, index?: number) {
    item.parent = this;
    if (index === undefined) index = this.items.length;
    else if (index < 0) index += this.items.length;
    if (index < 0) index = 0;
    item.setMargin(
      this.itemIndentation,
      (this.itemHeight + this.spacingY) * index
    );
    this.items.splice(index, 0, item);
    for (let i = index + 1; i < this.items.length; i++) {
      this.items[i].setMargin(
        this.itemIndentation,
        (this.itemHeight + this.spacingY) * i
      );
    }
  }

  onFocus() {
    if (this._itemIndex < 0 && this.itemsCount > 0) this.itemIndex = 0;
    else if (this._itemIndex >= this.itemsCount)
      this.itemIndex = this.itemsCount - 1;
  }

  onUpPressed() {
    super.onUpPressed();
    this.itemIndex = this.itemIndex > 0 ? this.itemIndex - 1 : 0;
  }

  onDownPressed() {
    super.onDownPressed();
    this.itemIndex =
      this.itemIndex < this.itemsCount - 1
        ? this.itemIndex + 1
        : this.itemsCount - 1;
  }

  onConfirmPressed() {
    super.onConfirmPressed();
    if (!this._item?.disable && this._item?.onConfirm) {
      UIController.focus = this._item;
      this._item.onConfirm();
    }
  }

  onCancelPressed() {
    super.onCancelPressed();
  }

  onItemSelected(value: UIBase | undefined) {
    if (!value) return;
    value.onSelected();
  }

  onItemUnSelected(value: UIBase | undefined) {
    if (!value) return;
    value.onUnSelected();
  }

  get itemsCount(): number {
    return this._items.length;
  }

  get items(): UIBase[] {
    return this._items;
  }

  set items(value: UIBase[]) {
    this._items = value;
  }

  get itemWidth(): number {
    return this._itemWidth;
  }

  set itemWidth(value: number) {
    this._itemWidth = value;
  }

  get itemHeight(): number {
    return this._itemHeight;
  }

  set itemHeight(value: number) {
    this._itemHeight = value;
  }

  get item(): UIBase | undefined {
    return this._item;
  }

  set item(value: UIBase) {
    this.onItemUnSelected(this._item);
    const index = this._items.indexOf(value);
    this._item = index !== -1 ? value : undefined;
    this._itemIndex = index;
    this.onItemSelected(this._item);
  }

  get itemIndex(): number {
    return this._itemIndex;
  }

  set itemIndex(value: number) {
    this.onItemUnSelected(this._item);
    this._itemIndex = value;
    this._item = value >= 0 ? this._items[value] : undefined;
    this.onItemSelected(this._item);
  }
}
