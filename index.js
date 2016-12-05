/**
 * Created by Nalini Chawla on 4/9/2016.
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
process.on('uncaughtException', function (err) {
    console.log("There has been an error: " + err);
});

//var db;
app.post(
    '/login',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        response.json({name: "Nalini"});
        MongoClient.connect(
            'mongodb://192.168.1.246/Users',
            function (err, database) {
                if (err) {
                    return console.dir(err);

                }
                global.db = database;
                global.collection = database.collection('speakappuser');
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

                                }
                            )
                        ;
                    }
                );
            }
        );
    }
);
app.post(
    '/chooseImagesAndImageOrder',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        response.json({name: "Nalini Chawla"});
        db.collection.insertOne(
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







app.listen(5000);
app.listen(27017);

