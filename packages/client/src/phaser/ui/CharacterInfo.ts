import { GuiBase } from "./GuiBase";
import { Box } from "../components/ui/Box";
import { Avatar } from "../components/ui/Avatar";
import { UIImage } from "../components/ui/common/UIImage";
import { UIText } from "../components/ui/common/UIText";
import { UISlider } from "../components/ui/common/UISlider";
import { ALIGNMODES } from "../../constants";
import { Heading2 } from "../components/ui/Heading2";
import { Heading3 } from "../components/ui/Heading3";
import { HpBar } from "../components/ui/HpBar";
import { SpBar } from "../components/ui/SpBar";
import { Role } from "../objects/Role";
import {
  defineSystem,
  defineUpdateSystem,
  Entity,
  getComponentValue,
  Has,
  setComponent,
  UpdateType,
} from "@latticexyz/recs";
import { getBalanceEntity } from "../../logics/container";
import { BLOOD, STAMINA } from "../../contract/constants";
import { Hex } from "viem";
import { decodeBalanceEntity } from "../../utils/encode";

export class CharacterInfo extends GuiBase {
  avatar: UIImage;
  role?: Entity;
  characterName: UIText;
  hpBar: HpBar;
  hpName: UIText;
  hpNum: UIText;
  spBar: UISlider;
  spName: UIText;
  spNum: UIText;

  // class data
  blood: number = 0;
  maxBlood: number = 0;
  stamina: number = 0;
  maxStamina: number = 0;
  soul: number = 0;
  maxSoul: number = 0;
  attack: number = 0;
  maxAttack: number = 0;
  defense: number = 0;
  maxDefense: number = 0;
  speed: number = 0;
  maxSpeed: number = 0;

  constructor(scene: Phaser.Scene) {
    super(
      scene,
      new Box(scene, {
        alignModeName: ALIGNMODES.LEFT_BOTTOM,
        width: 680,
        height: 192,
        marginX: 8,
        marginY: 8,
      })
    );

    this.name = "CharacterInfo";

    this.avatar = new Avatar(this.scene, "avatar-farmer-1-1", {
      alignModeName: ALIGNMODES.LEFT_BOTTOM,
      width: 256,
      height: 256,
      marginX: 1,
      marginY: 1,
      parent: this.rootUI,
    });

    this.characterName = new Heading2(this.scene, "Brief Kandle", {
      marginX: 268,
      marginY: 12,
      parent: this.rootUI,
    });

    this.hpBar = new HpBar(this.scene, {
      width: 358,
      height: 30,
      marginX: 268,
      marginY: 78,
      parent: this.rootUI,
    });

    this.hpName = new Heading3(this.scene, "HP", {
      marginX: 4,
      marginY: -20,
      parent: this.hpBar,
    });

    this.hpNum = new Heading3(this.scene, "1 / 1", {
      alignModeName: ALIGNMODES.RIGHT_TOP,
      marginX: 4,
      marginY: -20,
      parent: this.hpBar,
    });

    this.spBar = new SpBar(this.scene, {
      width: 358,
      height: 30,
      marginX: 268,
      marginY: 140,
      parent: this.rootUI,
    });

    this.spName = new Heading3(this.scene, "SP", {
      marginX: 4,
      marginY: -20,
      parent: this.spBar,
    });

    this.spNum = new Heading3(this.scene, "1 / 1", {
      alignModeName: ALIGNMODES.RIGHT_TOP,
      marginX: 4,
      marginY: -20,
      parent: this.spBar,
    });
    this.createSystem();
  }

  show(role: Role) {
    // initialize data
    this.role = role.entity;
    this.updateData();
    this.updateDisplay();

    super.show();

    // this.hpBar.listenComponentValue(
    //   role.components.PoolOf,
    //   (value: any) => {
    //     this.hpName.text = value.toString();
    //   },
    //   role.entity
    // );
  }

  /**
   * update (all) data every time 1 data changes, so as to save dev time
   */
  updateData() {
    const { Balance } = this.scene.components;
    const staminaEntity = getBalanceEntity(STAMINA, this.role as Hex);
    this.stamina = Number(
      getComponentValue(Balance, staminaEntity)?.value ?? 0n
    );
    const bloodEntity = getBalanceEntity(BLOOD, this.role as Hex);
    this.blood = Number(getComponentValue(Balance, bloodEntity)?.value ?? 0n);
  }

  /**
   * update display every time data changes
   */
  updateDisplay() {
    this.hpNum.text = this.blood + "/" + this.maxBlood;
    this.hpBar.max = this.maxBlood;
    this.hpBar.value = this.blood;
    this.spNum.text = this.stamina + "/" + this.maxStamina;
    this.spBar.max = this.maxStamina;
    this.spBar.value = this.stamina;
  }

  /**
   * created in constructor(), to update data according to the query
   */
  createSystem() {
    const { Balance } = this.scene.components;
    const { world } = this.scene.network;

    // update pool as long as the role is the same as the decoded entity
    defineSystem(world, [Has(Balance)], ({ entity, type }) => {
      if (type === UpdateType.Exit) return;
      const { owner } = decodeBalanceEntity(entity);
      if (!this.role || this.role !== (owner as Entity)) return;
      this.updateData();
      this.updateDisplay();
    });

    // TODO: add update max pool system
  }
}
