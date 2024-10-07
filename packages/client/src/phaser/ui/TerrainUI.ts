import { UIScene } from "../scenes/UIScene";
import { GuiBase } from "./GuiBase";
import { Box } from "../components/ui/Box";
import { UIText } from "../components/ui/common/UIText";
import { ALIGNMODES } from "../../constants";

export class TerrainUI extends GuiBase {
  terrainNameText: UIText;
  terrainInfoText: UIText;

  /**
   * @param terrainName the name of terrain such as 'ocean'
   */
  constructor(scene: UIScene) {
    super(
      scene,
      new Box(scene, "ui-box", 280, 128, {
        alignModeName: ALIGNMODES.RIGHT_TOP,
        marginX: 8,
        marginY: 8,
      })
    );
    this.setData("terrainName", "");

    this.terrainNameText = new UIText(this.scene, "", {
      alignModeName: ALIGNMODES.LEFT_TOP,
      marginX: 16,
      marginY: 12,
      parent: this.rootUI,
      fontSize: 28,
    });

    this.terrainInfoText = new UIText(this.scene, "", {
      alignModeName: ALIGNMODES.LEFT_TOP,
      marginX: 16,
      marginY: 56,
      parent: this.rootUI,
      wordWrap: 1024,
    });
  }

  onDataChanged(parent: unknown, key: string, data: string) {
    this.terrainNameText.setText(data.toLocaleUpperCase());
    switch (data) {
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
  }
}
