---
title: Sapper+Vercel+Forestryでポートフォリオにブログ機能をつけた
isPublish: true
publishDate: 2021-04-30
tags:
- Svelte
- Vercel
- Sapper

---
このポートフォリオにブログ機能をつけました。実は機能自体は今年1月時点でついていたのですが、CMSを設定しておらず書くのが面倒だったため、ずっとno itemsで放置してしまっていました(おい)。今回CMSとしてForestryを設定してまともにブログとして使えるようにして、初めての記事を書いています。

# 技術選定

もともとポートフォリオはSapperを用いて作っていたため、ベースがSapperとするのは決めていました。そのため、ここではそれ以外のもの、具体的には

* markdownパーサー
* デプロイ先
* CMS

を選ぶ際に考えたことを書いていきます。

## markdownパーサー

真っ先に考えたのはtraPで使っているチャットtraQが使っている[markdown-it](https://github.com/markdown-it/markdown-it)でした。こちらを使えば

* traQで使い慣れた記法がそのまま使える
* 使った経験があるため、実装が楽

というメリットがありました。しかし、今回は[remark](https://github.com/remarkjs/remark)を使用しました。remarkはmarkdownを抽象構文木へ変換後、markdownの抽象構文木からhtmlの抽象構文木へ変換しhtmlとするという、抽象構文木を利用する変換方法が特徴のmarkdownパーサーです。変換の過程に様々なプラグインを入れることで　markdownを容易に拡張できます。今回は

* 拡張の容易さ
* せっかくの機会なので普段使っていないものに触りたい

という2つの考えから、markdownパーサーとしてremarkを利用することにしました。

このブログで指しているプラグインは https://github.com/mazrean/portfolio2/blob/eec04ee40b/parser/md-parser.ts#L13-L18 で、GitHubで使えるMarkdown記法に加え、$\KaTeX$や脚注が使えるようになっています。

## デプロイ先

ポートフォリオ自体は当初[Netlify](https://www.netlify.com/)にデプロイしていました。しかし、Netlifyは日本国内にサーバーを持たないため、日本からのリクエストに対するレスポンスの速度が非常に遅くなってしまっていました。そこで、ブログ機能をつける際にデプロイ先を日本国内にサーバーを持つ[Vercel](https://vercel.com/)に変更しました。これによって、大幅に応答速度が速くなり表示までの速度が改善されました。

## CMS

上記のデプロイ先で述べたとおり、当初はNetlifyにデプロイしていたため相性の良いNetlify CMSを用いる予定でした。しかし、デプロイ先をVercelに変更したことでこのメリットが消え、他のCMSも検討してみました。

まず、CMSにはAPI型とGit型というのがあります。

API型はCMSの提供したAPIからコンテンツを取得して、フロントエンドで表示を行う形です。CMSがWebアプリケーションのバックエンドの役割をしてくれるイメージだと思います。CMSはAPIを提供するだけなので複数アプリケーションで同一のコンテンツを使う場合に対応しやすいのが利点です。

一方、Git型はCMSで変更を加えるとその変更がGitにpushされ、何らかの方法でデプロイをすることで反映される、というものです。API型がバックエンドを提供するのに対して、こちらはフロントに組み込まれるイメージな気がします。こちらの場合、リポジトリにpushされるためバージョン管理が楽である、というメリットがあるようです。

今回は

* 複数アプリケーションでブログの内容を使う予定はない
* Git型のNetlify CMSを使う想定で実装していたため、API型への対応が大変

ということを鑑みて、Git型に絞りました。

Git型のCMSの中でそれなりに人気があるのは Netlify CMS、Forestryの2つのようでした。これは個人的な印象ですが、Netlify CMSもForestryも提供している機能は大きく変わらないと思います。しかし、Netlify CMSはNetlifyが静的配信でよく使われているために使われており、対して、ForestryはUIが良く使いやすいため使う人が増えているように思えました。

このようなことから、Netlifyを使わない今回のブログではより使いやすそうなForestryを選びました。

# 実装

このポートフォリオのリポジトリは https://github.com/mazrean/portfolio2 です。アプリケーション側の実装は https://n-ari.tech/blog/2020-02-06-create-portfolio-and-blog-with-sapper-and-netlify-cms とそのGitHubリポジトリを参考にさせていただきました。記事から変更した点は

* TypeScript化
* markdownパーサーをmarkedからremarkへ

程度です。Forestryの設定は、公式のチュートリアルに乗っていけば基本的に問題ありません。ただ、ForestryはSapperのテンプレートがないので、Previewのコマンドなどは基本的に自分で設定していく必要があるのは注意が必要です。

# 気になっている点

現時点でこの構成で気になっている点がいくつかあるので書いていきます。

## コミットログが荒れる

下記の画像のように、Forestryはsaveの度に新しいcommitを打ちます。そのため、普通に使っているとコミットログが荒れてしまい、開発のコミットが押し流されてしまいます。

![](/blog/image/2021-04-29-2021-04-29-20-43-58.webp)

## footnoteのワークアラウンド

https://github.com/sveltejs/sapper/issues/904 でもあげられている通り、Sapperでは`<basehef="/">`が必須であるため、フラグメント識別子(`#`)がそのままリンクを`#hoge`のように指定すると`/#hoge`に飛んでしまい正常に機能しません。リンクを表示時に書き換えるという黒魔術が必要になるのですが、markdownをパースしたブログ記事がhtmlのDOMに入るのはonMountの後なので https://github.com/sveltejs/sapper/issues/904#issuecomment-532975259 の通りではfootnoteのリンクの修正ではうまくいきません。

```js
onMount(() => {
  setTimeout(() => {
    document.querySelectorAll('a[href^="#"]').forEach(
      (x: HTMLAnchorElement) => {
        x.href = document.location.pathname + new URL(x.href).hash
      }
    )
  })
})
```

というようにtimeoutで送らせてurlの書き換えを行うという暫定対処をしています。当然これではmountから1秒以内にmarkdownがレンダリングされなければリンクが壊れるので、いずれ綺麗な対応をしたいです[^1]。

# 感想

クライアントを触るのがかなり久しぶりだったので、主にfootnoteのあたりで苦しみましたが、Svelte自体はだいぶ書きやすかったように感じました。また、今後Sapperの後継としてSvelteKitが出るそうなので、安定したらそちらに切り替えるのもやってみたいと考えています[^2]。また、自分はtraP内でRSS購読Botを開発し運用しているため、RSS機能をつけてtraPの部内チャットtraQに記事の更新を流したいという野望もあったりします。

今後も機能追加をしていきたいと考えているのでお楽しみに。

[^1]: そもそもこのようなワークアラウンドをしたくないというのはありますが…

[^2]: footnoteのワークアラウンドが必要なくなるのも願っています…
