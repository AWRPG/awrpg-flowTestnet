import { Entity, getComponentValue } from "@latticexyz/recs";
import { ALIGNMODES, SOURCE } from "../../constants";
import { Box } from "../components/ui/Box";
import { Button } from "../components/ui/Button";
import { UIText } from "../components/ui/UIText";
import { UIScene } from "../scenes/UIScene";
import { ButtonA } from "./buttons/ButtonA";
import { UIManager } from "./UIManager";
import { canRoleEnter, roleAndHostWithinRange } from "../../logics/building";
import { getTargetTerrainData } from "../../logics/terrain";
import {
  getBuildingStakeOuputTypes,
  getBuildingStakingIds,
} from "../../logics/stake";
import { Hex } from "viem";

export class BuildingMenu extends UIManager {
  components: UIScene["components"];
  systemCalls: UIScene["systemCalls"];

  building?: Entity;
  source?: Entity;
  canEnter?: boolean;
  withinRange?: boolean;

  stakeTypes: Hex[] = [];
  stakingIds: Entity[] = [];

  constructor(scene: UIScene) {
    super(
      scene,
      new Box(scene, "ui-box", 360, 210, {
        alignModeName: ALIGNMODES.MIDDLE_CENTER,
        marginX: 220,
      })
    );

    this.components = scene.components;
    this.systemCalls = scene.systemCalls;
    this.name = "BuildingMenu";

    // Title Background
    const titleBox = new Box(scene, "ui-box-title-out-side2", 178, 58, {
      alignModeName: ALIGNMODES.RIGHT_TOP,
      marginX: 8,
      marginY: -36,
      parent: this.rootUI,
      leftWidth: 24,
      rightWidth: 24,
      topHeight: 24,
      bottomHeight: 24,
    });

    // Title text
    new UIText(scene, "BUILDING", {
      alignModeName: ALIGNMODES.MIDDLE_CENTER,
      parent: titleBox,
      fontColor: "#2D3E51",
      fontSize: 32,
    });
    // stake -> systemCalls. ["stake", "store"]
    // cook -> systemCalls. ["cook", "store"]
  }

  update() {
    const tileData = getTargetTerrainData(this.components, this.systemCalls);
    this.building = tileData?.coordEntity as Entity;
    const { SelectedHost } = this.components;
    this.source = getComponentValue(SelectedHost, SOURCE)?.value as Entity;
    this.canEnter = this.building
      ? canRoleEnter(this.components, this.source, this.building)
      : false;
    this.withinRange =
      this.building && this.source
        ? roleAndHostWithinRange(this.components, this.source, this.building)
        : false;
    this.stakeTypes = getBuildingStakeOuputTypes(
      this.components,
      this.building
    );
    this.stakingIds = getBuildingStakingIds(
      this.components,
      this.building as Hex
    );
    this.updateButtons();
  }

  updateButtons() {
    this.buttons.forEach((button) => {
      button.button.destroyChildren();
    });
    this.buttons = [];
    let index = 0;
    if (this.stakeTypes.length > 0) {
      this.addStakeButton(index);
      index++;
    }
    if (this.stakingIds.length > 0) {
      this.addStakingButton(index);
      index++;
    }
    this.currentButtonIndex = 0;
    this.selectButton();
  }

  addStakeButton(index: number) {
    const button = new ButtonA(this.scene, "Stake", 260, 48, {
      alignModeName: ALIGNMODES.LEFT_TOP,
      marginY: 28 + index * 56,
      parent: this.rootUI,
      fontAlignMode: ALIGNMODES.LEFT_CENTER,
    });
    this.buttons.push({
      name: "Stake",
      button: button,
      onClick: () => {
        this.scene.scene.get("GameScene").playController.movable = false;
        this.scene.buildingMenu?.hidden();
        this.scene.stakeMenu?.show();
        this.scene.stakeMenu?.update();
      },
    });
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
