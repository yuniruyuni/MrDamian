# ドメイン用語集

## Plugin
- Pluginは、Mr.Damianの機能を拡張するためのプラグイン。
- `mrdamian-plugin-` という接頭辞を持ったnpm packageとして公開されている
- 1つのPluginからは、1つのComponentを生成するComponentConstructorがdefault exportされる。

## Module
- Moduleは、ModuleParametersとPiplineを持ったオブジェクト。

### MainModule
- MainModuleは、Mr.Damianの全体で最初に呼び出されるModule。

### SubModule
- SubmoduleはあるModuleから呼び出されるModule。
- 全体を通して1つのComponentと見做せるように振る舞う。

## Pipeline
- パイプラインは、複数のComponent Actionを組み合わせて構成される一連の処理。
    - `Pipeline = Component<Action>[]`
- 1つのModuleには、1つのPipelineが存在する。
- イベントを受信すると、Pipelineの前から順番にActionが1回ずつ実行される。

## ComponentConstructor
- Componentを生成するためのコンストラクタのインタフェイス

## Component
- Componentは、パイプラインの最小単位。
- システム側で事前いろいろな種類のものが定義されている。
- "when" というフィールドがある場合、そのComponentが実行されるのはwhenの条件が真のときだけ。

### (Component) Action
- 1回分のComponentの呼び出し。
- Pipelineに刺さるのは各ComponentのAction。

### (Component) Instance
- (Component)Actionは複数の呼び出しの間で内部データを共有する。
- 異なる(Component)Nameが設定されたときに、異なる内部データが生成される。
- このAction間で共有される内部データのこと。

### (Component) Name
- (Component)Actionにつけられたユーザ定義の名称。
- ただし省略可能で、その場合はComponentのtypeと同じ名前が使われる。
- 異なるComponent Nameがつけられるたびに別のInstanceが立ち上がる。

### (Action) ID
- Pipeline内でのActionの一意な識別子。
- Actionそれぞれを区別するために利用される。
- ユーザ側では設定できず、システム側で自動生成される。
- Plugin作者側でこれを使って内部挙動を作ることができたり
- 管理画面上でActionそれぞれを一意に識別するために使われる。

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