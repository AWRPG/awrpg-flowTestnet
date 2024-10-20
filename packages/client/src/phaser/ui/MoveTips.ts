import { UIScene } from "../scenes/UIScene";
import { GuiBase } from "./GuiBase";
import { ALIGNMODES } from "../../constants";
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

/**
 * show the action buttons player can do
 */
export class MoveTips extends GuiBase {
  role?: Role;

  /** */
  constructor(scene: UIScene) {
    super(scene, new UIBase(scene));
    this.name = "MoveTips";
  }

  show(role?: Role) {
    super.show();
    this.role = role ?? this.role;
    if (!this.role) return;
    SceneObjectController.openTileHighlight(this.role.entity);
    SceneObjectController.controllable = true;
    // this.role.alpha = 0.5;
    SceneObjectController.scene.cursor?.setAccessory(this.role.entity); // Bundle hostObj to cursor
  }

  hidden() {
    super.hidden();
    if (this.role) {
      // this.role.alpha = 1;
      SceneObjectController.closeTileHighlight(this.role.entity);
      // SceneObjectController.scene.cursor?.putAccessoryOnScene(this.role.entity);
      SceneObjectController.scene.cursor?.clearAccessory(this.role.entity);
    }
  }
}
