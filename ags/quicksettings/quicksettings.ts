import { config } from "lib/settings";
import type { Icon } from "lib/types";
import type { Binding } from "types/service";
import { PopupWindow, showModal } from "window";
import { Sliders } from "./sliders";
import { Toggles } from "./toggles";

const battery = await Service.import("battery");
const hyprland = await Service.import("hyprland");
const powerMenuVisible = Variable(false);

/** Constructor for the top buttons in the quicksettings menu. */
const Button = (props: {
  onClick?: () => void;
  icon: Icon;
  label?: string | Binding<any, any, string>;
}) => {
  const children: any[] = [
    Widget.Icon({
      icon: props.icon,
    }),
  ];

  if (props.label) {
    children.push(
      Widget.Label({
        label: props.label,
      }),
    );
  }

  return Widget.Button({
    onClicked: props.onClick ?? (() => {}),
    className: "button",
    child: Widget.Box({
      children,
    }),
  });
};

export const Quicksettings = () => {
  // Used to take a screenshot without including the quicksettings menu.
  const opacity = Variable(1.0);

  const top_button_battery = Button({
    icon: battery.bind("icon_name"),
    label: battery.bind("percent").as((percent) => ` ${percent}%`),
    onClick() {
      Utils.execAsync("mithril-control-center power");
      App.closeWindow("quicksettings");
    },
  });

  const top_buttons = [
    Button({
      icon: "applets-screenshooter-symbolic",
      async onClick() {
        const monitor_id = hyprland.active.monitor;
        const monitor_name = hyprland.getMonitor(monitor_id.id)?.name;

        opacity.value = 0.0;
        // Ensure the quicksettings window is actually invisible when screenshotting.
        App.getWindow("quicksettings")?.queue_draw();
        await new Promise((r) => setTimeout(r, 10));

        await Utils.execAsync(`bash -c "grim -o ${monitor_name} /tmp/_screenshot"`);

        Utils.execAsync(`bash -c "wl-copy < /tmp/_screenshot"`);
        Utils.execAsync(
          `notify-send -a System "Screenshot captured" "You can paste the image from your clipboard." -i /tmp/_screenshot`,
        );

        opacity.value = 1.0;
        App.closeWindow("quicksettings");
      },
    }),
    Button({
      icon: "settings-symbolic",
      onClick() {
        Utils.execAsync("mithril-control-center");
        App.closeWindow("quicksettings");
      },
    }),
    Button({
      icon: "system-lock-screen-symbolic",
      onClick() {
        App.closeWindow("quicksettings");

        if (config.lockCommand === null) {
          Utils.execAsync(`notify-send -a System "Unable to lock" "No lock command configured."`);
          return;
        }

        Utils.execAsync(config.lockCommand);
      },
    }),
    Button({
      icon: "system-shutdown-symbolic",
      async onClick() {
        powerMenuVisible.value = !powerMenuVisible.value;
      },
    }),
  ];

  return PopupWindow({
    name: "quicksettings",
    location: "top-right",
    child: Widget.Box({
      opacity: opacity.bind(),
      className: "quicksettings popup",
      vertical: true,
      hexpand: false,
      vexpand: false,
      children: [
        Widget.CenterBox({
          className: "button-row",
          vertical: false,
          startWidget: Widget.Box({
            hpack: "start",
            children: battery.available
              ? [top_button_battery]
              : top_buttons.slice(0, top_buttons.length / 2),
          }),
          endWidget: Widget.Box({
            hpack: "end",
            children: battery.available ? top_buttons : top_buttons.slice(top_buttons.length / 2),
          }),
        }),

        PowerMenu(),

        Sliders(),

        Toggles(),
      ],
    }),
    setup(self) {
      self.hook(
        App,
        () => {
          powerMenuVisible.value = false;
        },
        "window-toggled",
      );
    },
  });
};

const PowerMenu = () => {
  return Widget.Revealer({
    hexpand: false,
    transition: "slide_down",
    transitionDuration: 150,
    revealChild: powerMenuVisible.bind(),
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
