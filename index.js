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
    assert = require('assert'),
    usersUrl = 'mongodb://127.0.0.1:27017/Users',
    BinaryServer = require('binaryjs').BinaryServer,
    fs = require('fs'),
    wav = require('wav'),
    ObjectID = require('mongodb').ObjectID
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

async function connectToMongoClient(){
    return await MongoClient.connect(usersUrl);
}

app.post(
    '/register',
    function (request, response) {

        (
            async ()=>{
                console.log("REQUEST BODY IS " + JSON.stringify(request.body));
                console.log("REQUEST PATH IS " + request.path);
                //response.json({name: "Nalini"});
                var db = await MongoClient.connect(usersUrl);
                console.log("Connected correctly to server");
                var userName = request.body.username;
                var
                    speakAppUserCollection = db.collection('speakappuser'),
                    myDocument = await speakAppUserCollection.findOne({username: userName})
                ;
                console.log("myDocument " + JSON.stringify(myDocument));
                if (myDocument) {
                    //response.write("Username exists in database");
                    console.log("username already exists");
                    var usernameTaken = true;
                }
                else if (!myDocument) {
                    console.log("Inside else if myDocument doesn't exist");
                    usernameTaken = false;
                }
                var myDocument2 = await speakAppUserCollection.findOne({password: request.body.password});
                console.log("myDocument2 " + JSON.stringify(myDocument2));
                if (myDocument2) {
                    //response.write("Password exists in database");
                    console.log("Password already exists");
                    var passwordTaken = true;
                }
                else if (!myDocument2) {
                    console.log("Inside else if myDocument2 doesn't exist");
                    passwordTaken = false;
                }
                console.log("username taken status " + usernameTaken + "password taken status " + passwordTaken);

                if(usernameTaken == true){
                    console.log("reached inside usernameTaken == true")
                    response.write("Username exists in database");
                }
                if(passwordTaken == true){
                    console.log("Reached inside passwordTaken == true")
                    response.write("Password exists in database");
                }
                if (usernameTaken == false && passwordTaken == false) {
                    response.write("ChooseImagesForImageGalleryPage");
                    console.log("Reached inside usernametaken and password taken");
                    await speakAppUserCollection.insertOne(request.body);
                    console.log("Username and password inserting into database");
                }
                db.close();
                response.end();
            }
        )();
    }
);

async function getUser(db, request){
    const speakAppUserCollection = db.collection('speakappuser');
    return await speakAppUserCollection.findOne(
        {
            username: request.body.username,
            password: request.body.password

        }
    )
}

app.post(
    '/chooseImagesAndImageOrder',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);

        (
            async ()=>{
                const db = await MongoClient.connect(usersUrl);
                /*if (err) {
                    return console.dir(err);
                }*/
                var
                    speakAppUserCollection = db.collection('speakappuser'),
                    user = await getUser(db, request)
                ;
                //console.log("user before changing order is " + JSON.stringify(user));
                user.galleryItemIds = request.body.galleryItemIds;
                //console.log("USER FROM DOING STOP SORTING IS " + JSON.stringify(user));
                console.log("Gallery Item Ids after sorting or deleting from request is " + request.body.galleryItemIds + "");
                speakAppUserCollection.save(user);
                //response.send(galleryItemIds);
                response.send(user.galleryItemIds);
            }
        )();
    }
);

app.post(
    '/addImage',
    function (request, response) {

        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        //response.json({name: "Nalini Chawla"});

        MongoClient.connect(
            usersUrl,
            function (err, db) {
                console.log('1');
                if (err) {
                    console.log('2');
                    return console.dir(err);
                }
                console.log('3');
                var collection = db.collection('GalleryItems');
                console.log('3a');
                collection.insertOne(
                    {url: request.body.url},
                    function (err, result) {
                        console.log('4');
                        //console.log("earlier attempt at getting saved object id which is " + result._id);
                        //collection.find(result._id);
                        //var objectidofnarrationobjectString = (collection.find(result._id)).toString();
                        //var objectidofnarrationobjectHex = (collection.find(result._id)).toHexString();

                        console.log("objectid of gallery item  object is string " + result.insertedId + ", error is " + err + ", request.body is " + JSON.stringify(request.body));
                        //audioFileId = result.insertedId;
                        //response.send(result.insertedId + "");
                        co(
                            function*() {
                                var
                                    speakAppUserCollection = db.collection('speakappuser'),
                                    user = yield getUser(db, request)
                                ;
                                console.log("user is " + user);
                                user.galleryItemIds = user.galleryItemIds || [];
                                user.galleryItemIds.push(result.insertedId);
                                speakAppUserCollection.save(user);
                                response.send({galleryItemId: result.insertedId});
                            }
                        );

                    }
                );
            }
        );
    }
);


const saveNarration =
    async ()=>{
        const db = await MongoClient.connect(usersUrl);
    }
;


app.post(
    '/Narrations',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        //response.json({name: "Nalini Chawla"});

        MongoClient.connect(
            usersUrl,
            function (err, db) {
                console.log('1');
                if (err) {
                    console.log('2');
                    return console.dir(err);
                }
                console.log('3');
                var collection = db.collection('Narrations');
                console.log('3a');
                collection.insertOne(
                    request.body.narration,
                    function (err, result) {
                        console.log('4');
                        //console.log("earlier attempt at getting saved object id which is " + result._id);
                        //collection.find(result._id);
                            //var objectidofnarrationobjectString = (collection.find(result._id)).toString();
                            //var objectidofnarrationobjectHex = (collection.find(result._id)).toHexString();

                            console.log("objectid of narration object is string " + result.insertedId + ", error is " + err + ", request.body is " + JSON.stringify(request.body));
                            //audioFileId = result.insertedId;
                            //response.send(result.insertedId + "");
                            co(
                                function*() {
                                    var
                                        speakAppUserCollection = db.collection('speakappuser'),
                                        user = yield speakAppUserCollection.findOne(
                                            {
                                                username: request.body.username,
                                                password: request.body.password

                                            }
                                        )
                                        ;
                                    console.log("user is " + user);
                                    user.narrationIds = user.narrationIds || [];
                                    user.narrationIds.push(result.insertedId);
                                    speakAppUserCollection.save(user);
                                    response.send(result.insertedId);

                                }
                            );

                    }
                );
            }
        );
    }
);


