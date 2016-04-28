/**
 * Created by Kamla Chawla on 4/9/2016.
 */

var
    express = require('express'),
    cors = require('cors'),
    app = express()
;

app.use(cors());

console.log("hello");

app.post(
    '/login',
    function (req, res) {
        console.log('YES!!!!!!! APP.POST REACHED')
        res.send('POST request to the login page');
    }
);

app.listen(5000);