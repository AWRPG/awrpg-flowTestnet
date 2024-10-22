import { UIScene } from "../scenes/UIScene";
import { GuiBase } from "./GuiBase";
import { ALIGNMODES, HIGHLIGHT_MODE, OBSERVER } from "../../constants";
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
import { Hex, toHex } from "viem";
import { PlayerInput } from "../components/controllers/PlayerInput";
import { Direction, setNewTargetTile } from "../../logics/move";
import { Fake } from "../objects/Fake";
import { Entity } from "@latticexyz/recs";
import { encodeTypeEntity } from "../../utils/encode";

/**
 * show the action buttons player can do
 */
export class ConstructTips extends GuiBase {
  role?: Role;
  buildingData?: BuildingData;
  buildingType?: Hex;
  buildingSpecs?: BuildingSpecs;
  fake: Fake;

  /** */
  constructor(scene: UIScene) {
    super(scene, new UIBase(scene));
    this.name = "ConstructTips";
    this.focusUI = this.rootUI;
  }

  show(role: Role, buildingData: BuildingData, prevGui?: GuiBase) {
    super.show();
    this.prevGui = prevGui;
    this.buildingData = buildingData;
    this.buildingType = toHex(buildingData.type, { size: 16 });
    this.buildingSpecs = UIController.scene.constructMenu?.getBuildingSpecs(
      this.buildingType
    );
    this.role = role ?? this.role;
    if (!this.role || !this.buildingSpecs) return;

    // Show tile highlight for build
    SceneObjectController.openTileHighlight(
      this.role.entity,
      1,
      HIGHLIGHT_MODE.BUILD,
      1,
      this.buildingSpecs?.width,
      this.buildingSpecs?.height
    );

    // Show the fake building sprite
    const texture = this.buildingData?.sceneImg!;
    this.fake = new Fake(SceneObjectController.scene, OBSERVER, {
      texture,
      width: this.buildingSpecs.width,
      height: this.buildingSpecs.height,
    });
    this.fake.flickerEffect();
    SceneObjectController.cursor?.add(this.fake);

    this.onMenuListen();
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

  onARROW() {
    if (!this.role) return;
    const highlights =
      SceneObjectController.scene.tileHighlights[this.role.entity];
  }

  onConfirm() {
    if (!this.role || !this.buildingType) return;
    if (this.role.construct(this.buildingType)) {
      // Clear fake object
      if (this.fake) this.fake.destroy();
      // Update GUI
      this.hidden();
      SceneObjectController.resetFocus();
      PlayerInput.onlyListenSceneObject();
    }
  }

  onCancel() {
    // Update GUI
    this.hidden();
    this.prevGui?.show();
    // Clear fake object
    if (this.fake) this.fake.destroy();
    // Reset the target tile
    if (this.role) setNewTargetTile(this.components, this.role.tilePosition);
  }
}
