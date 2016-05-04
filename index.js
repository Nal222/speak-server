/**
 * Created by Kamla Chawla on 4/9/2016.
 */

var
    express = require('express'),
    cors = require('cors'),
    app = express(),
    bodyParser = require('body-parser')
;

app.use(cors());
app.use(bodyParser.json());

console.log("hello");

app.post(
    '/login',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        response.json({name: "Nalini"});
    }
);

app.listen(5000);