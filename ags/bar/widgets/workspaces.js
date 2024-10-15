import { BarWidget } from "../bar-widget.js";

const hyprland = await Service.import("hyprland");

/** @param {Boolean} active */
const workspaceIndicator = (active = false) => Widget.Box({
  className: "workspace-indicator" + (active ? " active" : ""),
});

export const Workspaces = () => BarWidget({
  child: Widget.Box({
    className: "workspaces",
    children: Utils.merge(
      [hyprland.bind("workspaces"), hyprland.active.bind("workspace")],
      (workspaces, active) => {
        return workspaces
          .sort((a, b) => a.id - b.id)
          .map((workspace) => workspaceIndicator(workspace.id == active.id));
      },
    ),
  }),
  on_primary_click: () => {
    hyprland.messageAsync("dispatch overview:toggle");
  },
  on_scroll_up: () => {
    hyprland.messageAsync("dispatch workspace +1");
  },
  on_scroll_down: () => {
    hyprland.messageAsync("dispatch workspace -1");
  },
})
