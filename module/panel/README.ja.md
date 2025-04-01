[![npm version](https://badge.fury.io/js/mrdamian-plugin-panel.svg)](https://badge.fury.io/js/mrdamian-plugin-panel)
[![code style: biome](https://img.shields.io/badge/code_style-biome-ff69b4.svg?style=flat-square)](https://github.com/biomejs/biome)

# mrdamian-plugin-panel

mrdamian-plugin-panelはパネルを表示してMrDamianのパイプライン動作を操作できるようにするプラグインです。

## Table of contents

- [Project Name](#project-name)
  - [Table of contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [Built With](#built-with)
  - [Versioning](#versioning)
  - [Authors](#authors)
  - [License](#license)

## Prerequisites

- [MrDamian](https://github.com/yuniruyuni/mrdamian) をインストールしてください

## Installation

1. Mr.Damianのプラグイン画面でインストールしてください。
2. Mr.Damianのモジュール設定ファイルに設定を書き込んでください。
3. するとMr.Damianの管理画面上にパネルが表示されるようになります✨️
4. サブモジュールから利用する場合は、利用者にこのプラグインのインストールを促してください。

## Usage

以下のような設定を書き込むことでパネルを表示することができます。

```json5
{
  pipeline: [
    {
      // panelのdefault actionはパネルの表示を行う本体を定義します。
      // define actionを行うことでこのpanelに対して任意のpanel groupを差し込むことができる。
      // これはsubmodule側でinheritして、新しいpanel groupを差し込むことを想定しています。
      type: "panel",
    },
    {
      type: "panel",
      // パネルの内容物はdefine actionで定義します。
      action: "define",
      // グループ名。panelでemit/dischargeされる値は名前のkeyの中に入ります。
      group: "shoutout",
      args: {
        forms: [
          {
            // いくつかの状態を推移するSelectボタンを設定できます
            type: "select",
            name: "auto_shoutout",
            // クリックごとに、statesに定義された状態に順番に切り替わります。
            // statesのうち一番上の項目が初期状態です。再起動すると初期状態に戻ります。
            states: [
              {
                // ボタン上に表示するテキスト
                text: "auto shoutout on",
                // この状態で表示するボタンの色。以下のいずれかを指定してください。
                // - "base", "active", "inactive", "info", "warning", "danger" のいずれか
                // -`#FFFFFF` のような16進数表記
                // 省略した場合 "base" になります。
                color: "active",
                // この状態のときに discharge する値
                value: true,
              },
              {
                text: "auto shoutout off",
                color: "inactive",
                value: false,
              },
            ],
          },
          {
            // ボタン。クリックごとにイベントがemitされる。
            // イベントには name で指定したキーの値に true が乗る。
            // つまりこの場合は { panel: { shoutout: true } } がemitされる。
            type: "button",
            name: "shoutout",
            text: "Send shoutout"
          },
        ],
      },
    },
    {
      // たとえば実行ごとにカウントアップするだけのコンポネントがあったとする
      // ここでは仮にtwitch.messageが来るたびにカウントアップするとしよう
      when: "twitch.message",
      type: "count",
      name: "message",
    },
    {
      // メッセージが来るたびに再定義が走るのでreactiveに表示できる。
      when: "twitch.main.message",
      type: "panel",
      action: "define",
      group: "message",
      args: {
        forms: [
          {
            type: "label",
            name: "latest",
            // このようにjexprの展開した結果でcomponentの値を更新することができる
            text: "$ message.name + ': ' + message.text",
          },
          {
            type: "label",
            name: "count",
            text: "$ 'total: ' + count",
          },
        ]
      },
    },
  ]
}
```

## Contributing

ごめんなさい。このモジュールはモジュール構造を検討するPoC段階なので現在コントリビュートは受け付けていません。
ただし、検討が終わった後にコントリビュートに関する追加情報を提供します。

## Versioning

[SemVer](http://semver.org/) をバージョニングに用いています。
新バージョンのリリースを行う場合は `package.json` のバージョンを変更してください。
自動的に[Github Action](./.github/workflows/release.yaml)が起動して、npmに新しいバージョンをリリースします。

## Authors

* **Yuniru Yuni** - *Initial work* - [yuniruyuni](https://github.com/yuniruyuni)

## License

[MIT License](https://andreasonny.mit-license.org/2019) © Yuniru Yuni