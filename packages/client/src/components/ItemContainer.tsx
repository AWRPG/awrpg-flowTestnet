export type ItemContainerProps = {
  disabled?: boolean;
  selected?: boolean;
} & JSX.IntrinsicElements["div"];

export default function ItemContainer({
  className,
  disabled,
  selected,
  onClick,
  children,
  ...passProps
}: ItemContainerProps) {
  return (
    <div
      className={[
        "flex flex-col w-auto p-1 border cursor-pointer hover:text-info hover:border-info",
        disabled && selected
          ? "opacity-80 bg-gray-300 text-white"
          : disabled
            ? "opacity-80 bg-gray-300 text-gray-500 "
            : selected
              ? "bg-white text-black"
              : "",
        className ?? "",
      ].join(" ")}
      onClick={disabled ? undefined : onClick}
      {...passProps}
    >
      {children}
    </div>
  );
}
