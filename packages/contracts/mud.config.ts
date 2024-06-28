import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  // namespace: "app",
  systems: {
    Errors: {
      name: "Errors",
      openAccess: false,
      accessList: [],
    },
  },
  tables: {
    Counter: {
      schema: {
        entityType: "bytes16",
        value: "uint256",
      },
      key: ["entityType"],
    },
    Approval: "bytes32",
    Allowance: {
      schema: {
        entityType: "bytes16",
        owner: "bytes32",
        spender: "bytes32",
        value: "uint256",
      },
      key: ["entityType", "owner", "spender"],
    },
    Balance: {
      schema: {
        entityType: "bytes16",
        owner: "bytes32",
        value: "uint256",
      },
      key: ["entityType", "owner"],
    },
    TotalSupply: {
      schema: {
        entityType: "bytes16",
        value: "uint256",
      },
      key: ["entityType"],
    },
    StoredSize: "uint256",
    // building & host -> player
    Commander: "bytes32",
    // -> building & host
    Owner: "bytes32",
    EntityType: "bytes16",
    // building & host
    Position: {
      schema: {
        entityId: "bytes32",
        x: "uint32",
        y: "uint32",
      },
      key: ["entityId"],
    },
    // ----- terrain & map -----
    // if true, not obstacle, can build, can move onto if no building
    // coordId ->
    RemovedCoord: "bool",
    // coordId -> buildingId
    BuildingCoord: "bytes32",
    // entity types: terrain, building, host, food, material
    // terrain: when destoryed, award destroyer; 0 means cannot be destroyed
    // default is change to GRASS
    TerrainSpecs: {
      schema: {
        terrainType: "bytes16",
        canMove: "bool",
        canBurn: "bool",
      },
      key: ["terrainType"],
    },
    // for all building group
    BuildingSpecs: {
      schema: {
        buildingType: "bytes16",
        canMove: "bool",
        terrainType: "bytes16",
      },
      key: ["buildingType"],
    },
    // all erc20 & erc721 has size
    SizeSpecs: {
      schema: {
        entityType: "bytes16",
        size: "uint128",
      },
      key: ["entityType"],
    },
    //
    ContainerSpecs: {
      schema: {
        entityType: "bytes16",
        capacity: "uint256",
      },
      key: ["entityType"],
    },
    // stamina -> soul/blood
    ConvertRatio: {
      schema: {
        fromType: "bytes16",
        toType: "bytes16",
        num: "uint8",
        denom: "uint8",
      },
      key: ["fromType", "toType"],
    },
    // building/item
    MintCosts: {
      schema: {
        mintType: "bytes16", // erc721
        // 1st 16 bytes type, 2nd 16 amount
        costs: "bytes32[]",
      },
      key: ["mintType"],
    },
    // building/item
    UpgradeCosts: {
      schema: {
        fromType: "bytes16", // erc721
        toType: "bytes16", // erc721
        costs: "bytes32[]",
      },
      key: ["fromType"],
    },
    // terrain/building
    BurnCosts: {
      schema: {
        burnType: "bytes16", // erc721
        costs: "bytes32[]",
      },
      key: ["burnType"],
    },
    // terrain/building/host
    BurnAwards: {
      schema: {
        burnType: "bytes16", //erc20 or erc721
        awards: "bytes32[]",
      },
      key: ["burnType"],
    },
    // terrain
    InteractCosts: {
      schema: {
        interactType: "bytes16", //erc721?
        costs: "bytes32[]",
      },
      key: ["interactType"],
    },
    InteractAwards: {
      schema: {
        interactType: "bytes16", //erc20 or erc721
        awards: "bytes32[]",
      },
      key: ["interactType"],
    },

    // destroyable: building, host, terrain
    // Destroy stuff, award erc20s or erc721
  },
});
