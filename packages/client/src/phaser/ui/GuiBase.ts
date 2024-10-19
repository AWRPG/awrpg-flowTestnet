import { UIBase } from "../components/ui/common/UIBase";
import { Button } from "../components/ui/Button";
import { UIController } from "../components/controllers/UIController";
import { UIScene } from "../scenes/UIScene";
import { ClientComponents } from "../../mud/createClientComponents";
import { SystemCalls } from "../../mud/createSystemCalls";
import { SetupNetworkResult } from "../../mud/setupNetwork";

/**
 * All the complex UI Components need to extend from this class.
 */
export class GuiBase {
  /**
   * the UIScene
   */
  scene: UIScene;

  components: ClientComponents;

  network?: SetupNetworkResult;

  systemCalls: SystemCalls;

  /**
   * The name is used for controllers to determine the current UI object
   */
  name: string;

  /**
   * [only read] Determine if the current object is displayed
   * If you want to change the visible state, you need to use the show() and hide() controls.
   */
  isVisible: boolean = false;

  /**
   * Each GuiBase must have a basic UI component as a root node
   */
  rootUI: UIBase;

  /**
   * Controllers need to determine the current focus based on whether a button list exists.
   */
  buttons: { name: string; button: Button; onClick: () => void }[] = [];

  /**
   * The index of button list
   */
  currentButtonIndex: number = 0;

  resizeListener: Function | undefined;

  private _focusUI?: UIBase;

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
    this.hidden(); // It will only be displayed when be called.
    this.rootUI.root.on("changedata", this.onDataChanged, this);
  }

  /**
   * Show it
   */
  show(...params: unknown[]) {
    if (!this.resizeListener) {
      this.resizeListener = (gameSize: Phaser.Structs.Size) => {
        // this.rootUI.updatePosition(gameSize);
      };
      this.scene.scale.on("resize", this.resizeListener);
    }
    if (this.focusUI) UIController.focus = this.focusUI; // Set focus
    this.rootUI.root.setVisible(true);
    this.isVisible = true;
  }

  /**
   * Hide it
   */
  hidden(...params: unknown[]) {
    this.rootUI.root.setVisible(false);
    this.isVisible = false;
    if (UIController.focus === this.focusUI) UIController.focus = undefined;
    this.scene.scale.off("resize", this.resizeListener);
    this.resizeListener = undefined;
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

  /**
   * Set the index of current button
   */
  setButtonIndex(index: number) {
    if (!this.buttons) return;
    index = Math.ceil(index);
    if (index >= this.buttons.length || index < 0) return;
    this.currentButtonIndex = index;
  }

  /**
   * Move the index of current button to the previous button of this.buttons
   */
  prevButton() {
    if (!this.buttons) return;
    this.unSelectButton();
    this.currentButtonIndex--;
    if (this.currentButtonIndex < 0)
      this.currentButtonIndex = this.buttons.length - 1;
    this.selectButton();
  }

  /**
   * Move the index of current button to the next button of this.buttons
   */
  nextButton() {
    if (!this.buttons) return;
    this.unSelectButton();
    this.currentButtonIndex++;
    if (this.currentButtonIndex >= this.buttons.length)
      this.currentButtonIndex = 0;
    this.selectButton();
  }

  /**
   * Change the effect of button to unselected (logic not included)
   */
  unSelectButton() {
    if (!this.buttons) return;
    const button = this.buttons[this.currentButtonIndex].button;
    button.skin.show();
    button.selectedSkin.hidden();
  }

  /**
   * Change the effect of button to selected (logic not included)
   */
  selectButton() {
    if (!this.buttons) return;
    const button = this.buttons[this.currentButtonIndex].button;
    button.skin.hidden();
    button.selectedSkin.show();
  }

  backButton() {
    this.buttons.forEach((button) => {
      button.button.destroyChildren();
    });
    // this.scene.focusUI.pop();
    this.hidden();
  }

  get focusUI(): UIBase | undefined {
    return this._focusUI;
  }

  set focusUI(value: UIBase) {
    this._focusUI = value;
  }
}
