import { Entity } from "@latticexyz/recs";
import { isBuilding, isRole, selectHost } from "../../logics/entity";
import { Direction } from "../../logics/move";
import { getTargetTerrainData } from "../../logics/terrain";
import { SceneObjectController } from "../components/controllers/SceneObjectController";
import { UIController } from "../components/controllers/UIController";
import { Building } from "./Building";
import { Role } from "./Role";
import { SceneObject } from "./SceneObject";

export class Observer extends SceneObject {
  onUpPressed() {
    super.onUpPressed();
    SceneObjectController.setTargetTilePosition(Direction.UP);
  }
  onDownPressed() {
    super.onDownPressed();
    SceneObjectController.setTargetTilePosition(Direction.DOWN);
  }
  onLeftPressed() {
    super.onLeftPressed();
    SceneObjectController.setTargetTilePosition(Direction.LEFT);
  }
  onRightPressed() {
    super.onRightPressed();
    SceneObjectController.setTargetTilePosition(Direction.RIGHT);
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
      const entityObj: Role = this.scene.roles[entity];
      if (entityObj.isMoving) return;
      SceneObjectController.focus = entityObj;
      if (entityObj.isPlayer) UIController.scene.actionMenu?.show(entityObj);
      this.updateSelectedHost(entityObj.entity);
    } else if (type === "building") {
      const building: Building = this.scene.buildings[entity];
      SceneObjectController.focus = building;
      UIController.scene.buildingMenu?.show(building);
      this.updateSelectedHost(building.entity);
    }
  }

  updateSelectedHost(entity: Entity) {
    selectHost(this.components, entity);
  }
}
