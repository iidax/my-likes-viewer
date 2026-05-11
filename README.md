# My Likes Viewer

X(旧Twitter)の "いいね" を一覧表示するWebアプリ


## 必要なもの

- 「Xのデータのアーカイブ」

## 配置

```
data/
├── twitter-2026-05-11-***/        # 自分のXのデータのアーカイブ
│   ├── assets/
│   ├── data/
│   │   └── likes.js
│   └── Yout archive.html          # 公式のビューワ
│
├── .gitignore
└── README.md
```


## 要件

アーカイブに同梱されているビューワー（HTML）では、likes.jsを動的に読み込んでいないため、「いいね」を確認することができない。
一方で、likes.jsには過去の「いいね」の情報が全て詰まっている。

本アプリは、likes.jsを読み込んで、時期を指定して「いいね」を表示することを目指す。


### インターフェース
- ユーザーは`likes.js`をアップロードする
- 初期状態は「最新」10件を表示する
- ユーザーは`from:YYYY/MM/DD` を指定することができ、10件のみのページネーションを表示する。（大量取得を避けるため）
- ページを移動するたびに、APIを叩いてデータを取得する。
- 何度も同じページに移動した場合は、APIを叩かずにキャッシュされたデータを表示する。



### 不明点・考慮

- 「いいね」を取得するとき、XのAPIアクセス制限に引っかかるかもしれないので、大量取得は避ける。


## データの構造

```js
// data/likes.js
window.YTD.like.part0 = [
  {
    "like" : {
      "tweetId" : "2053399644437442622",
      "fullText" : "─────•✦•─────\n\n   TVアニメ連動4コマ漫画\n　 　  ニディガぷらす\n\n─────•✦•─────\n\n🎀第6話公開🎀\n#こかむも（@kokakimumose）\n\n毎週日曜18:00更新⏰\nhttps://t.co/T3C2bQAEin\n\n#ニディガ https://t.co/GxWetV7A1i",
      "expandedUrl" : "https://twitter.com/i/web/status/2053399644437442622"
    }
  },
  ...
]

```

## 前提

- nodejs: v24.x系
- sqlite3
- typescript




