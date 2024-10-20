import { isBuilding, isRole } from "../../logics/entity";
import { Direction, setNewTargetTile } from "../../logics/move";
import { getTargetTerrainData } from "../../logics/terrain";
import { SceneObjectController } from "../components/controllers/SceneObjectController";
import { UIController } from "../components/controllers/UIController";
import { Building } from "./Building";
import { Role } from "./Role";
import { SceneObject } from "./SceneObject";

export class Observer extends SceneObject {
  // cursorMoveInterval: number = 125;
  // cursorLastDate: number = 0;

  onUpPressed() {
    super.onUpPressed();
    SceneObjectController.moveCursor(Direction.UP);
  }
  onDownPressed() {
    super.onDownPressed();
    SceneObjectController.moveCursor(Direction.DOWN);
  }
  onLeftPressed() {
    super.onLeftPressed();
    SceneObjectController.moveCursor(Direction.LEFT);
  }
  onRightPressed() {
    super.onRightPressed();
    SceneObjectController.moveCursor(Direction.RIGHT);
  }

  onConfirmPressed() {
    super.onConfirmPressed();
    const tileData = getTargetTerrainData(
      this.components,
      this.scene.systemCalls
    );
    const entity = tileData?.coordEntity;
    if (!entity) return;
    const type = entity
      ? isRole(this.components, entity)
        ? "role"
        : isBuilding(this.components, entity)
          ? "building"
          : undefined
      : undefined;
    if (type === "role") {
      const entityObj: Role = this.scene.hosts[entity];
      if (entityObj.isMoving) return;
      SceneObjectController.focus = entityObj;
      if (entityObj.isPlayer) UIController.scene.actionMenu?.show(entityObj);
    } else if (type === "building") {
      const building: Building = this.scene.buildings[entity];
      SceneObjectController.focus = building;
      UIController.scene.buildingMenu?.show(building);
    }
  }
}
