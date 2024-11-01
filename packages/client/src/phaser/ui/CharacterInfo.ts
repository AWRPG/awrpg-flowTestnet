import { UIScene } from "../scenes/UIScene";
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
  HasValue,
  runQuery,
  setComponent,
  UpdateType,
} from "@latticexyz/recs";
import {
  ATTACK,
  BLOOD,
  DEFENSE,
  RANGE,
  SOUL,
  STAMINA,
} from "../../contract/constants";
import { Hex } from "viem";
import { decodeBalanceEntity, encodeTypeEntity } from "../../utils/encode";
import { getEntityPoolsInfo } from "../../logics/pool";
import { getEntitySpecs } from "../../logics/entity";
import { getERC20Balances } from "../../logics/container";
import { getEntitiesInCustodian } from "../../logics/custodian";

/**
 * note: this phaesr ui mirrors Pool.tsx; can be an example to construct other "pool" phaer ui
 */
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

  // --- class data ---
  // name
  hostName: string = "";
  // pools data
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
  range: number = 0;
  maxRange: number = 0;
  // stored size, capacity, and size
  capacity: number = 0;
  storedSize: number = 0;
  size: number = 0;

  // ---- bag items data ----
  // erc721 entities
  erc721Entities: Entity[] = [];
  // erc20 entityType & amount;
  erc20Items: { type: Hex; amount: number }[] = [];
  // equipments
  equipments: Entity[] = [];

  constructor(scene: UIScene) {
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

    this.characterName = new Heading2(this.scene, this.hostName, {
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

    this.createBagSystem();
  }

  show(role: Role) {
    // initialize data
    this.role = role.entity;
    this.updateData();
    this.updateDisplay();

    // bag
    this.updateBagData();

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
    const components = this.scene.components;
    const { ContainerSpecs, SizeSpecs, StoredSize, HostName } = components;
    if (!this.role) return;
    this.hostName = getComponentValue(HostName, this.role)?.name ?? "";
    this.capacity = Number(
      getEntitySpecs(components, ContainerSpecs, this.role)?.capacity ?? 0n
    );
    this.size = Number(
      getEntitySpecs(components, SizeSpecs, this.role)?.size ?? 0n
    );
    this.storedSize = Number(
      getComponentValue(StoredSize, this.role)?.value ?? 0n
    );
    const poolsInfo = getEntityPoolsInfo(this.scene.components, this.role);
    poolsInfo.forEach((poolInfo) => {
      const { type, capacity, balance } = poolInfo;
      switch (type) {
        case BLOOD:
          this.blood = balance;
          this.maxBlood = capacity;
          break;
        case STAMINA:
          this.stamina = balance;
          this.maxStamina = capacity;
          break;
        case SOUL:
          this.soul = balance;
          this.maxSoul = capacity;
          break;
        case ATTACK:
          this.attack = balance;
          this.maxAttack = capacity;
          break;
        case DEFENSE:
          this.defense = balance;
          this.maxDefense = capacity;
          break;
        case RANGE:
          this.range = balance;
          this.maxRange = capacity;
          break;
        default:
          break;
      }
    });
  }

  updateBagData() {
    const components = this.scene.components;
    const { Owner } = components;
    if (!this.role) return;
    // erc721
    this.erc721Entities = [
      ...runQuery([HasValue(Owner, { value: this.role })]),
    ];
    // erc20
    this.erc20Items = getERC20Balances(components, this.role as Hex).map(
      (item) => {
        return { type: item.erc20Type, amount: Number(item.balance) };
      }
    );
    // equipment
    this.equipments = getEntitiesInCustodian(components, this.role);
    console.log("erc721: ", this.erc721Entities);
    console.log("erc20: ", this.erc20Items);
    console.log("equipments: ", this.equipments);
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
    this.characterName.text = this.hostName;
  }

  /**
   * created in constructor(), to update data according to the query
   */
  createSystem() {
    const { Balance, EntityType, StoredSize } = this.scene.components;
    const { world } = this.scene.network;

    // update pool as long as the role is the same as the decoded entity
    defineSystem(world, [Has(Balance)], ({ entity, type }) => {
      if (type === UpdateType.Exit) return;
      const { owner } = decodeBalanceEntity(entity);
      if (!this.role || this.role !== (owner as Entity)) return;
      this.updateData();
      this.updateDisplay();
    });

    // update max pool, capacity, & size when entitType changes
    defineUpdateSystem(world, [Has(EntityType)], ({ entity }) => {
      if (!this.role || this.role !== entity) return;
      this.updateData();
      this.updateDisplay();
    });

    // update entity stored size
    defineUpdateSystem(world, [Has(StoredSize)], ({ entity }) => {
      if (!this.role || this.role !== entity) return;
      this.updateData();
      this.updateDisplay();
    });
  }

  createBagSystem() {
    const { StoredSize, Equipment } = this.scene.components;
    const { world } = this.scene.network;

    // erc721 & erc20; different from pools, which do not change StoredSize
    defineSystem(world, [Has(StoredSize)], () => {
      this.updateBagData();
      this.updateDisplay();
    });

    // equipment
    defineSystem(world, [Has(Equipment)], ({ entity, type }) => {
      const { owner } = decodeBalanceEntity(entity);
      if (!this.role || this.role !== (owner as Entity)) return;
      this.updateBagData();
      this.updateDisplay();
    });
  }
}
