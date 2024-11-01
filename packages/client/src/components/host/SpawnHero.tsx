import { useState } from "react";
import { Hex } from "viem";
import { useMUD } from "../../MUDContext";

export function SpawnHero() {
  const { components, systemCalls } = useMUD();

  const [name, setName] = useState<string>("");

  return (
    <div className="flex flex-row space-x-">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter hero name"
      />
      <button className="btn-blue" onClick={() => systemCalls.spawnHero(name)}>
        Spawn New Hero
      </button>
    </div>
  );
}
