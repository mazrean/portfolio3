import * as cheerio from 'cheerio'
import fs from 'fs/promises'
import { parse, stringify } from 'yaml'
import type { Presentation } from '@contents/types/presentation'

const user = 'mazrean'
const presentationYamlPath = './src/contents/presentation.yaml'

const deckLinksPromise = (async () => {
  const res = await fetch(`https://speakerdeck.com/${user}`)
  const $ = cheerio.load(await res.text())
  return $('.deck-preview-link')
    .map((_, el) => {
      return `https://speakerdeck.com${$(el).attr('href')}`
    })
    .get()
})()

const presentationPromise = (async () => {
  const presentationYaml = await fs.readFile(presentationYamlPath, 'utf8')
  return (parse(presentationYaml) as Presentation[]).reverse()
})()

const [deckLinks, presentations] = await Promise.all([
  deckLinksPromise,
  presentationPromise
])

const presentationMap = presentations.reduce(
  (acc, presentation) => {
    return { ...acc, [presentation.ref]: presentation }
  },
  {} as { [key: string]: Presentation }
)

for (const deckLink of deckLinks) {
  // 既に登録されている場合はスキップ
  if (presentationMap[deckLink]) continue

  const res = await fetch(deckLink)
  const $ = cheerio.load(await res.text())

  let title: string | undefined
  let image: string | undefined
  for (const meta of $('head meta')) {
    const $meta = $(meta)

    const property = $meta.attr('property')
    const content = $meta.attr('content')
    if (!property || !content) continue

    if (property === 'og:title') {
      title = content
    } else if (property === 'og:image') {
      image = content
    }
  }
  // タイトルと説明がない場合はスキップ
  if (!title) continue

  let embed: string | undefined
  for (const link of $('head link')) {
    const $link = $(link)

    const type = $link.attr('type')
    const href = $link.attr('href')
    if (!type || !href) continue

    switch (type) {
      // Speaker DeckのoEmbedは基本JSON
      case 'application/json+oembed': {
        const res = await fetch(href)
        const json: { html: string } = await res.json()
        embed = json.html
        break
      }
      // 念のためXMLも対応するが、基本使われないはず
      case 'text/xml+oembed': {
        const res = await fetch(href)
        const xml = await res.text()
        const $ = cheerio.load(xml, { xmlMode: true })
        embed = $('oembed html').text()
        break
      }
    }
  }

  // 画像も埋め込みもない場合はスキップ
  if (!image && !embed) continue

  presentations.push({
    title,
    tags: [],
    ref: deckLink,
    embed,
    image
  })
}

const presentationYaml = stringify(presentations.reverse(), { indent: 2 })
await fs.writeFile(presentationYamlPath, presentationYaml, 'utf8')
