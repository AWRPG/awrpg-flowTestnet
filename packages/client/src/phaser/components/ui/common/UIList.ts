import { UIBase, UIBaseConfig } from "./UIBase";

export interface UIListConfig extends UIBaseConfig {
  itemIndentation?: number;
  itemWidth?: number;
  itemHeight?: number;
  spacingX?: number; // horizontal spacing
  spacingY?: number; // vertical spacing
}

export class UIList extends UIBase {
  itemIndentation: number = 0;

  /** horizontal spacing */
  spacingX: number = 0;

  /** vertical spacing */
  spacingY: number = 0;

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

  get items() {
    return this._items;
  }

  set items(value: UIBase[]) {
    this._items = value;
  }

  get itemWidth() {
    return this._itemWidth;
  }

  set itemWidth(value: number) {
    this._itemWidth = value;
  }

  get itemHeight() {
    return this._itemHeight;
  }

  set itemHeight(value: number) {
    this._itemHeight = value;
  }
}
