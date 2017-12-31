const fs = require('fs');
const Bluebird = require('bluebird');
const request = require('axios');
const argv = require('minimist')(process.argv.slice(2));

/**
 * Helper function for generating random device username
 */
function rand() {
  return Math.floor(Math.random() * 10000) + 1;
}
/**
 * Scans the local ARP table on your computer and returns an array of devices by IP
 */
function getDevices() {
  if (argv.hosts) {
    const hostArray = argv.hosts.split(',');
    return Bluebird.resolve(hostArray)
  }
  return new Bluebird((resolve, reject) => {
    fs.readFile('/proc/net/arp', function(err, data) {
      if (err) return reject(err);
      try {
        var output = [];
        var devices = data.toString().split('\n');
        devices.splice(0,1);
    
        for (i = 0; i < devices.length; i++) {
            var cols = devices[i].replace(/ [ ]*/g, ' ').split(' ');
    
            if ((cols.length > 3) && (cols[0].length !== 0) && (cols[3].length !== 0) && cols[3] !== '00:00:00:00:00:00') {
                output.push({
                    ip: cols[0],
                    mac: cols[3]
                });
            }
        }
    
        return resolve(output);
      } catch (e) {
        return reject(e);
      }
    });
  });
}
/**
 * Checks if device API exists
 * @param {*} device 
 */
function checkApi(device) {
  return request.get(`http://${device.ip}/api`)
    .then(res => true)
    .catch(err => false);
} 
/**
 * Creates new user for device
 * @param {*} device 
 */
function createDeviceUser(device) {
  return request.post(`http://${device.ip}/api`, {
      devicetype: `reset_hue_bulb#iphone ${rand()}`
    })
    .then(res => {
      if (res.data[0].error) {
        throw Error(res.data[0].error.description);
      }
      return res.data[0].success.username;
    })
}
/**
 * Creates device user
 * Attempts bulb reset with provided username
 * @param {*} device 
 */
function processDevice(device) {
  return createDeviceUser(device)
    .then(login => attemptBulbReset(device, login));
}
/**
 * Sends PUT request to API to try to run touchlink command on hub
 * @param {*} device 
 * @param {string} login 
 */
function attemptBulbReset(device, login) {
  return request.put(`http://${device.ip}/api/${login}/config`, {
    touchlink: true
  });
}

function main() {
  console.log(intro);
  return getDevices()
    .then(devices => Bluebird.filter(devices, checkApi))
    .then(hubs => {
      console.log(`[INFO] - There were ${hubs.length} devices found on your Network.  Processing...`);
      return hubs;
    })
    .then(hubs => Bluebird.map(hubs, hub => processDevice(hub)))
    .then(() => {
      console.log('[SUCCESS] - Hub processing complete.  Rerun this script until all of your bulbs are viewable.')
    })
    .catch(err => console.error(err));
}

let intro = `
-------------------------------------------------------------------------------------------------------
-- phillips-hue-reset | Reset bulbs accidentally set to ZLL instead of ZHA | Wes King <wes@boone.io> --
-------------------------------------------------------------------------------------------------------
[INFO] - Beginning network scan...
`

const help = `
Usage: node index.js <options> 

Options:
  --hosts : A comma seperated list of hosts to ping bulb reset requests to 
    Example : node index.js --hosts=192.168.10.1,192.168.10.2 
`

if (argv.help) {
  console.log(help);
} else {
  main();
}

