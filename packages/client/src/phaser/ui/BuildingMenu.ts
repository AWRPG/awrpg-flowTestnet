import { Entity, getComponentValue } from "@latticexyz/recs";
import { ALIGNMODES, SOURCE } from "../../constants";
import { Box } from "../components/ui/Box";
import { Button } from "../components/ui/Button";
import { UIList } from "../components/ui/common/UIList";
import { UIScene } from "../scenes/UIScene";
import { ButtonA } from "../components/ui/ButtonA";
import { GuiBase } from "./GuiBase";
import { canRoleEnter, roleAndHostWithinRange } from "../../logics/building";
import { getTargetTerrainData } from "../../logics/terrain";
import {
  getBuildingStakeOuputTypes,
  getBuildingStakingIds,
} from "../../logics/stake";
import { Hex } from "viem";
import { Box2 } from "../components/ui/Box2";
import { Building } from "../objects/Building";
import { UIController } from "../components/controllers/UIController";
import { SceneObjectController } from "../components/controllers/SceneObjectController";
import { MenuTitle } from "../components/ui/MenuTitle";

export class BuildingMenu extends GuiBase {
  list: UIList;
  building?: Building;

  components: UIScene["components"];
  systemCalls: UIScene["systemCalls"];

  _building?: Entity;
  source?: Entity;
  canEnter?: boolean;
  withinRange?: boolean;

  stakeTypes: Hex[] = [];
  stakingIds: Entity[] = [];

  constructor(scene: UIScene) {
    super(
      scene,
      new Box(scene, {
        width: 360,
        height: 210,
        alignModeName: ALIGNMODES.MIDDLE_CENTER,
        marginX: 220,
      })
    );

    this.components = scene.components;
    this.systemCalls = scene.systemCalls;
    this.name = "BuildingMenu";

    // Title
    const titleBox = new Box2(scene, {
      width: 178,
      height: 58,
      alignModeName: ALIGNMODES.RIGHT_TOP,
      marginX: 8,
      marginY: -36,
      parent: this.rootUI,
    });
    new MenuTitle(scene, "BUILDING", { parent: titleBox });
    // stake -> systemCalls. ["stake", "store"]
    // cook -> systemCalls. ["cook", "store"]

    this.list = new UIList(scene, {
      marginY: 28,
      itemWidth: 260,
      itemHeight: 48,
      spacingY: 12,
      parent: this.rootUI,
      onCancel: () => {
        this.hidden();
        SceneObjectController.resetFocus();
        SceneObjectController.controllable = true;
      },
    });
    this.focusUI = this.list;
  }

  show(building?: Building) {
    super.show();
    this.building = building ?? this.building;
    SceneObjectController.focus = this.building;
    UIController.controllable = true;
    this.update();
  }

  update() {
    const tileData = getTargetTerrainData(this.components, this.systemCalls);
    this._building = tileData?.coordEntity as Entity;
    const { SelectedHost } = this.components;
    this.source = getComponentValue(SelectedHost, SOURCE)?.value as Entity;
    this.canEnter = this._building
      ? canRoleEnter(this.components, this.source, this._building)
      : false;
    this.withinRange =
      this._building && this.source
        ? roleAndHostWithinRange(this.components, this.source, this._building)
        : false;
    this.stakeTypes = getBuildingStakeOuputTypes(
      this.components,
      this._building
    );
    this.stakingIds = getBuildingStakingIds(
      this.components,
      this._building as Hex
    );
    this.updateButtons();
  }

  updateButtons() {
    this.list.destroyChildren();
    let index = 0;
    if (this.stakeTypes.length > 0) {
      this.addStakeButton(index);
      index++;
    }
    if (this.stakingIds.length > 0) {
      // this.addStakingButton(index);
      index++;
    }
    // this.selectButton();
  }

  addStakeButton(index: number) {
    const button = new ButtonA(this.scene, {
      text: "Stake",
      onConfirm: () => {
        this.hidden();
        UIController.scene.stakeMenu?.show();
      },
    });
    this.list.addItem(button);
  }

  addStakingButton(index: number) {
    const button = new ButtonA(this.scene, "staking", 260, 48, {
      alignModeName: ALIGNMODES.LEFT_TOP,
      marginY: 28 + index * 56,
      parent: this.rootUI,
      fontAlignMode: ALIGNMODES.LEFT_CENTER,
    });
    this.buttons.push({
      name: "staking",
      button: button,
      onClick: () => {
        this.scene.scene.get("GameScene").playController.movable = false;
        this.scene.buildingMenu?.hidden();
        this.scene.stakingMenu?.show();
        this.scene.stakingMenu?.update();
      },
    });
  }

  // selectButton() {
  //   const button = this.buttons[this.currentButtonIndex]?.button;
  //   if (button) {
  //     button.select();
  //   }
  // }
}
