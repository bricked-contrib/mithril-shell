import { type ButtonProps } from "types/widgets/button";

export const BarWidget = (props: ButtonProps) => {
  const { child, ...otherProps } = props;

  return Widget.Button({
    className: "bar-widget",
    child,
    ...otherProps,
  });
};
