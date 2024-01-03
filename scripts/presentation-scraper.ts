import * as cheerio from 'cheerio'
import fs from 'fs/promises'
import { parse, stringify } from 'yaml'
import type { Presentation } from '@yaml/presentation'
import path from 'path'
import https from 'https'

const user = 'mazrean'
const presentationYamlPath = './src/yaml/presentation.yaml'
const imageDirPath = './original/presentation'

const deckLinksPromise = (async () => {
  const res = await fetch(`https://speakerdeck.com/${user}`)
  const $ = cheerio.load(await res.text())
  return $('.deck-preview-link')
    .map((_, el) => {
      return `https://speakerdeck.com${$(el).attr('href')}`
    })
    .get()
    .reverse()
})()

const presentationPromise = (async () => {
  const presentationYaml = await fs.readFile(presentationYamlPath, 'utf8')
  return (parse(presentationYaml) as Presentation[]).reverse()
})()

const [deckLinks, presentations] = await Promise.all([
  deckLinksPromise,
  presentationPromise
])

/*
  スライドが見つからない場合、
  Speaker Deckの変更でスクレイピングが失敗した可能性が高いため、
  エラーとする
*/
if (deckLinks.length === 0) throw 'deckLinks is empty'

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
  /*
    Status Codeが200以外の場合、
    Speaker Deckの変更でスクレイピングが失敗した可能性が高いため、
    エラーとする
  */
  if (res.status !== 200)
    throw `Slide fetch error(${deckLink}): status ${res.status}`

  const $ = cheerio.load(await res.text())

  let title: string | undefined
  let imageRef: string | undefined
  for (const meta of $('head meta')) {
    const $meta = $(meta)

    const property = $meta.attr('property')
    const content = $meta.attr('content')
    if (!property || !content) continue

    if (property === 'og:title') {
      title = content
    } else if (property === 'og:image') {
      imageRef = content
    }
  }
  // タイトルと説明がない場合はスキップ
  if (!title) continue

  let date: string | undefined
  for (const time of $('.deck-date')) {
    const $time = $(time)

    const dateTime = new Date($time.text())

    const year = dateTime.getFullYear()
    const month = (dateTime.getMonth() + 1).toString().padStart(2, '0')
    const day = dateTime.getDate().toString().padStart(2, '0')

    date = `${year}/${month}/${day}`
    break
  }
  date = date ?? ''

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
  if (!imageRef && !embed) continue

  let image: string | undefined
  if (imageRef) {
    image = crypto.randomUUID()
    https.get(imageRef, async res => {
      await fs.writeFile(path.join(imageDirPath, `${image}.png`), res)
    })
  }

  if (embed) {
    const $ = cheerio.load(embed, null, false)

    const width = $('iframe').attr('width')
    const height = $('iframe').attr('height')
    if (width && height) {
      $('iframe').attr('width', '100%')
      $('iframe').attr('height', null)
      $('iframe').attr('style', `aspect-ratio: ${width} / ${height};`)

      embed = $.html() ?? embed
    }
  }

  presentations.push({
    title,
    tags: [],
    ref: deckLink,
    embed,
    image,
    date
  })
}

const presentationYaml = stringify(presentations.reverse(), { indent: 2 })
await fs.writeFile(presentationYamlPath, presentationYaml, 'utf8')
