import { SetupResult } from "../../mud/setup";
import { CharacterInfo } from "../ui/CharacterInfo";
import { TerrainUI } from "../ui/TerrainUI";
import { ActionMenu } from "../ui/ActionMenu";
import { MoveTips } from "../ui/MoveTips";
import { BuildTips } from "../ui/BuildTips";
import { GuiBase } from "../ui/GuiBase";
import { UIBase } from "../components/ui/common/UIBase";
import { BuildMenu } from "../ui/BuildMenu";
import { BuildingMenu } from "../ui/BuildingMenu";
import { StakeMenu } from "../ui/StakeMenu";
import { StakingMenu } from "../ui/StakingMenu";
import "../components/ui/UIBaseExtend";
import { UIController } from "../components/controllers/UIController";

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

  /**
   * show the information of current host
   */
  characterInfo: CharacterInfo | undefined;

  /**
   * show the information of current terrain
   */
  terrainUI: TerrainUI | undefined;

  /**
   * show the action buttons player can do
   */
  actionMenu?: ActionMenu;

  buildingMenu: BuildingMenu | undefined;

  stakeMenu: StakeMenu | undefined;

  stakingMenu: StakingMenu | undefined;

  moveTips?: MoveTips;
  buildTips: GuiBase | undefined;

  buildMenu: BuildMenu | undefined;

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
    this.load.image("ui-empty", "src/assets/ui/empty.png");
    this.load.image("ui-box", "src/assets/ui/box_1.png");
    this.load.image(
      "ui-box-title-in-side2",
      "src/assets/ui/box_title_in_side2.png"
    );
    this.load.image(
      "ui-box-title-out-side2",
      "src/assets/ui/box_title_out_side2.png"
    );
    this.load.image("avatar-farmer-1-1", "src/assets/avatars/farmer_1_1.png");
    this.load.image("bar_empty", "src/assets/ui/bar_empty.png");
    this.load.image("bar_red", "src/assets/ui/bar_red.png");
    this.load.image("bar_blue", "src/assets/ui/bar_blue.png");
    this.load.image("bar_yellow", "src/assets/ui/bar_yellow.png");
    this.load.image("btn_decor1", "src/assets/ui/btn_decor1.png");
    this.load.image("btn_decor2", "src/assets/ui/btn_decor2.png");
    this.load.image("btn_decor3", "src/assets/ui/btn_decor3.png");
    this.load.image("btn_decor4", "src/assets/ui/btn_decor4.png");
    this.load.image("btn_select_skin", "src/assets/ui/btn_select_skin.png");
    this.load.image("img-building-safe", "src/assets/imgs/buildings/safe.png");
  }

  create() {
    this.characterInfo = new CharacterInfo(this);
    this.terrainUI = new TerrainUI(this);
    this.actionMenu = new ActionMenu(this);
    this.moveTips = new MoveTips(this);
    this.buildMenu = new BuildMenu(this);
    this.buildTips = new BuildTips(this);
    this.buildingMenu = new BuildingMenu(this);
    // this.stakeMenu = new StakeMenu(this);
    // this.stakingMenu = new StakingMenu(this);
    UIController.init(this);
  }
}
