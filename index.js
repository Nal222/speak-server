/**
 * Created by Kamla Chawla on 4/9/2016.
 */

var
    express = require('express'),
    cors = require('cors'),
    app = express(),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient
;

app.use(cors());
//app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

console.log("hello");

//var db;
app.post(
    '/login',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        response.json({name: "Nalini"});
        MongoClient.connect(
            'mongodb://localhost/Users',
            function (err, db) {
                if (err) {
                    return console.dir(err);

                }
                var collection = db.collection('speakappuser');
                collection.insertOne(
                    request.body,
                    function (err, result) {
                        collection
                            .find()
                            .toArray(
                                function(err, result){
                                    if (err) {
                                        console.log(err);
                                    } else if (result.length) {
                                        console.log('Found: ', result);
                                    } else {
                                        console.log('No document(s) found with defined "find" criteria');
                                    }
                                    db.close();
                                }
                            )
                        ;
                    }
                );
            }
        );
    }
);

app.listen(5000);
app.listen(27017);

