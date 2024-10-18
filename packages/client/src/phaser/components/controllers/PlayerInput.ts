import { GuiBase } from "../../ui/GuiBase";
import { UIBase } from "../ui/common/UIBase";
import { UIConfig } from "../ui/common/UIConfig";
import { UIEvents } from "../ui/common/UIEvents";
import { UIController } from "./UIController";
import { SceneObjectController } from "./SceneObjectController";

export class PlayerInput {
  static scene: Phaser.Scene;
  static flagUp: boolean = true;

  static listenStart(scene?: Phaser.Scene) {
    if (scene) this.scene = scene;
    this.scene.input.keyboard?.on("keydown", this.onKeyDown, this);
    this.scene.input.keyboard?.on("keyup", this.onKeyUp, this);
  }

  private static onKeyDown(event: KeyboardEvent) {
    // if (!this.flagUp) return;
    this.flagUp = false;
    const key = event.key;
    const focus = (
      UIController.controllable ? UIController : SceneObjectController
    ).focus;
    if (!focus) return;
    if (UIConfig.KEY_UP.includes(key)) focus.onUpPressed();
    if (UIConfig.KEY_DOWN.includes(key)) focus.onDownPressed();
    if (UIConfig.KEY_LEFT.includes(key)) focus.onLeftPressed();
    if (UIConfig.KEY_RIGHT.includes(key)) focus.onRightPressed();
    if (UIConfig.KEY_CONFIRM.includes(key)) focus.onConfirmPressed();
    if (UIConfig.KEY_CANCEL.includes(key)) focus.onCancelPressed();
  }

  private static onKeyUp(event: KeyboardEvent) {
    this.flagUp = true;
  }
}
