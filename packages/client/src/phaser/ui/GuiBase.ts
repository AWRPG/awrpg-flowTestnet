import { UIBase } from "../components/ui/common/UIBase";
import { Button } from "../components/ui/Button";
import { UIController } from "../components/controllers/UIController";
import { UIScene } from "../scenes/UIScene";
import { ClientComponents } from "../../mud/createClientComponents";
import { SystemCalls } from "../../mud/createSystemCalls";
import { SetupNetworkResult } from "../../mud/setupNetwork";
import { UIEvents } from "../components/ui/common/UIEvents";

/**
 * All the complex UI Components need to extend from this class.
 */
export class GuiBase {
  /**
   * the UIScene
   */
  scene: UIScene;

  components: ClientComponents;
  systemCalls: SystemCalls;
  network: SetupNetworkResult;

  /**
   * The name is used for controllers to determine the current UI object
   */
  name: string;

  /**
   * [only read] Determine if the current object is displayed
   * If you want to change the visible state, you need to use the show() and hidden() controls.
   */
  isVisible: boolean = false;

  /**
   * Each GuiBase must have a basic UI component as a root node
   */
  rootUI: UIBase;

  resizeListener: Function | undefined;

  private _focusUI?: UIBase;

  prevGui?: GuiBase;

  /**
   * Data listener events that depend on Phaser: https://newdocs.phaser.io/docs/3.80.0/Phaser.Data.Events.CHANGE_DATA
   */
  onDataChanged(parent: unknown, key: string, data: unknown) {}

  /**
   * @param scene
   * @param rootUI The base UI component that serves as the root node of the GuiBase
   */
  constructor(scene: UIScene, rootUI: UIBase) {
    this.name = "GuiBase";
    this.scene = scene;
    this.components = scene.components;
    this.network = scene.network;
    this.systemCalls = scene.systemCalls;
    this.rootUI = rootUI;
    // It will only be displayed when be called.
    this.handleHidden();
    this.rootUI.root.on("changedata", this.onDataChanged, this);
  }

  /**
   * Show it
   */
  show(...params: unknown[]) {
    if (!this.resizeListener) {
      this.resizeListener = (gameSize: Phaser.Structs.Size) => {
        this.rootUI.updatePosition();
      };
      this.scene.scale.on("resize", this.resizeListener);
    }
    if (this.focusUI) UIController.focus = this.focusUI; // Set focus
    this.rootUI.root.setVisible(true);
    this.isVisible = true;
  }

  handleHidden() {
    this.rootUI.root.setVisible(false);
    this.isVisible = false;
    if (UIController.focus === this.focusUI) UIController.focus = undefined;
    this.scene.scale.off("resize", this.resizeListener);
    this.resizeListener = undefined;
  }

  /**
   * Hide it
   */
  hidden(...params: unknown[]) {
    this.handleHidden();
  }

  onMenuListen(ui: UIBase = this.rootUI) {
    ui.on(UIEvents.UP, this.onUp, this);
    ui.on(UIEvents.DOWN, this.onDown, this);
    ui.on(UIEvents.LEFT, this.onLeft, this);
    ui.on(UIEvents.RIGHT, this.onRight, this);
    ui.on(UIEvents.CONFIRM, this.onConfirm, this);
    ui.on(UIEvents.CANCEL, this.onCancel, this);
  }

  offMenuListen(ui: UIBase = this.rootUI) {
    ui.off(UIEvents.UP, this.onUp, this);
    ui.off(UIEvents.DOWN, this.onDown, this);
    ui.off(UIEvents.LEFT, this.onLeft, this);
    ui.off(UIEvents.RIGHT, this.onRight, this);
    ui.off(UIEvents.CONFIRM, this.onConfirm, this);
    ui.off(UIEvents.CANCEL, this.onCancel, this);
  }

  /**
   * Set data on the rootUI of it, you can call 'getData' to use the data.
   * @param key The key to set the value for. Or an object of key value pairs. If an object the data argument is ignored.
   * @param data The value to set for the given key. If an object is provided as the key this argument is ignored.
   */
  setData(key: string, data: unknown) {
    this.rootUI.root.setData(key, data);
  }

  /**
   * Retrieves the value for the given key in this Game Objects Data Manager, or undefined if it doesn't exist.
   * @param key The key of the value to retrieve, or an array of keys.
   */
  getData(key: string) {
    return this.rootUI.root.getData(key);
  }

  get focusUI(): UIBase | undefined {
    return this._focusUI;
  }

  set focusUI(value: UIBase) {
    this._focusUI = value;
  }

  onUp() {}
  onDown() {}
  onLeft() {}
  onRight() {}
  onConfirm() {}
  onCancel() {}
}
