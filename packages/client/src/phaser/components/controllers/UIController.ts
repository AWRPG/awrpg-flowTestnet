import { UIBase } from "../ui/common/UIBase";
import { UIConfig } from "../ui/common/UIConfig";
import { UIEvents } from "../ui/common/UIEvents";

/** UI control */
export class UIController {
  static scene: Phaser.Scene;

  /** The UI that currently has the focus */
  private static _focus: UIBase;

  static get focus(): UIBase {
    return this._focus;
  }

  static set focus(ui: UIBase) {
    if (this._focus === ui) return;
    if (this._focus) {
      this._focus.onBlur();
      this._focus.emit(UIEvents.FOCUS_OFF, this._focus);
    }
    this._focus = ui;
    this._focus.emit(UIEvents.FOCUS_ON, this._focus);
    this._focus.onFocus();
  }

  static listenStart(scene?: Phaser.Scene) {
    if (scene) this.scene = scene;
    this.scene.input.keyboard?.on("keydown", this.onKeyDown, this);
  }

  private static onKeyDown(event: KeyboardEvent) {
    if (!this._focus || !this._focus.visible) return;
    const key = event.key;
    if (UIConfig.KEY_UP.includes(key)) this._focus.onUpPressed();
    if (UIConfig.KEY_DOWN.includes(key)) this._focus.onDownPressed();
  }
}
