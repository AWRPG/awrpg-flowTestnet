export interface BuildingData {
  id: number;
  type: string;
  name: string;
  img: string;
  sceneImg: string;
}

export interface BuildingSpecs {
  width: number;
  height: number;
  canMove: boolean;
  terrainType: Hex;
}
