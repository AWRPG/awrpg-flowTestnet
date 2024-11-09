import { SetupResult } from "../../mud/setup";
import { CharacterInfo } from "../ui/CharacterInfo";
import { TerrainUI } from "../ui/TerrainUI";
import { ActionMenu } from "../ui/ActionMenu";
import { MoveTips } from "../ui/MoveTips";
import { ConstructTips } from "../ui/ConstructTips";
import { GuiBase } from "../ui/GuiBase";
import { ConstructMenu } from "../ui/ConstructMenu";
import { BuildingMenu } from "../ui/BuildingMenu";
import { StakeMenu } from "../ui/StakeMenu";
import { StakingMenu } from "../ui/StakingMenu";
import "../components/ui/UIBaseExtend";
import { UIController } from "../components/controllers/UIController";
import { MainMenu } from "../ui/mainMenu/MainMenu";

export class UIScene extends Phaser.Scene {
  /**
   * components
   */
  components: SetupResult["components"];
  systemCalls: SetupResult["systemCalls"];
  network: SetupResult["network"];

  /**
   * the UI Components which is focused on
   */
  focusUI: GuiBase[] = [];

  mainMenu?: MainMenu;

  /**
   * show the information of current host
   */
  characterInfo?: CharacterInfo;

  /**
   * show the information of current terrain
   */
  terrainUI?: TerrainUI;

  /**
   * show the action buttons player can do
   */
  actionMenu?: ActionMenu;

  buildingMenu?: BuildingMenu;

  stakeMenu: StakeMenu | undefined;

  stakingMenu: StakingMenu | undefined;

  moveTips?: MoveTips;

  constructTips?: ConstructTips;

  constructMenu?: ConstructMenu;

  /**
   * @param setupResult
   * @param config
   */
  constructor(setupResult: SetupResult, config: Phaser.Types.Core.GameConfig) {
    super({ ...config, key: "UIScene", active: true });
    this.components = setupResult.components;
    this.systemCalls = setupResult.systemCalls;
    this.network = setupResult.network;
  }

  preload() {
    // Common
    this.load.image("ui-empty", "src/assets/ui/empty.png");
    this.load.image("ui-box", "src/assets/ui/box_1.png");
    this.load.image(
      "ui-box-title-out-side2",
      "src/assets/ui/box_title_out_side2.png"
    );
    this.load.image(
      "ui-box-title-in-side2",
      "src/assets/ui/box_title_in_side2.png"
    );
    this.load.image("ui-box3", "src/assets/ui/box3.png");
    this.load.image("list-slider-track", "src/assets/ui/list-slider-track.png");
    this.load.image("list-slider-thumb", "src/assets/ui/list-slider-thumb.png");
    this.load.image("btn_decor1", "src/assets/ui/btn_decor1.png");
    this.load.image("btn_decor2", "src/assets/ui/btn_decor2.png");
    this.load.image("btn_decor3", "src/assets/ui/btn_decor3.png");
    this.load.image("btn_decor4", "src/assets/ui/btn_decor4.png");
    this.load.image("btn_select_skin", "src/assets/ui/btn_select_skin.png");
    this.load.image("btn2_skin", "src/assets/ui/btn_2.png");
    this.load.image("btn2_select_skin", "src/assets/ui/btn_2_selected.png");

    // Dom
    this.load.html("dom-input", "src/assets/dom/input.html");

    // Main menu
    for (let i = 1; i <= 5; i++) {
      this.load.image(
        `ui-book-open${i}`,
        `src/assets/ui/main-menu/open/${i}.png`
      );
      this.load.image(
        `ui-book-close${i}`,
        `src/assets/ui/main-menu/close/${i}.png`
      );
    }
    this.load.image("ui-book-tab", "src/assets/ui/main-menu/tabs/2.png");
    this.load.image(
      "ui-book-tab-selected",
      "src/assets/ui/main-menu/tabs/3.png"
    );
    this.load.image(
      "ui-book-tab-role",
      "src/assets/ui/main-menu/tabs/role.png"
    );

    // States
    this.load.image("bar_empty", "src/assets/ui/bar_empty.png");
    this.load.image("bar_red", "src/assets/ui/bar_red.png");
    this.load.image("bar_blue", "src/assets/ui/bar_blue.png");
    this.load.image("bar_yellow", "src/assets/ui/bar_yellow.png");

    // Bag
    this.load.image("bag-icon-bg", "src/assets/ui/bag/icon-bg.png");
    this.load.image("bag-icon-cursor1", "src/assets/ui/bag/icon-cursor1.png");
    this.load.image("bag-icon-cursor2", "src/assets/ui/bag/icon-cursor2.png");
    this.load.image("bag-icon-cursor3", "src/assets/ui/bag/icon-cursor3.png");
    this.load.image("bag-icon-cursor4", "src/assets/ui/bag/icon-cursor4.png");

    // Items
    this.load.image("icon-item-sword", "src/assets/icons/items/sword.png");
    this.load.image("icon-item-wood", "src/assets/icons/items/wood.png");
    this.load.image("icon-item-berry", "src/assets/icons/items/berry.png");
    this.load.image("icon-item-book", "src/assets/icons/items/book.png");

    // Avatars
    this.load.image("avatar-farmer-1-1", "src/assets/avatars/farmer_1_1.png");

    // Buildings big image
    this.load.image("img-building-safe", "src/assets/imgs/buildings/safe.png");
    this.load.image(
      "img-building-repository",
      "src/assets/imgs/buildings/repository.png"
    );
    this.load.image(
      "img-building-mine-shaft",
      "src/assets/imgs/buildings/mine-shaft.png"
    );
    this.load.image(
      "img-building-field",
      "src/assets/imgs/buildings/field.png"
    );
  }

  create() {
    this.mainMenu = new MainMenu(this);
    this.characterInfo = new CharacterInfo(this);
    this.terrainUI = new TerrainUI(this);
    this.actionMenu = new ActionMenu(this);
    this.moveTips = new MoveTips(this);
    this.constructMenu = new ConstructMenu(this);
    this.constructTips = new ConstructTips(this);
    this.buildingMenu = new BuildingMenu(this);
    // this.stakeMenu = new StakeMenu(this);
    // this.stakingMenu = new StakingMenu(this);
    UIController.init(this);
  }
}
