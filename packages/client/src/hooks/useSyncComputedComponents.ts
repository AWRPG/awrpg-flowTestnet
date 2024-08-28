import { useComponentValue } from "@latticexyz/react";
import { SyncStep } from "@latticexyz/store-sync";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect, useState } from "react";
import { useMUD } from "../MUDContext";
import { syncComputedComponents } from "../mud/syncComputedComponents";
import { SOURCE } from "../constants";
import { Entity } from "@latticexyz/recs";

export default function useSyncComputedComponents() {
  const mud = useMUD();
  const {
    components: { SyncProgress, SelectedHost, Path, TargetTile },
  } = mud;

  const role = useComponentValue(SelectedHost, SOURCE)?.value as Entity;
  const path = useComponentValue(Path, role);
  const targetCoordId = useComponentValue(TargetTile, role)?.value as Entity;

  const syncProgress = useComponentValue(SyncProgress, singletonEntity);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (syncProgress?.step === SyncStep.LIVE) {
      syncComputedComponents(mud);
      setReady(true);
    }
  }, [syncProgress?.step, role, path, targetCoordId]);

  return ready;
}
