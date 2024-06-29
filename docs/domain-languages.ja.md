# ドメイン用語集

## Plugin
- Pluginは、Mr.Damianの機能を拡張するためのプラグイン。
- `mrdamian-plugin-` という接頭辞を持ったnpm packageとして公開されている
- 1つのPluginには、1つのModuleつだけが入っている。

## Module
- Moduleは、ModuleParametersとPiplineを持ったオブジェクト。

### MainModule
- MainModuleは、Mr.Damianの全体で最初に呼び出されるModule。

## Pipeline
- パイプラインは、複数のComponentを組み合わせて構成される。
    - `Pipeline = Component[]`

## Component
- Componentは、パイプラインの最小単位。
- システム側で事前いろいろな種類のものが定義されている。
- "when" というフィールドがある場合、そのComponentが実行されるのはwhenの条件が真のときだけ。
- 関数とみなすなら `Component: Parameters -> (Arguments -> Field)` という形式をしている。

### ComponentName
- Componentそれぞれにつけられたユーザ定義の名称。
- ただし省略可能で、その場合はComponentのtypeと同じ名前が使われる。

## Parameters
- 各ModuleのConfigファイルの中で "params" に定義されるJSONオブジェクト。
- "params" 各フィールドは、call側の呼び出すときに指定する引数のデフォルト値を持つ。

## Arguments
- 各Componentの "args" というフィールドに定義されるJSONオブジェクト。
- このオブジェクトの中で "$" で始まる文字列のフィールドは、実行時に `evaluate` される。

## Environment
- Pipelineの各々のComponentの出力を格納したオブジェクト
- 各ModuleのPipelineのはじめの時点では、Argumentsが展開された状態で初期化される。
- 各Componentの処理が終わるたびに、Environmentには、そのComponentの出力が格納される。
- このときのフィールド名はComponentNameになる。

## Evaluator
- ArgumentsをParametersを用いて展開しComponentに渡すオブジェクト
- つまりArgumentsをEvaluateするからEvaluator。