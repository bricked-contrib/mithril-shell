import { BarWidget } from "../bar-widget.js";

const hyprland = await Service.import("hyprland");

const WorkspaceIndicator = (active = false) =>
  Widget.Box({
    className: `workspace-indicator${active ? " active" : ""}`,
  });

export const Workspaces = (monitor: number) =>
  BarWidget({
    child: Widget.Box({
      className: "workspaces",
      children: Utils.merge(
        [
          hyprland.bind("workspaces"),
          // TODO: this breaks when unplugging a monitor that is not the last monitor in the list.
          hyprland
            .bind("monitors")
            .as((monitors) => monitors[monitor].activeWorkspace),
        ],
        (workspaces, active) => {
          // Workspaces start with ID 1. It is limited to 25 to keep it reasonable should hyprland
          // return anything unexpected.
          const workspaces_num = Math.min(
            25,
            Math.max(...workspaces.map((workspace) => workspace.id)),
          );
          const children = new Array(workspaces_num);

          for (let i = 0; i < workspaces_num; i++) {
            const id = i + 1;
            children[i] = WorkspaceIndicator(id === active.id);
          }

          return children;
        },
      ),
    }),
    on_scroll_up: () => {
      hyprland.messageAsync("dispatch workspace +1");
    },
    on_scroll_down: () => {
      hyprland.messageAsync("dispatch workspace -1");
    },
  });
