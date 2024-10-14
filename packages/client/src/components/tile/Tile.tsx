import { Entity } from "@latticexyz/recs";
import { useComponentValue } from "@latticexyz/react";
import { SOURCE } from "../../constants";
import { useMUD } from "../../MUDContext";
import { useEntityOnTile } from "../../logics/entity";
import EntityName from "../EntityName";
import { Role } from "../host/Role";
import { Drop } from "./Drop";
import { SetTerrains } from "./SetTerrains";

/**
 * display tile's info, 1) set terrains button, 2) entity on the tile, 3) drop container, 4) buildable
 */
export function Tile({ tile }: { tile: Entity }) {
  const { components } = useMUD();
  const { SelectedHost } = components;
  const sourceHost = useComponentValue(SelectedHost, SOURCE)?.value;
  const entity = useEntityOnTile(components, tile);

  return (
    <div className="flex flex-col space-y-3 w-96 bg-white">
      {entity && <Host host={entity} />}
      <Drop tile={tile} />
    </div>
  );
}

// building
// role
// mining

// buildable
