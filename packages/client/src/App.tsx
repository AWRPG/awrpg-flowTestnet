import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import useSyncComputedComponents from "./hooks/useSyncComputedComponents";

export const App = () => {
  useSyncComputedComponents();
  const {
    components: { Counter },
    systemCalls: { increment },
  } = useMUD();

  const counter = useComponentValue(Counter, singletonEntity);

  return (
    <div className="absolute h-full w-full text-white">
      <div className="">
        Counter: <span>{counter?.value ?? "??"}</span>
      </div>
      <button
        className="btn btn-success border"
        onClick={async (event) => {
          event.preventDefault();
          console.log("new counter value:", await increment());
        }}
      >
        Increment
      </button>
    </div>
  );
};
