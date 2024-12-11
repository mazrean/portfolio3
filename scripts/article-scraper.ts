import type { Article } from '@yaml/article'
import * as cheerio from 'cheerio'
import fs from 'fs/promises'
import { parse, stringify } from 'yaml'
import path from 'path'
import https from 'https'

const articleYamlPath = './src/yaml/article.yaml'
const imageDirPath = './original/article'

const rssList = [
  'https://zenn.dev/mazrean/feed',
  'https://trap.jp/author/mazrean/rss/',
  'https://engineering.dena.com/blog/authors/shunsuke-wakamatsu/index.xml',
  'https://qiita.com/mazrean/feed'
]

const rssPromises = rssList.map(async rss =>
  (async () => {
    const res = await fetch(rss)
    const $ = cheerio.load(await res.text(), { xmlMode: true })
    const rssItems = $('item')
      .map((_, el) => {
        return {
          title: $(el).find('title').text(),
          link: $(el).find('link').text(),
          pubDate: $(el).find('pubDate').text()
        }
      })
      .get()
      .reverse()
    const atomItems = $('entry')
      .map((_, el) => {
        return {
          title: $(el).find('title').text(),
          link: $(el).find('link').attr('href') ?? $(el).find('url').text(),
          pubDate: $(el).find('published').text()
        }
      })
      .get()
      .reverse()
    return [...rssItems, ...atomItems]
  })()
)

const articlePromise = (async () => {
  const articleYaml = await fs.readFile(articleYamlPath, 'utf8')
  return (parse(articleYaml) as Article[]).reverse()
})()

const [rssDataList, articles] = await Promise.all([
  Promise.all(rssPromises),
  articlePromise
])

const articleMap = articles.reduce(
  (acc, article) => {
    return { ...acc, [article.ref]: article }
  },
  {} as { [key: string]: Article }
)

const newArticles: Article[] = []
for (const rssData of rssDataList.flat()) {
  // 既に登録されている場合はスキップ
  if (articleMap[rssData.link]) continue

  const res = await fetch(rssData.link)
  /*
    Status Codeが200以外の場合、
    Speaker Deckの変更でスクレイピングが失敗した可能性が高いため、
    エラーとする
  */
  if (res.status !== 200)
    throw `Slide fetch error(${rssData.link}): status ${res.status}`

  const $ = cheerio.load(await res.text())

  let image: string | undefined
  for (const meta of $('head meta')) {
    const $meta = $(meta)

    const property = $meta.attr('property')
    const content = $meta.attr('content')
    if (!property || !content) continue

    if (property === 'og:image') {
      image = crypto.randomUUID()
      https.get(content, async res => {
        await fs.writeFile(path.join(imageDirPath, `${image}.png`), res)
      })
    }
  }
  if (!image) {
    // eslint-disable-next-line no-console
    console.warn(`Image not found(${rssData.link})`)
    continue
  }

  const dateTime = new Date(rssData.pubDate)

  const year = dateTime.getFullYear()
  const month = (dateTime.getMonth() + 1).toString().padStart(2, '0')
  const day = dateTime.getDate().toString().padStart(2, '0')

  const date = `${year}/${month}/${day}`

  const newArticle = {
    title: rssData.title,
    tags: [],
    ref: rssData.link,
    date,
    image,
    ignore: false
  }
  articles.push(newArticle)
  newArticles.push(newArticle)
}

if (newArticles.length > 0) {
  process.stdout.write('# New Articles\n')
  for (const newArticle of newArticles) {
    process.stdout.write(`- [${newArticle.title}](${newArticle.ref})\n`)
  }
}

const articleYaml = stringify(articles.reverse(), { indent: 2 })
await fs.writeFile(articleYamlPath, articleYaml, 'utf8')
