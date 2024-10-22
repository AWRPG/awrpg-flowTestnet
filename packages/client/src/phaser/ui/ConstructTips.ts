import { UIScene } from "../scenes/UIScene";
import { GuiBase } from "./GuiBase";
import { ALIGNMODES, HIGHLIGHT_MODE } from "../../constants";
import { UIList } from "../components/ui/common/UIList";
import { Box } from "../components/ui/Box";
import { Box2 } from "../components/ui/Box2";
import { UIText } from "../components/ui/common/UIText";
import { ButtonA } from "../components/ui/ButtonA";
import { MenuTitle } from "../components/ui/MenuTitle";
import { UIController } from "../components/controllers/UIController";
import { SceneObjectController } from "../components/controllers/SceneObjectController";
import { Role } from "../objects/Role";
import { UIBase } from "../components/ui/common/UIBase";
import { BuildingData, BuildingSpecs } from "../../api/data";
import { Hex } from "viem";
import { PlayerInput } from "../components/controllers/PlayerInput";
import { Direction } from "../../logics/move";

/**
 * show the action buttons player can do
 */
export class ConstructTips extends GuiBase {
  role?: Role;
  buildingType?: Hex;
  buildingSpecs?: BuildingSpecs;

  /** */
  constructor(scene: UIScene) {
    super(scene, new UIBase(scene));
    this.name = "ConstructTips";
    this.focusUI = this.rootUI;
  }

  show(role: Role, buildingType: Hex, buildingSpecs: BuildingSpecs) {
    super.show();
    this.onMenuListen();
    this.buildingType = buildingType;
    this.buildingSpecs = buildingSpecs;
    this.role = role ?? this.role;

    if (!this.role) return;
    SceneObjectController.openTileHighlight(
      this.role.entity,
      1,
      HIGHLIGHT_MODE.BUILD,
      1,
      buildingSpecs.width,
      buildingSpecs.height
    );
    PlayerInput.onlyListenUI();
  }

  hidden() {
    this.offMenuListen();
    super.hidden();
    if (this.role) {
      SceneObjectController.closeTileHighlight(this.role.entity);
    }
  }

  onUp() {
    SceneObjectController.setTargetTilePosition(Direction.UP);
    this.onARROW();
  }
  onDown() {
    SceneObjectController.setTargetTilePosition(Direction.DOWN);
    this.onARROW();
  }
  onLeft() {
    SceneObjectController.setTargetTilePosition(Direction.LEFT);
    this.onARROW();
  }
  onRight() {
    SceneObjectController.setTargetTilePosition(Direction.RIGHT);
    this.onARROW();
  }

  onConfirm() {}

  onCancel() {}

  onARROW() {}
}
