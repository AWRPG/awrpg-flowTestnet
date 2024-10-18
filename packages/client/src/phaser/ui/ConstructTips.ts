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
import { Host } from "../objects/Host";
import { UIBase } from "../components/ui/common/UIBase";
import { BuildingSpecs } from "../../api/data";

/**
 * show the action buttons player can do
 */
export class ConstructTips extends GuiBase {
  role?: Host;

  /** */
  constructor(scene: UIScene) {
    super(scene, new UIBase(scene));
    this.name = "ConstructTips";
  }

  show(role: Host, buildingSpecs: BuildingSpecs) {
    super.show();
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
    SceneObjectController.controllable = true;
  }

  hidden() {
    super.hidden();
    if (this.role) {
      SceneObjectController.closeTileHighlight(this.role.entity);
    }
  }
}
