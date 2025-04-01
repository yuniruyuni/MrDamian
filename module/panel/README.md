[![npm version](https://badge.fury.io/js/mrdamian-plugin-panel.svg)](https://badge.fury.io/js/mrdamian-plugin-panel)
[![code style: biome](https://img.shields.io/badge/code_style-biome-ff69b4.svg?style=flat-square)](https://github.com/biomejs/biome)

# mrdamian-plugin-panel

mrdamian-plugin-panel is a Mr.Damian plugin that allows a streamer operates Mr.Damian behavior via interactive panel.

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

- Install [MrDamian](https://github.com/yuniruyuni/mrdamian)

## Installation

1. Install via Mr.Damian's plugin installation screen.
2. Write some settings in Mr.Damian's module config file.
3. Then, panels will appear in your Mr.Damian management screen ✨
4. If you want to use this module in your submodule, please notify insallation requirement to your submodule users.

## Usage

You can display your panel with following configs:

```json5
{
  pipeline: [
    {
      // panel's default action defines the body of the panel.
      // You can insert any panel group into this panel by writing define action.
      // This is intended to inherit and insert new panel group by submodule.
      type: "panel",
    },
    {
      type: "panel",
      // You can define the contents of the panel with define action.
      action: "define",
      // Group name. The value emitted/discharged by panel will be stored in the key of this name.
      group: "shoutout",
      args: {
        forms: [
          {
            // You can set select button that transit some states.
            type: "select",
            name: "auto_shoutout",
            // Each click will transit to the state defined in states.
            // The top item in states is the initial state.
            // It will be reset to the initial state when restarted.
            states: [
              {
                // Text to display on the button.
                text: "auto shoutout on",
                // The value to discharge when this state is active.
                // You can specify one of the following:
                // - "base", "active", "inactive", "info", "warning", "danger"
                // - 16 hex color code like `#FFFFFF`
                // If omitted, it will be "base".
                color: "active",
                // The value to discharge when this state is active.
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
            // Button. Each click will emit an event.
            // The event will have true in the key specified by name.
            // So in this case, { panel: { shoutout: true } } will be emitted.
            type: "button",
            name: "shoutout",
            text: "Send shoutout"
          },
        ],
      },
    },
    {
      // For example, there is a component that just counts up each time it runs.
      // Here, let's say it counts up each time twitch.message comes.
      when: "twitch.message",
      type: "count",
      name: "message",
    },
    {
      // You can display reactively because panel redefinition runs every time a message comes.
      when: "twitch.main.message",
      type: "panel",
      action: "define",
      group: "message",
      args: {
        forms: [
          {
            type: "label",
            name: "latest",
            // You can update the value of the component by expanding jexpr like this.
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

Sorry, currently this module is just a PoC phase for checking module structure around with Mr.Damian and their plugins so please wait for contributing.
But after the checking finished, I'll provides additional info about contributing.

## Versioning

We use [SemVer](http://semver.org/) for versioning.
If you want to release new version, please update `package.json`'s version value.
Then, our [Github Action](./.github/workflows/release.yaml) will release new version to npm automatically.

## Authors

* **Yuniru Yuni** - *Initial work* - [yuniruyuni](https://github.com/yuniruyuni)

## License

[MIT License](https://andreasonny.mit-license.org/2019) © Yuniru Yuni