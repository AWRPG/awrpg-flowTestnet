import { UIScene } from "../../scenes/UIScene";
import { GuiBase } from "../GuiBase";
import { ALIGNMODES } from "../../../constants";
import { UIBase } from "../../components/ui/common/UIBase";
import { UIEvents } from "../../components/ui/common/UIEvents";
import { UIImage } from "../../components/ui/common/UIImage";
import { PlayerInput } from "../../components/controllers/PlayerInput";
import { SceneObjectController } from "../../components/controllers/SceneObjectController";

export class MainMenu extends GuiBase {
  book: UIImage;
  openFrame: Phaser.Types.Animations.AnimationFrame[] = [];
  closeFrame: Phaser.Types.Animations.AnimationFrame[] = [];

  constructor(scene: UIScene) {
    super(
      scene,
      new UIBase(scene, {
        width: scene.game.scale.width,
        height: scene.game.scale.height,
        alignModeName: ALIGNMODES.MIDDLE_CENTER,
      })
    );
    this.name = "MainMenu";
    this.focusUI = this.rootUI;

    const bookWidth = Math.min(896 * 2, this.rootUI.width * 0.8);
    const bookHeight = Math.min(720 * 2, bookWidth * 0.8);

    this.book = new UIImage(scene, "ui-book-open1", {
      width: bookWidth,
      height: bookHeight,
      alignModeName: ALIGNMODES.MIDDLE_CENTER,
      parent: this.rootUI,
    });
    this.book.alpha = 0;

    for (let i = 1; i <= 5; i++) {
      this.openFrame.push({ key: `ui-book-open${i}` });
      this.closeFrame.push({ key: `ui-book-close${i}` });
    }
    this.scene.anims.create({
      key: "openBook",
      frames: this.openFrame,
      frameRate: 30,
    });
    this.scene.anims.create({
      key: "closeBook",
      frames: this.closeFrame,
      frameRate: 30,
    });
  }

  show() {
    const anims = this.book.anims;
    if (anims?.isPlaying) return;
    super.show();
    this.scene.tweens.add({
      targets: this.book,
      alpha: 1,
      duration: 100,
    });
    this.book.image.once("animationcomplete", () => {
      // Must begin listening after animation complete
      PlayerInput.onlyListenUI();
      this.rootUI.on(UIEvents.MENU, this.hidden, this);
    });
    this.book.playAfterDelay("openBook", 200);
  }

  hidden() {
    const anims = this.book.anims;
    if (anims?.isPlaying) return;
    this.rootUI.off(UIEvents.MENU, this.hidden, this);
    this.book.image.once("animationcomplete", () => {
      this.scene.tweens.add({
        targets: this.book,
        alpha: 0,
        delay: 20,
        duration: 280,
        onComplete: () => {
          super.hidden();
          SceneObjectController.resetFocus();
          PlayerInput.onlyListenSceneObject();
        },
      });
    });
    this.book.playAfterDelay("closeBook", 0);
  }
}
