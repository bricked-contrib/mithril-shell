export const Quicksettings = () => Widget.Window({
  visible: false,
  name: "quicksettings",
  className: "quicksettings",
  anchor: ['top', 'right'],
  layer: "top",
  exclusivity: "exclusive",
  setup: w => w.keybind("Escape", () => App.closeWindow("quicksettings")),
  child: Widget.Box({
    vertical: true,
    children: [
      Widget.Label("test!"),
    ],
  }),
});
