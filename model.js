/** Configurazione OAuth2 */

var ldap = require('ldapjs');
var client = ldap.createClient({
    url: 'ldap://localhost:389'
});

var config = {
    clients: [{
        clientId: 'application',
        clientSecret: 'secret',
        grants: ['password']
    }],
    tokens: [],
    users: [{
        id: '123',
        username: '123',
        password: 'password'
    }],
    grants: [
        "password",
        "authorization_code",
        "refresh_token"
    ]
};


var dump = function() {
    console.log('clients', config.clients);
    console.log('tokens', config.tokens);
    console.log('users', config.users);
};


var getAccessToken = function(bearerToken, callback) {
    var tokens = config.tokens.filter(function(token) {
        return token.accessToken === bearerToken;
    });
    return callback(false, tokens[0]);
};

var getClient = function(clientId, clientSecret, callback) {
    var clients = config.clients.filter(function(client) {
        return client.clientId === clientId && client.clientSecret === clientSecret;
    });
    callback(false, clients[0]);
};

var grantTypeAllowed = function(clientId, grantType, callback) {
    var clientsSource,
        clients = [];
    if (grantType === 'password') {
        clientsSource = config.clients;
    }
    if (!!clientsSource) {
        clients = clientsSource.filter(function(client) {
            return client.clientId === clientId;
        });
    }
    callback(false, clients.length);
};

var saveToken = function(token, client, user) {

    var data = {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        client: client,
        user: user
    };

    config.tokens.push(data);

    return new Promise((resolve, reject) => {
       resolve(data);
    }).catch();

};


var getUser = function(uname, passwd, callback) {
    var isConnect = function(err) {
        client.unbind();
        if(err === null){
            callback(false, {username: uname, password: passwd});
        } else{
            console.log(err);
            callback(true, undefined);
        }
    }
    client.bind('cn='+uname+',dc=my-domain,dc=com', passwd, isConnect);
};


module.exports = {
    getAccessToken: getAccessToken,
    getClient: getClient,
    grantTypeAllowed: grantTypeAllowed,
    saveToken: saveToken,
    getUser: getUser
};
