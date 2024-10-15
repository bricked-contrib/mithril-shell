import { type Binding } from "types/service";

import GdkPixbuf from "gi://GdkPixbuf";

export type __Ico = string | GdkPixbuf.Pixbuf;
export type Icon = __Ico | Binding<any, any, NonNullable<__Ico | undefined>> | undefined
