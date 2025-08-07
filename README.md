# Synchrotron UI

Node graph editor frontend for [Synchrotron](https://github.com/ThatOtherAndrew/Synchrotron), created with Svelte Flow

[![SynchrotronUI demo screenshot](https://i.imgur.com/MXSbFcv.png)](https://i.imgur.com/MXSbFcv.png)

---

## Demo

| [Hack Club Showcase - Synchrotron](https://youtu.be/wlhBz62t2zE)                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------- |
| [![Hack Club Showcase - Synchrotron](https://img.youtube.com/vi/wlhBz62t2zE/0.jpg)](https://www.youtube.com/watch?v=wlhBz62t2zE) |

## Build

To download, install, and run Synchrotron UI locally, you need to build the project from source. To do so, clone
this repository, install the NPM dependencies and run the `build` and `preview` scripts.

```shell
git clone https://github.com/ThatOtherAndrew/SynchrotronUI
cd SynchrotronUI
npm install
npm run build
npm run preview
```

(If you know what you're doing, substitute `npm` with `yarn`/`pnpm`/`bun` - for the curious, I used `bun` during
development!)

## Quickstart

Firstly, ensure you've installed the [Synchrotron server](https://github.com/ThatOtherAndrew/Synchrotron), and that
it is running:

```
synchrotron-server
```

Next, create some nodes with the following commands in the console:

```
new 440 freq;
new SineNode sine;
new PlaybackNode out;
```

Then use the below `link` commands, or connect the corresponding ports by dragging between ports in the graph UI:

```
link freq.out -> sine.frequency;
link sine.out -> out.left;
link sine.out -> out.right;
```

Finally click the `Start` button at the top right of the app (or use the `start` console command), and listen to the
lovely 440 Hz sine wave produced. 😌

<sub>Full Synchrolang language reference coming Soon™️</sub>