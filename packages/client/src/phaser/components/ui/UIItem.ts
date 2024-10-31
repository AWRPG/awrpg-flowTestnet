import { UIBase } from "./common/UIBase";
import { UIImage, UIImageConfig } from "./common/UIImage";
import { UIText } from "./common/UIText";
import { Heading3 } from "./Heading3";
import { ALIGNMODES } from "../../../constants";

export interface UIItemConfig extends UIImageConfig {
  amount?: number;
}

export class UIItem extends UIBase {
  bg: UIImage;
  itemType?: string;
  icon?: UIImage;
  amountText: UIText;
  amount: number;
  nameText: UIText;
  constructor(
    scene: Phaser.Scene,
    itemType?: string,
    config: UIItemConfig = {}
  ) {
    super(scene, {
      width: 260,
      height: 48,
      ...config,
    });
    this.bg = new UIImage(scene, "bag-icon-bg", {
      width: 48,
      height: 48,
      parent: this,
    });

    this.itemType = itemType;
    this.amount = config.amount ?? 0;
    this.nameText = new Heading3(scene, this.itemType ?? "", {
      parent: this,
      marginX: 56,
      fontSize: 24,
      alignModeName: ALIGNMODES.LEFT_CENTER,
    });
    this.amountText = new Heading3(scene, this.amount.toString(), {
      parent: this,
      marginX: 12,
      fontSize: 24,
      alignModeName: ALIGNMODES.RIGHT_CENTER,
    });
    const textX = new Heading3(scene, "X", {
      parent: this,
      fontSize: 14,
      marginX: (this.amountText.textObj.width / 4 + 16),
      alignModeName: ALIGNMODES.RIGHT_CENTER,
    });
    if (itemType) {
      this.initIcon("icon-item-" + itemType);
    } else {
      this.amountText.visible = false;
    }
  }

  initIcon(texture: string) {
    this.icon = new UIImage(this.scene, texture, {
      width: 32,
      height: 32,
      alignModeName: ALIGNMODES.MIDDLE_CENTER,
      parent: this.bg,
    });
    this.amountText.visible = true;
  }

  get iconTexture(): string | undefined {
    return this.icon?.texture;
  }

  set iconTexture(value: string) {
    if (!this.icon) this.initIcon(value);
    else this.icon.setTexture(value);
  }
}
