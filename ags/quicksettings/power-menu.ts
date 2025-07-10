import type Gtk from "gi://Gtk?version=3.0";
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
          children: [
            Widget.Button({
              className: "entry",
              hexpand: true,
              child: Widget.Box({
                children: [
                  Widget.Label({
                    label: "Restart...",
                  }),
                ],
              }),
              async onClicked() {
                App.closeWindow("quicksettings");

                const shutdown = await showModal({
                  title: "Restart",
                  description: "Are you sure you want to restart the computer?",
                  noOption: "Cancel",
                  yesOption: "Restart",
                  emphasize: "no",
                });

                if (shutdown) {
                  await Utils.execAsync("reboot");
                }
              },
            }),
            Widget.Button({
              className: "entry",
              hexpand: true,
              child: Widget.Box({
                children: [
                  Widget.Label({
                    label: "Power Off...",
                  }),
                ],
              }),
              async onClicked() {
                App.closeWindow("quicksettings");

                const shutdown = await showModal({
                  title: "Power Off",
                  description: "Are you sure you want to power off the computer?",
                  noOption: "Cancel",
                  yesOption: "Power Off",
                  emphasize: "no",
                });

                if (shutdown) {
                  await Utils.execAsync("shutdown now");
                }
              },
            }),
            Widget.Button({
              className: "entry",
              hexpand: true,
              child: Widget.Box({
                children: [
                  Widget.Label({
                    label: "Log Out...",
                  }),
                ],
              }),
              async onClicked() {
                App.closeWindow("quicksettings");

                const shutdown = await showModal({
                  title: "Log Out",
                  description: "Are you sure you want log out of this session?",
                  noOption: "Cancel",
                  yesOption: "Log Out",
                  emphasize: "no",
                });

                if (shutdown) {
                  await Utils.execAsync("uwsm stop");
                }
              },
            }),
          ],
        }),
      ],
    }),
  });
};
