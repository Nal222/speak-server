/**
 * Created by Nalini Chawla on 4/9/2016.
 */

var
    express = require('express'),
    cors = require('cors'),
    app = express(),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    co = require('co'),
    assert = require('assert')
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
        //response.json({name: "Nalini"});
        co(function*(){
            var db = yield MongoClient.connect('mongodb://192.168.1.48/Users');
            console.log("Connected correctly to server");
            var r = yield db.collection('speakappuser').insertOne(request.body);
            assert.equal(1, r.insertedCount);
            db.collection('speakappuser').find({ username : request.body.username }).limit(2).each(function (err, doc) {
                if(doc){
                    response.write("Username exists in database");
                    return false;
                }
            });
            db.collection('speakappuser').find({ password : request.body.password}).limit(2).each(function (err, doc) {
                if(doc){
                    response.write("Password exists in database");
                    response.end();
                    return false;
                }
            });
            db.close();
        }).catch(function(err){
            console.log(err.stack);
         });

    }
);
    /*
        MongoClient.connect(
            'mongodb://192.168.1.48/Users',
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
*/
app.post(
    '/chooseImagesAndImageOrder',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        response.json({name: "Nalini Chawla"});
        MongoClient.connect(
            'mongodb://192.168.1.48/Users',
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
                                function (err, result) {
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

