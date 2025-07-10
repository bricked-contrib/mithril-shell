import type Gtk from "gi://Gtk?version=3.0";
import { config } from "lib/settings";
import { Variable } from "types/variable";
import { PopupWindow, showModal } from "window";

/**
 * Power menu that lists multiple power options.
 *
 * @param reveal - Variable that stores the reveal state of the power menu.
 */

export const PowerMenu = (params: {
  reveal: Variable<boolean>;
}) => {
  const entries = config.powerMenuEntries.map(({ label, command, confirmation }) =>
    Widget.Button({
      className: "entry",
      hexpand: true,
      child: Widget.Box({
        children: [
          Widget.Label({
            label: `${label}...`,
          }),
        ],
      }),
      async onClicked() {
        App.closeWindow("quicksettings");

        const confirmed = confirmation
          ? await showModal({
              title: label,
              description: confirmation,
              noOption: "Cancel",
              yesOption: label,
              emphasize: "no",
            })
          : true;

        if (confirmed) {
          await Utils.execAsync(command);
        }
      },
    }),
  );

  return Widget.Revealer({
    hexpand: false,
    transition: "slide_down",
    transitionDuration: 150,
    revealChild: params.reveal.bind(),
    child: Widget.Box({
      className: "power-menu",
      hexpand: true,
      vexpand: false,
      vertical: true,
      children: [
        Widget.Box({
          className: "title",
          children: [
            Widget.Icon({
              className: "icon",
              icon: "system-shutdown-symbolic",
              size: 20,
            }),
            Widget.Label({
              label: "Power Off",
            }),
          ],
        }),
        Widget.Box({
          className: "entries",
          vertical: true,
          children: entries,
        }),
      ],
    }),
  });
};
