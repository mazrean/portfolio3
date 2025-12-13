import { getIconData, iconToSVG } from '@iconify/utils'
import { importDirectory } from '@iconify/tools'

const localCollection = (
  await importDirectory('src/icons', {
    prefix: 'local'
  })
).export()

// Cache for loaded icon sets
const iconSets = new Map()

async function loadIconSet(collection: string) {
  if (iconSets.has(collection)) {
    return iconSets.get(collection)
  }
  
  try {
    // Try to load the icon set from @iconify-json/*
    const iconSet = await import(`@iconify-json/${collection}`)
    iconSets.set(collection, iconSet.icons)
    return iconSet.icons
  } catch {
    return null
  }
}

export const getIconSvg = async (icon: string) => {
  let iconData = getIconData(localCollection, icon)
  if (iconData) {
    return iconToSVG(iconData)
  }

  // Try to load from installed icon sets
  const [collection, iconName] = icon.split(':')
  if (collection && iconName) {
    const iconSet = await loadIconSet(collection)
    if (iconSet) {
      iconData = getIconData(iconSet, iconName)
      if (iconData) {
        return iconToSVG(iconData)
      }
    }
  }
  
  throw new Error(`Icon ${icon} not found`)
}
