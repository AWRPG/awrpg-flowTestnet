import { UIScene } from "../scenes/UIScene";
import { UIManager } from "./UIManager";
import { ALIGNMODES } from "../../constants";
import { Box } from "../components/ui/Box";
import { UIBase } from "../components/ui/UIBase";
import { Button } from "../components/ui/Button";
import { UIText } from "../components/ui/UIText";
import { UIImage } from "../components/ui/UIImage";

export class ActionMenu extends UIManager {
  constructor(scene: UIScene) {
    // super(
    //   scene,
    //   new Box(scene, "ui-box", ALIGNMODES.MIDDLE_CENTER, 360, 264, 220, 0)
    // );

    // // Title
    // new UIText(
    //   scene,
    //   "ACTIONS",
    //   ALIGNMODES.MIDDLE_TOP,
    //   0,
    //   16,
    //   { fontColor: "#2D3E51", fontSize: 36 },
    //   this.rootUI
    // );

    super(
      scene,
      new Box(scene, "ui-box", ALIGNMODES.MIDDLE_CENTER, 360, 210, 220, 0)
    );

    // Title
    const titleBox = new Box(
      scene,
      "ui-box-title-out-side2",
      ALIGNMODES.RIGHT_TOP,
      178,
      58,
      8,
      -36,
      { leftWidth: 24, rightWidth: 24, topHeight: 24, bottomHeight: 24 },
      this.rootUI
    );
    new UIText(
      scene,
      "ACTIONS",
      ALIGNMODES.MIDDLE_CENTER,
      0,
      0,
      { fontColor: "#2D3E51", fontSize: 32 },
      titleBox
    );

    const buttons: { name: string; button: Button }[] = (this.buttons = []);
    const buttonsIndex = ["Move", "Build", "Change Terrain"];
    buttonsIndex.forEach((name, index) => {
      buttons.push({
        name: name,
        button: new Button(
          scene,
          "ui-empty",
          name,
          ALIGNMODES.LEFT_TOP,
          260,
          48,
          0,
          28 + index * 56,
          {
            selectedTexture: "btn_select_skin",
            fontColor: "#2D3E51",
            fontFamily: "ThaleahFat",
            fontSize: 36,
            fontAlignMode: ALIGNMODES.LEFT_CENTER,
            leftWidth2: 16,
            rightWidth2: 16,
            topHeight2: 16,
            bottomHeight2: 16,
          },
          this.rootUI
        ),
      });
    });
    this.currentButtonIndex = 0;
    this.selectButton();
  }

  //   /**
  //    *
  //    */
  //   setButtons() {
  //     // Move to & Enter buildings
  //     // Attack
  //     // [TODO]
  //     // 1. Selected a host
  //     // 2. Select any tile
  //     // Build
  //     // Create NPC?
  //     // [TODO]
  //     // Change terrains
  //     // [TODO]
  //     // [In a miner] Start Mining
  //     // [In a miner] Stop Mining
  //   }
}
