var express = require('express'),
    bodyParser = require('body-parser');
var OAuth2Server = require('oauth2-server')
var Request = OAuth2Server.Request;
var Response = OAuth2Server.Response;

// Documentation: https://buildmedia.readthedocs.org/media/pdf/oauth2-server/latest/oauth2-server.pdf

const app = express();

// Per gestire le POST con Express.
//  Quando è stato rilasciato Express 4.0, si è deciso di rimuovere il middleware in bundle da Express e renderlo invece un pacchetto separato.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//dove memorizzare i token???
// Model contiene tutti i metodi che la libreria necessita per create un oauth2 server
app.oauth = new OAuth2Server({
    model: require('./model.js'),
    grants: ['password', 'authorization_code', 'refresh_token', 'client_credentials'],
    debug: true,
    allowBearerTokensInQueryString: true
});
app.all('/oauth/token', obtainToken);
app.get('/', authenticateRequest, function(req, res) {

    res.send('Congratulations, you are in a secret area!');
});

app.use(function(req, res, next) {
    let err = new Error('Not Found')
    err.status = 404
    res.json({error:err})
})
app.use(errorHandler);
if (!module.parent) {
    app.listen(3000, function() {
        console.log(`app is listening at http://localhost:3000`);
    });
}

function errorHandler(err, req, res, next) {
    console.error(err)
    res.json({error: err})
}

function obtainToken(req, res) {
    var request = new Request(req);
    var response = new Response(res);
    return app.oauth.token(request, response)
        .then(function(token) {
            res.json(token);
        }).catch(function(err) {

            res.status(err.code || 500).json(err);
        });
}

function authenticateRequest(req, res, next) {
    var request = new Request(req);
    var response = new Response(res);

    return app.oauth.authenticate(request, response)
        .then(function(token) {
            next();
        }).catch(function(err) {
            res.status(err.code || 500).json(err);
        });
}


module.exports = app