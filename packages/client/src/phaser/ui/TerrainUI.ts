import { UIScene } from "../scenes/UIScene";
import { UIManager } from "./UIManager";
import { Box } from "../components/ui/Box";
import { UIText } from "../components/ui/UIText";
import { ALIGNMODES } from "../../constants";

export class TerrainUI extends UIManager {
  terrainNameText: UIText;
  terrainInfoText: UIText;

  /**
   * @param terrainName the name of terrain such as 'ocean'
   */
  constructor(scene: UIScene) {
    super(
      scene,
      new Box(scene, "ui-box", ALIGNMODES.RIGHT_TOP, 280, 128, 8, 8)
    );
    this.setData("terrainName", "");

    this.terrainNameText = new UIText(
      this.scene,
      "",
      ALIGNMODES.LEFT_TOP,
      16,
      8,
      { fontSize: 32 },
      this.rootUI
    );

    this.terrainInfoText = new UIText(
      this.scene,
      "",
      ALIGNMODES.LEFT_TOP,
      16,
      56,
      { wordWrap: 1024 },
      this.rootUI
    );
  }

  onDataChanged(parent: unknown, key: string, data: string) {
    this.terrainNameText.setText(data);
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
