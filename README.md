# Phillips Hue Bulb Reset Tool

A simple CLI tool to reset Phillips Hue bulbs that have been improperly paired with a SmartThings hub before they were paired with the Hue bridge.

## Requirements

* Node.js
* Linux OS for network scan support
* Phillips Hue bridge connected to your network

## Installation

1. First make sure that Node.js is properly downloaded and installed on your system.  You can install Node.js at https://node.js.org.
2. Open whatever terminal that your OS provides, and enter `node --version` to confirm that your Node binary is available in your $PATH variable.
3. Clone this repository to your computer, either by using the `git clone` command in your terminal, or by downloading the .zip file directly from the Github repo.  
4. In your terminal, navigate to the root folder of this project and run `npm install` to install the tool's dependencies.
5. You're good to go.

## Usage if you already know the IP of your Hue Bridge

If you already previously know the IP address of your Hue Bridge on your network, you can run the tool using the `--hosts` option to skip the network scan:
```
node index.js --hosts=192.168.28.1
```

You can also pass in a comma seperated list of IP addresses, if you're not entirely sure which host is running the Hue bridge:

```
node index.js --hosts=192.168.28.1,192.168.29.2
```

## Usage if you don't know your IP of your Hue bridge

This tool includes a network scan that utilizes your ARP table on your OS to check all of the known devices on your network for Hue bridges, and from there will submit bulb reset requests to the valid IP addresses on the list.  Note - This feature is currently tested on Linux Mint ONLY, I will begin looking into ensuring network scan works on Mac and Windows ASAP.  To use this feature, just run the default tool script with no args:

```
node index.js
```

## License

This tool is licensed at MIT, use it and distribute it as you see fit.
