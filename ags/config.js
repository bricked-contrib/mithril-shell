import { Quicksettings } from './quicksettings/quicksettings.js';
import { Bar } from './bar/bar.js';
import Gdk from "gi://Gdk"

const scss = `${App.configDir}/style.scss`
const css = `/tmp/__ags-style.css`

Utils.exec(`sassc ${scss} ${css}`)

/**
 * @callback forMonitorsCallback
 * @param {number} monitor
 */
/** @param {forMonitorsCallback} widget */
export function forMonitors(widget) {
    const n = Gdk.Display.get_default()?.get_n_monitors() || 1
    return Array.from({ length: n }, (_, i) => i).flatMap(widget)
}

App.config({
  style: css,
  windows: [
    ...forMonitors(Bar),
    Quicksettings(),
  ],
})
