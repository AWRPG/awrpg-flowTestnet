import { UIScene } from "../../scenes/UIScene";
import { GuiBase } from "../GuiBase";
import { ALIGNMODES } from "../../../constants";
import { UIBase } from "../../components/ui/common/UIBase";
import { UIEvents } from "../../components/ui/common/UIEvents";
import { UIImage } from "../../components/ui/common/UIImage";
import { PlayerInput } from "../../components/controllers/PlayerInput";
import { SceneObjectController } from "../../components/controllers/SceneObjectController";
import { Heading2 } from "../../components/ui/Heading2";
import { Heading3 } from "../../components/ui/Heading3";
import { Home } from "./Home";
import { Roles } from "./Roles";
import { MainMenuTitle } from "../../components/ui/MainMenuTitle";
import { StandardGameSize } from "../../components/ui/common/UIBase";

export class MainMenu extends GuiBase {
  icon: UIImage;
  book: UIImage;
  bookTitle: Heading2;
  tabs: UIBase;
  home: Home;
  roles: Roles;

  bookWidth: number;
  bookHeight: number;
  openFrame: Phaser.Types.Animations.AnimationFrame[] = [];
  closeFrame: Phaser.Types.Animations.AnimationFrame[] = [];

  constructor(scene: UIScene) {
    super(
      scene,
      new UIBase(scene, {
        width: StandardGameSize.maxWidth,
        height: StandardGameSize.maxHeight,
        alignModeName: ALIGNMODES.MIDDLE_CENTER,
      }),
      {
        autoZoom: true,
      }
    );
    this.name = "MainMenu";
    this.focusUI = this.rootUI;
    this.rootUI.setDepth(10);

    //===========================================
    //    Icon
    //===========================================
    this.icon = new UIImage(scene, "icon-item-book", {
      marginX: 16,
      marginY: 9,
    });
    const iconTips = new Heading3(scene, "[Esc]Menu", {
      parent: this.icon,
      marginX: 56,
      fontColor: "#EEEEEE",
      alignModeName: ALIGNMODES.LEFT_CENTER,
    });

    //===========================================
    //    Background
    //===========================================
    this.bookWidth = 1792;
    this.bookHeight = 1440;

    this.book = new UIImage(scene, "ui-book-open1", {
      width: this.bookWidth,
      height: this.bookHeight,
      alignModeName: ALIGNMODES.MIDDLE_CENTER,
      parent: this.rootUI,
    });
    this.book.alpha = 0;

    this.bookTitle = new Heading2(scene, "ABYSS\nWORLD\nBOOK", {
      alignModeName: ALIGNMODES.MIDDLE_CENTER,
      textAlign: "center",
      fontColor: "#c0875b",
      fontSize: this.bookWidth / 18,
      lineSpacing: 12,
      marginY: 0,
      parent: this.book,
    });

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

    //===========================================
    //    Pages
    //===========================================
    this.home = new Home(scene, this);
    this.roles = new Roles(scene, this);

    //===========================================
    //    Others
    //===========================================
    this.tabs = new UIBase(scene, {
      parent: this.book,
      height: this.bookHeight / 4,
      alignModeName: ALIGNMODES.RIGHT_CENTER,
      marginX: Math.ceil(this.bookWidth * 0.08),
    });
    this.tabs.visible = false;
    const tab1 = new UIImage(scene, "ui-book-tab", {
      width: (this.bookWidth / 896) * 64,
      height: (this.bookHeight / 720) * 33,
      parent: this.tabs,
      alignModeName: ALIGNMODES.RIGHT_TOP,
    });
    new UIImage(scene, "ui-book-tab-role", {
      width: tab1.height * 0.5,
      height: tab1.height * 0.5,
      parent: tab1,
      alignModeName: ALIGNMODES.MIDDLE_CENTER,
      marginY: -tab1.height * 0.1,
      marginX: -tab1.width * 0.06,
    });
  }

  show() {
    this.icon.hidden();
    const anims = this.book.anims;
    if (anims?.isPlaying) return;
    super.show();
    this.scene.tweens.add({
      targets: this.book,
      alpha: 1,
      duration: 100,
    });
    this.scene.tweens.add({
      targets: this.bookTitle,
      alpha: 1,
      duration: 100,
    });
    this.book.image.once("animationstart", () => {
      this.bookTitle.alpha = 0;
    });
    this.book.image.once("animationcomplete", () => {
      // Must begin listening after animation complete
      this.tabs.show();
      this.roles.show();
      PlayerInput.onlyListenUI();
      this.rootUI.on(UIEvents.MENU, this.hidden, this);
    });
    this.book.playAfterDelay("openBook", 300);
  }

  hidden() {
    const anims = this.book.anims;
    if (anims?.isPlaying) return;
    this.rootUI.off(UIEvents.MENU, this.hidden, this);
    this.roles.hidden();
    this.tabs.hidden();
    this.book.image.once("animationstart", () => {
      setTimeout(() => {
        this.bookTitle.alpha = 1;
      }, 210);
    });
    this.book.image.once("animationcomplete", () => {
      this.scene.tweens.add({
        targets: this.book,
        alpha: 0,
        delay: 220,
        duration: 180,
        onComplete: () => {
          super.hidden();
          this.icon.show();
          SceneObjectController.resetFocus();
          PlayerInput.onlyListenSceneObject();
        },
      });
    });
    this.book.playAfterDelay("closeBook", 0);
  }
}
