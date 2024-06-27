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
        awardType: "bytes16",
        awardAmount: "uint32",
      },
      key: ["terrainType"],
    },
    BuildingSpecs: {
      schema: {
        buildingType: "bytes16",
        canMove: "bool",
        awardType: "bytes16",
        awardAmount: "uint32",
      },
      key: ["buildingType"],
    },
  },
});
