import axios from 'axios';

// TODO(1) Implement ThirdPartyApp Relay

/**
 * This class will be used to communicate with 
 * third party application clients who want to 
 * authenticate with our service and access student 
 * Identities.
 */
export default class ThirdPartyApp {
    static sendExternalAccessToken(applicationURL, path = "/oauth-callback") {
        // response = axios.post(applicationURL + path)
        return
    }
}