import { UIScene } from "../scenes/UIScene";
import { GuiBase } from "./GuiBase";
import { Box } from "../components/ui/Box";
import { UIText } from "../components/ui/common/UIText";
import { Heading2 } from "../components/ui/Heading2";
import { Heading3 } from "../components/ui/Heading3";
import { ALIGNMODES, terrainMapping } from "../../constants";
import { getTargetTerrainData, TileData } from "../../logics/terrain";

export class TerrainUI extends GuiBase {
  terrainNameText: UIText;
  terrainInfoText: UIText;
  positionText: UIText;

  tileData?: TileData;

  /**
   * @param terrainName the name of terrain such as 'ocean'
   */
  constructor(scene: UIScene) {
    super(
      scene,
      new Box(scene, {
        width: 280,
        height: 102,
        alignModeName: ALIGNMODES.RIGHT_TOP,
        marginX: 8,
        marginY: 8,
      })
    );

    this.terrainNameText = new Heading2(this.scene, "", {
      marginX: 16,
      marginY: 12,
      parent: this.rootUI,
      fontSize: 28,
    });

    this.positionText = new Heading3(scene, "(66666, 66666) ", {
      marginX: 16,
      marginY: 48,
      parent: this.rootUI,
      // alignModeName: ALIGNMODES.RIGHT_TOP,
      fontSize: 14,
      fontStyle: "400",
    });
    this.terrainInfoText = new Heading3(this.scene, "", {
      marginX: 16,
      marginY: 70,
      parent: this.rootUI,
      wordWrapWidth: 1024,
    });
  }

  show() {
    super.show();
  }

  update() {
    this.tileData = getTargetTerrainData(this.components, this.systemCalls);
    if (!this.tileData) this.hidden();
    else {
      const coord = this.tileData.targetCoord;
      this.positionText.text = "(" + coord.x + ", " + coord.y + ")";

      const terrainName = terrainMapping[this.tileData.terrainType];
      this.terrainNameText.setText(terrainName.toLocaleUpperCase());
      switch (terrainName) {
        case "mud":
          this.terrainInfoText.setText("Any creature can move on.");
          break;
        case "plain":
          this.terrainInfoText.setText("Any creature can move on.");
          break;
        case "ocean":
          this.terrainInfoText.setText("Only Nagas can move on.");
          break;
        case "forest":
          this.terrainInfoText.setText("Only Elves can move on.");
          break;
        case "mountain":
          this.terrainInfoText.setText("Only Dwarves can move on.");
          break;
        default:
          this.terrainInfoText.setText("");
      }

      this.show();
    }
  }
}
