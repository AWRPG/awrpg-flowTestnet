import { UIBase } from "./UIBase";

/**
 * All the complex UI Components need to extend from this class.
 */
export class GuiBase {
  /** the scene*/
  scene: Phaser.Scene;

  /** The name is used for controllers to determine the current UI object*/
  name: string;

  /** UIs of this GUI */
  uis: UIBase[] = [];

  /**
   * @readonly Determine if the current object is displayed
   * If you want to change the visible state, you need to use the show() and hide() controls.
   */
  protected _visible: boolean = false;

  /** */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.name = "GuiBase";
  }

  /**
   * Show this GUI
   */
  show(...params: unknown[]) {
    this._visible = true;
    for (const i in this.uis) this.uis[i].show();
  }

  /**
   * Hide this GUI
   */
  hidden(...params: unknown[]) {
    this._visible = false;
    for (const i in this.uis) this.uis[i].hidden();
  }

  get visible() {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
    if (value) this.show();
    else this.hidden();
  }
}
