const apn = require('apn')

const privateKeyPath = './AuthKey_2WGZS77LV7.p8'
const teamId = 'S2BEC8V882';
const keyId = '2WGZS77LV7';

// Create authentication options
const options = {
    token: {
      key: privateKeyPath,
      keyId: keyId,
      teamId: teamId,
    },
    production: false, // Set to true for production environment
};

class RemoteNotification {
    constructor() {
        this.apn = apn
        this.apnProvider = new apn.Provider(options);
    }
}

module.exports = RemoteNotification