# Yeelight Media Sync

Yeelight Media Sync is a tool that synchronizes Yeelight bulb colors with the dominant color of the currently playing media's artwork on macOS.

## Prerequisites

Before running, you need to install [nowplaying-cli](https://github.com/kirtan-shah/nowplaying-cli) to retrieve the currently playing media information. You can install it using Homebrew:

```sh
brew install nowplaying-cli
```

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/gush3l/yeelight-media-sync.git
    ```
2. Navigate to the project directory:
    ```sh
    cd yeelight-media-sync
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```

## Usage

To start the application, run:
```sh
npm start
```

To get the thumbnail of the currently playing media, run:
```sh
npm run get-thumbnail
```

## Dependencies

- [colorthief](https://www.npmjs.com/package/colorthief) - A NPM package to get the dominant color from an image.
- [yeelight-awesome](https://www.npmjs.com/package/yeelight-awesome) - A NPM package to control Yeelight devices.
- [nowplaying-cli](https://github.com/kirtan-shah/nowplaying-cli) - A macOS command-line utility to retrieve the artwork.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.