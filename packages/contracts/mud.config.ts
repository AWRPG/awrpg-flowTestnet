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
        value: "uint32",
      },
      key: [],
    },
    EntityType: {
      schema: {
        entityType: "bytes16",
        value: "bytes32",
      },
      key: ["entityType"],
    },
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
