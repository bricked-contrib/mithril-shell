/** @param {import("types/widgets/button").ButtonProps} props */
export const BarWidget = (props) => {
  const { child, ...otherProps } = props;

  return Widget.Button({
    className: "bar-widget",
    child,
    ...otherProps,
  });
};
