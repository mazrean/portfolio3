import Iconify from "@iconify/iconify";
import { getIconData, iconToSVG } from "@iconify/utils";
import { importDirectory } from "@iconify/tools";

const localCollection = (
  await importDirectory("src/icons", {
    prefix: "local",
  })
).export();

export const getIconSvg = async (icon: string) => {
  let iconData = getIconData(localCollection, icon);
  if (!iconData) {
    iconData = await Iconify.loadIcon(icon);
    if (!iconData) throw new Error(`Icon ${icon} not found`);
  }

  return iconToSVG(iconData);
};