app.post(
    '/saveSlideSwitches',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        //response.json({name: "Nalini Chawla"});
        MongoClient.connect(
            usersUrl,
            function (err, db) {
                if (err) {
                    return console.dir(err);
                }
                co(
                    function*() {
                        var
                            speakAppNarrationCollection = db.collection('Narrations'),
                            narrationObjectWithMatchingNarrationIdToSlideSwitchesRequestNarrationId = yield speakAppNarrationCollection.findOne(
                                {
                                    _id: new ObjectID(request.body.narrationId)
                                }
                            )
                            ;
                        console.log("narration object matching to audiofileId from client side is " + JSON.stringify(narrationObjectWithMatchingNarrationIdToSlideSwitchesRequestNarrationId));
                        narrationObjectWithMatchingNarrationIdToSlideSwitchesRequestNarrationId.slideSwitches = request.body.slideSwitches;

                         //narration.slideSwitches = narration.slideSwitches || [];
                         //narration.slideSwitches.push(request.body.slideSwitches);

                        speakAppNarrationCollection.save(narrationObjectWithMatchingNarrationIdToSlideSwitchesRequestNarrationId);
                        console.log("narration object after saving slideSwitches is " + JSON.stringify(narrationObjectWithMatchingNarrationIdToSlideSwitchesRequestNarrationId));
                        response.send(narrationObjectWithMatchingNarrationIdToSlideSwitchesRequestNarrationId.slideSwitches);

                    }
                );

            }
        );
    }
);

async function getX(){
    return 5;
}

async function getXMultipliedBy7(){
    return (await getX()) * 7;
}

app.post(
    '/login',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        //response.json({name: "Nalini Chawla"});

        (
            async ()=>{

                const db = await MongoClient.connect(usersUrl);

                /*
                if (err) {
                    return console.dir(err);
                }
                */

                var
                    narrations = [],
                    galleryItems = [],
                    speakAppNarrationCollection = db.collection('Narrations'),
                    speakAppGalleryItemCollection = db.collection('GalleryItems');
                    speakAppUserCollection = db.collection('speakappuser'),
                    userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword = await speakAppUserCollection.findOne(
                        {
                            username: request.body.username,
                            password: request.body.password
                        }
                    )
                ;
                //new ObjectID(value)
                for(const value of userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.narrationIds){
                    try{
                        console.log("finding narration with id " + value);
                        narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds = await speakAppNarrationCollection.findOne(
                            {
                                _id: new ObjectID(value)
                            }
                        );
                        narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds.audioFileId = narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds._id;
                        narrations.push(narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds);

                    }
                    catch(e){
                        console.log("error finding narration with id " + value);
                    }

                }
                for(const value of userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.galleryItemIds){
                    try{
                        console.log("finding gallery item with id " + value);
                        galleryItemObjectWithMatchingGalleryItemIdToUserObjectGalleryItemIds = await speakAppGalleryItemCollection.findOne(
                            {
                                _id: new ObjectID(value)
                            }
                        );
                        //galleryItemObjectWithMatchingGalleryItemIdToUserObjectGalleryItemIds.audioFileId = narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds._id;
                        galleryItems.push(galleryItemObjectWithMatchingGalleryItemIdToUserObjectGalleryItemIds);

                    }
                    catch(e){
                        console.log("error finding galleryItem with id " + value);
                    }

                }


                //Yield doesn't work inside nested non generator function, even arrow function

                //userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.narrationIds.forEach(
                //    value=>{
                //        narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds = yield speakAppNarrationCollection.findOne(
                //           {
                //                _id: new ObjectID(value)
                //           }
                //     );
                //       narrations.push(narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds);
                //    }
                //);

                userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.narrations = narrations;
                userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.galleryItems = galleryItems;

                response.send(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword);
                console.log("user is " + JSON.stringify(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword));

            }
        )();

        //logIn();


    }
);

app.set('views', __dirname + '/tpl');
app.use(express.static(__dirname + '/public'));
app.listen(3700);
app.listen(5000);
app.listen(27017);
//app.get('/', function(req, res){
//    res.render('index');
//});


console.log('server open on ports 27017, 5000 and 3700');


binaryServer = BinaryServer({port: 9001});

binaryServer.on(
    'connection',
    function(client) {
        console.log('new connection');
        //outFile = "public/audio/" + audioFileId + '.wav';
        //console.log("outfile is " + outFile);
        client.on(
            'stream',
            function(stream, meta) {
                console.log('new stream. meta is ' + meta);
                var fileWriter =
                    new wav.FileWriter(
                        "public/audio/" + meta + ".wav"
                        ,
                        {
                            channels: 1,
                            sampleRate: 48000,
                            bitDepth: 16
                        }
                    )
                ;
                stream.pipe(fileWriter);

                stream.on(
                    'end',
                    function() {
                        fileWriter.end();
                        console.log('wrote to file ' + meta + ".wav");
                    }
                );
            }
        );
    }
);





