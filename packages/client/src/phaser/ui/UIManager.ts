import { UIScene } from "../scenes/UIScene";
import { UIBase } from "../components/ui/UIBase";
import { Button } from "../components/ui/Button";

export class UIManager {
  name: string;
  scene: UIScene;
  isVisible: boolean = false;
  rootUI: UIBase;
  buttons: { name: string; button: Button }[] | undefined;
  currentButtonIndex: number = 0;
  onDataChanged(parent: unknown, key: string, data: unknown) {}

  constructor(scene: UIScene, rootUI: UIBase) {
    this.name = "UIManager";
    this.scene = scene;
    this.rootUI = rootUI;
    this.hidden();
    this.rootUI.root.on("changedata", this.onDataChanged, this);
  }

  show(...params: unknown[]) {
    this.rootUI.root.setVisible(true);
    this.isVisible = true;
    this.scene.focusUI = this;
  }

  hidden(...params: unknown[]) {
    this.rootUI.root.setVisible(false);
    this.isVisible = false;
  }

  setData(key: string, data: unknown) {
    this.rootUI.root.setData(key, data);
  }

  getData(key: string) {
    return this.rootUI.root.getData(key);
  }

  setButtonIndex(index: number) {
    if (!this.buttons) return;
    index = Math.ceil(index);
    if (index >= this.buttons.length || index < 0) return;
    this.currentButtonIndex = index;
  }

  prevButton() {
    if (!this.buttons) return;
    this.unSelectButton();
    this.currentButtonIndex--;
    if (this.currentButtonIndex < 0)
      this.currentButtonIndex = this.buttons.length - 1;
    this.selectButton();
  }

  nextButton() {
    if (!this.buttons) return;
    this.unSelectButton();
    this.currentButtonIndex++;
    if (this.currentButtonIndex >= this.buttons.length)
      this.currentButtonIndex = 0;
    this.selectButton();
  }

  unSelectButton() {
    if (!this.buttons) return;
    const button = this.buttons[this.currentButtonIndex].button;
    button.skin.show();
    button.selectedSkin.hide();
  }

  selectButton() {
    if (!this.buttons) return;
    const button = this.buttons[this.currentButtonIndex].button;
    button.skin.hide();
    button.selectedSkin.show();
  }
}
