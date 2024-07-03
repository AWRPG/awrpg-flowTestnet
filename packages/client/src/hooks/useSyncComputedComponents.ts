import { useComponentValue } from "@latticexyz/react";
import { SyncStep } from "@latticexyz/store-sync";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect, useState } from "react";
import { useMUD } from "../MUDContext";
import { syncComputedComponents } from "../mud/syncComputedComponents";
import { SOURCE } from "../constants";

export default function useSyncComputedComponents() {
  const mud = useMUD();
  const {
    components: { SyncProgress, SelectedHost, Position },
  } = mud;

  const role = useComponentValue(SelectedHost, SOURCE)?.value;
  const position = useComponentValue(Position, role);
  // const moves = useComponentValue(Moves, role);

  const syncProgress = useComponentValue(SyncProgress, singletonEntity);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (syncProgress?.step === SyncStep.LIVE) {
      syncComputedComponents(mud);
      setReady(true);
    }
  }, [syncProgress?.step, role, position]);

  return ready;
}
