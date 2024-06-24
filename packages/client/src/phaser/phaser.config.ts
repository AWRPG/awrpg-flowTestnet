import Phaser from "phaser";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: "phaser-container",
  backgroundColor: "#1a103c",
  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  // pixelArt: true,
  // disableContextMenu: true,
  // audio: {
  //   disableWebAudio: false,
  // },
};

export default config;
