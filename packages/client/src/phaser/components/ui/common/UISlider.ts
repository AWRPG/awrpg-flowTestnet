import { UIBase, UIBaseConfig } from "./UIBase";
import { GameObjects } from "phaser";

export interface UISliderConfig extends UIBaseConfig {
  min?: number; // default 0
  max?: number; // default 100
  defaultValue?: number; // default same to max
  step?: number; // default 1
  vertical?: boolean; // default false
  trackMode?: number; // 0: NineSlice, 1: Sprite, default 0
  trackNineSlice?: number | number[];
  trackWidth?: number;
  trackHeight?: number;
  filledTrackMode?: number; // 0: NineSlice, 1: Sprite, default 0
  filledTrackNineSlice?: number | number[];
  filledTrackWidth?: number;
  filledTrackHeight?: number;
  thumbMode?: number; // 0: Image, 1: Sprite, default 0
  thumbAlignMode?: number; // 0: left, 1: middle, 2: right, default 1
  thumbWidth?: number;
  thumbHeight?: number;
  maskMode?: boolean;
  onChange?: () => void;
}

/**
 * Graphical display of numerical percentages such as blood bars, stamina slots
 */
export class UISlider extends UIBase {
  track: GameObjects.NineSlice | GameObjects.Sprite; // The empty part of the slider
  trackTexture: string;
  trackMode: number; // 0: NineSlice, 1: Sprite

  filledTrack: GameObjects.NineSlice | GameObjects.Sprite; // The filled part of the slider
  filledTrackTexture: string;
  filledTrackMode: number; // 0: NineSlice, 1: Sprite

  thumb: GameObjects.Image | GameObjects.Sprite | null = null; // The handle that's used to change the slider value.
  thumbTexture: string | null;
  thumbMode: number = 0; // 0: Image, 1: Sprite
  thumbAlignMode: number = 0; // 0: left, 1: middle, 2: right

  private _min: number;
  private _max: number;
  private _value: number;
  step: number;
  vertical: boolean;
  maskMode: boolean;
  onChange?: () => void;

  constructor(
    scene: Phaser.Scene,
    trackTexture: string,
    filledTrackTexture: string,
    thumbTexture: string | null,
    config: UISliderConfig = {}
  ) {
    super(scene, { texture: trackTexture, ...config });

    // empty track
    this.trackTexture = trackTexture;
    this.trackMode = config.trackMode ?? 0;
    if (this.trackMode === 0) {
      const { trackNineSlice = 0 } = config;
      const [leftWidth = 0, rightWidth = 0, topHeight = 0, bottomHeight = 0] =
        Array.isArray(trackNineSlice) ? trackNineSlice : [trackNineSlice];
      this.track = new GameObjects.NineSlice(
        scene,
        0,
        0,
        this.trackTexture,
        undefined,
        config.trackWidth ?? this.displayWidth / this.scale,
        config.trackHeight ?? this.displayHeight / this.scale,
        leftWidth,
        rightWidth,
        topHeight,
        bottomHeight
      );
    } else {
      this.track = new GameObjects.Sprite(scene, 0, 0, this.trackTexture);
      this.track.setDisplaySize(
        this.displayWidth / this.scale,
        this.displayHeight / this.scale
      );
    }
    this.track.setOrigin(0, 0);
    this.root.add(this.track);

    // filled track
    this.filledTrackTexture = filledTrackTexture;
    this.filledTrackMode = config.filledTrackMode ?? 0;
    if (this.filledTrackMode === 0) {
      const { filledTrackNineSlice = 0 } = config;
      const [leftWidth = 0, rightWidth = 0, topHeight = 0, bottomHeight = 0] =
        Array.isArray(filledTrackNineSlice)
          ? filledTrackNineSlice
          : [filledTrackNineSlice];
      this.filledTrack = new GameObjects.NineSlice(
        scene,
        0,
        0,
        this.filledTrackTexture,
        undefined,
        config.filledTrackWidth ?? this.displayWidth / this.scale,
        config.filledTrackHeight ?? this.displayHeight / this.scale,
        leftWidth,
        rightWidth,
        topHeight,
        bottomHeight
      );
    } else {
      this.filledTrack = new GameObjects.Sprite(
        scene,
        0,
        0,
        this.filledTrackTexture
      );
      this.filledTrack.setDisplaySize(
        this.displayWidth / this.scale,
        this.displayHeight / this.scale
      );
    }
    this.filledTrack.setOrigin(0, 0);
    this.root.add(this.filledTrack);

    // thumb
    this.thumbTexture = thumbTexture;
    if (this.thumbTexture !== null) {
      this.thumbMode = config.thumbMode ?? 0;
      if (this.thumbMode === 0) {
        this.thumb = new GameObjects.Image(
          scene,
          0,
          0,
          this.filledTrackTexture
        );
      } else {
        this.thumb = new GameObjects.Sprite(scene, 0, 0, this.thumbTexture);
      }
      this.thumbAlignMode = config.thumbAlignMode ?? 0;
      if (this.thumbAlignMode === 0) this.thumb.setOrigin(0, 0.5);
      else if (this.thumbAlignMode === 1) this.thumb.setOrigin(0.5, 0.5);
      else this.thumb.setOrigin(1, 0.5);
      this.root.add(this.thumb);
    }

    // states
    this._min = config.min ?? 0;
    this._max = config.max ?? 100;
    this._value = config.defaultValue ?? this.max;
    this.step = config.step ?? 1;
    this.vertical = config.vertical ?? false;
    this.maskMode = config.maskMode ?? true;
    this.updateFilledTrack();
  }

  updateFilledTrack() {
    const fillRatio = (this.value - this.min) / (this.max - this.min);
    const filledWidth = this.track.width * fillRatio;
    if (this.maskMode) {
      const maskGraphics = new GameObjects.Graphics(this.scene);
      maskGraphics.fillRect(0, 0, filledWidth, this.displayHeight);
      maskGraphics.x = this.globalX;
      maskGraphics.y = this.globalY;
      const mask = new Phaser.Display.Masks.GeometryMask(
        this.scene,
        maskGraphics
      );
      this.filledTrack.setMask(mask);
    } else {
      this.filledTrack.setDisplaySize(filledWidth, this.track.height);
    }
  }

  get value() {
    return this._value;
  }

  set value(newValue: number) {
    this._value = Phaser.Math.Clamp(newValue, this.min, this.max);
    if (this.onChange) this.onChange();
    this.updateFilledTrack();
  }

  get min() {
    return this._min;
  }

  set min(value: number) {
    this._min = value;
    this.updateFilledTrack();
  }

  get max() {
    return this._max;
  }

  set max(value: number) {
    this._max = value;
    this.updateFilledTrack();
  }
}
