/**
 * Created by Nalini Chawla on 4/9/2016.
 */

var
    express = require('express'),
    app = express(),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    co = require('co'),
    assert = require('assert'),
    usersUrl = 'mongodb://127.0.0.1:27017/Users',
    BinaryServer = require('binaryjs').BinaryServer,
    fs = require('fs'),
    wav = require('wav'),
    multer = require('multer'),
    ObjectID = require('mongodb').ObjectID
    nodemailer = require('nodemailer')
;
const uuidv4 = require('uuid/v4');

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/Images/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }
});

var upload = multer({ storage: storage });
//app.use(fileUpload());

//app.use(bodyParser.json());

//app.use(bodyParser.json());

//var urlencodedParser = bodyParser.urlencoded({ extended: false });
//app.use(bodyParser.urlencoded({ extended: false }));




//app.use(express.static("public"));



console.log("hello");
process.on('uncaughtException', function (err) {
    console.log("There has been an error: " + err);
});

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
                console.log("userName IS " + userName);
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

                var myDocument3 = await speakAppUserCollection.findOne({email: request.body.email});
                console.log("myDocument3 " + JSON.stringify(myDocument3));
                if (myDocument3) {
                    //response.write("Password exists in database");
                    console.log("Email already exists");
                    var emailTaken = true;
                }
                else if (!myDocument3) {
                    console.log("Inside else if myDocument3 doesn't exist");
                    emailTaken = false;
                }
                console.log("username taken status " + usernameTaken + "password taken status " + passwordTaken + "email taken status " + emailTaken);

                if(usernameTaken == true){
                    console.log("reached inside usernameTaken == true");
                    response.write("Username exists in database");
                }
                if(passwordTaken == true){
                    console.log("Reached inside passwordTaken == true");
                    response.write("Password exists in database");
                }
                if(emailTaken == true){
                    console.log("Reached inside emailTaken == true");
                    response.write("Email exists in database");
                }
                if (usernameTaken == false && passwordTaken == false && emailTaken == false) {
                    response.write("ChooseImagesForImageGalleryPage");
                    var user = await speakAppUserCollection.insertOne(request.body);
                    console.log("USER IS " + JSON.stringify(user));
                    console.log("Username, password and email inserting into database");
                }
                db.close();
                response.end();
            }
        )();
    }
);

async function getUser(db, request){
    const speakAppUserCollection = db.collection('speakappuser');
    console.log("USER OBJECT IS " + request.body.username + "PASSWORD IS " + request.body.password);
    return await speakAppUserCollection.findOne(
        {
            username: request.body.username,
            password: request.body.password

        }
    );
}

app.post(
    '/checkEmailExists',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);

        (
            async ()=> {
                const db = await MongoClient.connect(usersUrl);
                /*if (err) {
                    return console.dir(err);
                }*/
                var speakAppUserCollection = db.collection('speakappuser');
                var myDocument = await speakAppUserCollection.findOne({email: request.body.email});
                if(!myDocument){
                    response.write("Does not exist");
                    console.log(JSON.stringify(request.body) + "Email does not exist in database");
                }
                else if(myDocument){
                    console.log("Email exists doc containing email is " + JSON.stringify(myDocument));
                    var randomUUIDToken = uuidv4();
                    console.log("Random token is " + randomUUIDToken);
                    //var myQuery = {email: request.body.email};
                    /*
                    if(!myDocument.randomToken){
                        myDocument.randomToken = randomUUIDToken;
                        var result1 = await speakAppUserCollection.deleteOne(myQuery);
                        var resultDocumentWhichHasNewlyInsertedRandomTokenAndReplacesOldDocument = await speakAppUserCollection.insertOne(myDocument);
                        console.log("Deleted document result is " + JSON.stringify(result1));
                        console.log("Result document with newly inserted random token and replaces old document is " + JSON.stringify(resultDocumentWhichHasNewlyInsertedRandomTokenAndReplacesOldDocument));
                    }
                    else if(myDocument.randomToken){
                        myDocument.randomToken = randomUUIDToken;
                        var result2 = await speakAppUserCollection.deleteOne(myQuery);
                        var resultDocumentWhichHasUpdatedRandomTokenAndReplacesOldDocument = await speakAppUserCollection.insertOne(myDocument);
                        console.log("Deleted document result is " + JSON.stringify(result2));
                        console.log("Result document with updated random token and replaces old document is " + JSON.stringify(resultDocumentWhichHasUpdatedRandomTokenAndReplacesOldDocument));


                    }
                    */
                    //var myQuery = { randomToken: myDocument.randomToken };
                    var myQuery = {email: request.body.email};
                    var newValues = { $set: { randomToken: randomUUIDToken } };

                    var documentResultWithInsertedRandomToken = await speakAppUserCollection.findOneAndUpdate(
                        myQuery,
                        newValues, {
                        returnOriginal: false,
                        upsert: true }
                    );

                    console.log("Result is " + JSON.stringify(documentResultWithInsertedRandomToken));
                    console.log("Reached after insert or update randomToken in matching email document");
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL_ADDRESS,
                            pass: process.env.EMAIL_PASSWORD
                        }
                    });

                    var mailOptions = {
                        from: 'nalini.chawla10@gmail.com',
                        to: request.body.email,
                        subject: 'Sending Email using Node.js',
                        text: 'That was easy!'
                    };

                    const sendMailFunction = transporter.sendMail(mailOptions,(error, info)=> {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    await sendMailFunction;
                    response.write("A link has been sent to your email address");
                }
                db.close();
                response.end();

            }
        )();
    }

);
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
                console.log("user before changing order is " + JSON.stringify(user));
                //const requestBodyParsed = JSON.parse(request.body);
                user.galleryItemIds = request.body.galleryItemIds;
                console.log("USER FROM DOING STOP SORTING IS " + JSON.stringify(user));
                console.log("Gallery Item Ids after sorting or deleting from request is " + request.body.galleryItemIds + "");
                speakAppUserCollection.save(user);
                //TODO: Save gallery items i.e. images to gallerItemsCollection matching the galleryItemIds
                //response.send(galleryItemIds);
                response.send(user.galleryItemIds);
                db.close();
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
        (
            async ()=>{
                var
                    db = await MongoClient.connect(usersUrl),
                    collection = db.collection('GalleryItems'),
                    result =
                        await
                            collection.insertOne(
                                {
                                    url: request.body.url
                                }
                            )
                ;

                console.log("objectid of gallery item  object is string " + result.insertedId + ", request.body is " + JSON.stringify(request.body));
                var
                    speakAppUserCollection = db.collection('speakappuser'),
                    user = await getUser(db, request)
                ;
                console.log("user is " + JSON.stringify(user));
                user.galleryItemIds = user.galleryItemIds || [];
                user.galleryItemIds.push(result.insertedId);
                speakAppUserCollection.save(user);
                response.send({galleryItemId: result.insertedId});
                db.close();
            }
        )();
    }
);
/*
var
    Storage = multer.diskStorage({
        destination: function(request, file, callback) {
            callback(null, "./public/Images/");
        },
        filename: function(request, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    }),
    upload = multer({
        storage: Storage
    }).array("imgUploader", 10)
; //Field name and max count

app.get("/", function(request, response) {
    response.sendFile('index.html');
});
*/
/*
app.post('/uploadImages', function uploadImage(req, res) {
    var storage = multer.diskStorage({
        destination: "./public/Images/"
    });
    var upload = multer({
        storage: storage
    }).any();

    upload(req, res, function(err) {
        if (err) {
            console.log(err);
            return res.end('Error');
        } else {
            console.log(req.body);
            req.formData.forEach(function(item) {
                console.log(item);
                // move your file to destination
            });
            res.end('File uploaded');
        }
    });
});
*/
/*
app.post(
    '/uploadImages',
    function (req, res) {
        var imagedata = '';
        res.setEncoding('binary');

        res.on('data', function (chunk) {
            imagedata += chunk
        });

        res.on('end', function () {
            fs.writeFile(req, imagedata, 'binary', function (err) {
                if (err) throw err;
                console.log('File saved.')
            });
        });
    }
);
*/
app.post(
    '/uploadImages',
    upload.single('file'),
    function (req, res, next) {
        console.log(req.file);
        console.log(req.file.path);
        console.log("Name of file on user's computer is " + req.file.originalname);
        (
            async ()=> {
                var
                    db = await MongoClient.connect(usersUrl),
                    collection = db.collection('GalleryItems')
                ;
                var result = await collection.insertOne(
                    {
                        url: "http://localhost:3700/Images/" + req.file.filename
                    }
                );
                console.log("objectid of gallery item  object is string " + result.insertedId);
                var
                    speakAppUserCollection = db.collection('speakappuser'),
                    user = await getUser(db, req)
                ;
                console.log("Request URL IS " + req.url);
                console.log("user is " + JSON.stringify(user));
                console.log("RESULT.INSERTEDID IS " + result.insertedId);
                console.log("Username is " + req.body.username + "password is " + req.body.password);
                user.galleryItemIds = user.galleryItemIds || [];
                user.galleryItemIds.push(result.insertedId);
                speakAppUserCollection.save(user);
                console.log("FILENAME IS " + req.file.filename);
                user.fileName = req.file.filename;
                user.imageId = result.insertedId;
                res.send(user);
                //res.send({galleryItemId: result.insertedId});
                db.close();


            }
        )();
});
/*
app.post(
    '/uploadImages',
    function(req, res) {
        if (!req.files)
            return res.status(400).send('No files were uploaded.');

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let imageFile = req.files.image_file;

        // Use the mv() method to place the file somewhere on your server
        imageFile.mv('./public/Images/filename.jpg', function(err) {
            if (err)
                return res.status(500).send(err);

            res.send('File uploaded!');
        });
});
*/
/*
app.post('/uploadImages', function (req, res) {
    var tempPath = './temporaryImages',
        targetPath = path.resolve('./public/Images/' + req.file);

        fs.rename(tempPath, targetPath, function(err) {
            if (err) throw err;
            console.log("Upload completed!");
        });

});
*/
/*
app.post(
    '/uploadImages',
    function (req, res) {
        console.log(req.body);
        //console.log(req.uploadedFiles);
        console.log(req.file);
        console.log(req.body.formData);
        // get the temporary location of the file
        var tmp_path = './temporaryImages';
        // set where the file should actually exists - in this case it is in the "images" directory
        var target_path = './public/Images/';
        // move the file from the temporary location to the intended location
        fs.rename(tmp_path, target_path, function(err) {
            if (err) throw err;
            // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
            fs.unlink(tmp_path, function() {
                if (err) throw err;
                res.send('File uploaded to: ' + target_path);
                //res.send('File uploaded to: ' + target_path + ' - ' + req.files.image_file.size + ' bytes');
            });
        });
    }
);
*/

/*
app.post(
    '/uploadImages',
    upload.array('uploadedImages', 3),
    function(req, res){
        (
            async ()=>{
                var
                    db = await MongoClient.connect(usersUrl),
                    collection = db.collection('GalleryItems')
                ;

                var storage = multer.diskStorage({
                    destination: "./public/Images/"
                });
                var upload = multer({
                    storage: storage
                }).any();
                */
/*
                console.log("Files from user are " + req.files);
                console.log("Request data from client is " + JSON.stringify(req.body));


                upload(req, res, function(err) {
                    if (err) {
                        console.log(err);
                        return res.end('Error');
                    } else {
                        console.log(req.body);
                        req.files.forEach(function(item) {
                            console.log(item);
                            //move your file to destination
                        });
                        res.end('File uploaded');
                    }
                });


                var result = await collection.insertOne(
                    {
                        url: req.path
                    }
                );
                console.log("objectid of gallery item  object is string " + result.insertedId);
                var
                    speakAppUserCollection = db.collection('speakappuser'),
                    user = await getUser(db, req)
                ;

                console.log("user is " + JSON.stringify(user));
                user.galleryItemIds = user.galleryItemIds || [];
                user.galleryItemIds.push(result.insertedId);
                speakAppUserCollection.save(user);
                res.send({galleryItemId: result.insertedId});

                let base64Image = fileDataEncodedString.split(';base64,').pop();
                fs.writeFile(url, base64Image, {encoding: 'base64'}, function(err){
                    if(err) throw err;
                    console.log("File saved");
                });

                db.close();
            }
        )();
    }
);
*/

app.post(
    '/deleteNarrationsFromDatabase',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        (
            async ()=> {

                const db = await MongoClient.connect(usersUrl);

                const speakAppNarrationCollection = db.collection('Narrations');
                //var narrationIdsArray = [];
                var narrationIdsArray = new Array(request.body.narrationIds);

                for (let i=0; i<narrationIdsArray.length; i++) {
                    try {
                        const narrationObjectWithMatchingNarrationIdToNarrationIdToDeleteFromClient = await speakAppNarrationCollection.findOne(
                            {
                                _id: new ObjectID(narrationIdsArray[i])
                            }
                        );
                        console.log("Narration object before deletion is " + JSON.stringify(narrationObjectWithMatchingNarrationIdToNarrationIdToDeleteFromClient));
                        await speakAppNarrationCollection.deleteOne(narrationObjectWithMatchingNarrationIdToNarrationIdToDeleteFromClient);
                        console.log("Narration object after deletion is " + JSON.stringify(narrationObjectWithMatchingNarrationIdToNarrationIdToDeleteFromClient));

                    }
                    catch (e) {
                        console.log("error finding narration object with id ");
                    }
                }
            }
        )();
    }
);
app.post(
    '/getAllPublishedNarrations',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        (
            async ()=>{
                var
                    db = await MongoClient.connect(usersUrl),
                    speakAppNarrationCollection = db.collection('Narrations'),
                    allPublishedNarrations = await speakAppNarrationCollection.find(
                        {
                            "published" : true
                        }
                    ).toArray()
                ;
                console.log("ALL PUBLISHED NARRATIONS ARE " + JSON.stringify(allPublishedNarrations));
                response.send(allPublishedNarrations);
                db.close();
            }
        )();
    }
);

app.post(
    '/getNarrationsMatchingSearchInput',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        (
            async ()=>{
                var
                    db = await MongoClient.connect(usersUrl),
                    speakAppNarrationCollection = db.collection("Narrations")
                ;
                db.ensureIndex(
                    "Narrations",
                    {
                        title: "text"
                    },
                    function(err, indexname)
                    {

                    }
                );
                console.log("Search input is " + request.body.searchInput);
                var narrationsSearched = speakAppNarrationCollection.find
                (
                    { "$text":
                        {
                            "$search": request.body.searchInput
                        }
                    }
                    /*
                    {
                        document: 1,
                        created: 1,
                        _id: 1,
                        textScore: {
                            $meta: "textScore"
                        }
                    },
                    {
                        sort: {
                            textScore: {
                                $meta: "textScore"
                            }
                        }
                    }
                */
                ).toArray();
                Promise.resolve(narrationsSearched).then(function(values){
                    console.log("NARRATIONS SEARCHED ARE " + JSON.stringify(values));
                    response.send(values);
                });
                //console.log("NARRATIONS SEARCHED ARE " + Promise.resolve(narrationsSearched));
                //response.send(Promise.resolve(narrationsSearched));
                db.close();
            }
        )();
    }
);

app.post(
    '/Narrations',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);

        (
            async ()=>{
                var
                    db = await MongoClient.connect(usersUrl),
                    collection = db.collection('Narrations')
                ;

                var result =
                    await collection.insertOne(
                        {
                            title: request.body.title
                        }
                    )
                ;

                    console.log("objectid of narration object is string " + result.insertedId + ", request.body is " + JSON.stringify(request.body));
                    var
                        speakAppUserCollection = db.collection('speakappuser'),
                        user = await getUser(db, request)
                    ;
                    console.log("user is " + user);
                    user.narrationIds = user.narrationIds || [];
                    user.narrationIds.push(result.insertedId);
                    speakAppUserCollection.save(user);
                    response.send(result.insertedId);
                    db.close();
            }
        )();

    }
);


app.post(
    '/saveSlideSwitches',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        //response.json({name: "Nalini Chawla"});
        (
            async ()=>{
            var
                db = await MongoClient.connect(usersUrl),
                speakAppNarrationCollection = db.collection('Narrations'),
                narrationObjectWithMatchingNarrationIdToSlideSwitchesRequestNarrationId = await speakAppNarrationCollection.findOne(
                                    {
                                        _id: new ObjectID(request.body.narrationId)
                                    }
                );

                console.log("narration object matching to audiofileId from client side is " + JSON.stringify(narrationObjectWithMatchingNarrationIdToSlideSwitchesRequestNarrationId));
                narrationObjectWithMatchingNarrationIdToSlideSwitchesRequestNarrationId.slideSwitches = request.body.slideSwitches;

                 //narration.slideSwitches = narration.slideSwitches || [];
                 //narration.slideSwitches.push(request.body.slideSwitches);

                speakAppNarrationCollection.save(narrationObjectWithMatchingNarrationIdToSlideSwitchesRequestNarrationId);
                console.log("narration object after saving slideSwitches is " + JSON.stringify(narrationObjectWithMatchingNarrationIdToSlideSwitchesRequestNarrationId));
                response.send(narrationObjectWithMatchingNarrationIdToSlideSwitchesRequestNarrationId.slideSwitches);
                db.close();
            }
        )();
    }
);

app.post(
    '/login',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);

        (
            async ()=>{

                const db = await MongoClient.connect(usersUrl);

                var
                    narrations = [],
                    galleryItems = [],
                    speakAppNarrationCollection = db.collection('Narrations'),
                    speakAppGalleryItemCollection = db.collection('GalleryItems'),
                    speakAppUserCollection = db.collection('speakappuser'),
                    userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword = await speakAppUserCollection.findOne(
                        {
                            username: request.body.username,
                            password: request.body.password
                        }
                    )
                ;
                if (userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword) {
                    //new ObjectID(value)
                    console.log("USER OBJECT NARRATION IDS ARE " + JSON.stringify(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.narrationIds));
                    if(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.narrationIds) {
                        for (const value of userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.narrationIds) {
                            try {
                                //console.log("finding narration with id " + value);
                                const narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds = await speakAppNarrationCollection.findOne(
                                    {
                                        _id: new ObjectID(value)
                                    }
                                );
                                //narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds.audioFileId = narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds._id;

                                narrations.push(narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds);

                            }
                            catch (e) {
                                console.log("error finding narration with id " + value);
                            }

                        }
                        userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.narrations = narrations;
                        //response.send(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword);
                    }
                    console.log("USER OBJECT GALLERYITEM IDS ARE " + JSON.stringify(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.galleryItemIds));
                    if(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.galleryItemIds) {
                        for (const value of userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.galleryItemIds) {
                            try {
                                //console.log("finding gallery item with id " + value);
                                const galleryItemObjectWithMatchingGalleryItemIdToUserObjectGalleryItemIds = await speakAppGalleryItemCollection.findOne(
                                    {
                                        _id: new ObjectID(value)
                                    }
                                );
                                //galleryItemObjectWithMatchingGalleryItemIdToUserObjectGalleryItemIds.audioFileId = narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds._id;
                                galleryItems.push(galleryItemObjectWithMatchingGalleryItemIdToUserObjectGalleryItemIds);

                            }
                            catch (e) {
                                console.log("error finding galleryItem with id " + value);
                            }

                        }
                        userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.galleryItems = galleryItems;
                        //response.send(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword);

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


                    response.send(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword);
                    //console.log("user is " + JSON.stringify(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword));
                    //console.log("Narration title set at registration in user object is " + JSON.stringify(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.title));
                }
                else{
                    console.log("THIS USERNAME AND/OR PASSWORD DOES NOT EXIST IN THE DATABASE");
                    response.send("Invalid username or password");
                }
                response.end();
                db.close();
            }
        )();
    }
);
app.post(
    '/loginCommentsPage',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        (
            async ()=>{
                var
                    db = await MongoClient.connect(usersUrl),
                    speakAppUserCollection = db.collection('speakappuser'),
                    userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword = await speakAppUserCollection.findOne(
                        {
                            username: request.body.username,
                            password: request.body.password
                        }
                    )
                ;
                if(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword) {
                    var userID = userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword._id;
                    console.log("UserID of comment logged in user is " + userID);
                    response.send(userID);
                }
                else{
                    console.log("THIS USERNAME AND/OR PASSWORD DOES NOT EXIST IN THE DATABASE");
                    response.send("Invalid username or password");
                }
                response.end();
                db.close();
            }
        )();
    }
);

app.post(
    '/updateNarrationsTitle',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        //response.json({name: "Nalini Chawla"});
        (
            async ()=>{
                var
                    db = await MongoClient.connect(usersUrl),
                    speakAppNarrationCollection = db.collection('Narrations'),
                    titleUpdatedNarrations = []
                ;
                for(const value of request.body.narrationIds) {
                    narrationObjectWithMatchingNarrationIdToNarrationOfWhichTitleHasToBeChangedNarrationId = await speakAppNarrationCollection.findOne(
                        {
                            _id: new ObjectID(value)
                        }
                    );

                    //console.log("narration object matching to narrationid of narration of which title has changed from client side is " + JSON.stringify(narrationObjectWithMatchingNarrationIdToNarrationOfWhichTitleHasToBeChangedNarrationId));
                    narrationObjectWithMatchingNarrationIdToNarrationOfWhichTitleHasToBeChangedNarrationId.title = request.body.title;

                    //narration.slideSwitches = narration.slideSwitches || [];
                    //narration.slideSwitches.push(request.body.slideSwitches);

                    speakAppNarrationCollection.save(narrationObjectWithMatchingNarrationIdToNarrationOfWhichTitleHasToBeChangedNarrationId);
                    console.log("narration object after changing title and saving to database is " + JSON.stringify(narrationObjectWithMatchingNarrationIdToNarrationOfWhichTitleHasToBeChangedNarrationId));
                    titleUpdatedNarrations.push(narrationObjectWithMatchingNarrationIdToNarrationOfWhichTitleHasToBeChangedNarrationId);
                    //response.send(narrationObjectWithMatchingNarrationIdToNarrationOfWhichTitleHasToBeChangedNarrationId);
                }
                console.log("Title Updated Narrations are " + JSON.stringify(titleUpdatedNarrations));
                response.send(titleUpdatedNarrations);
                response.end();
                db.close();
            }
        )();
    }

);

app.post(
    '/updateNarrationTitle',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        //response.json({name: "Nalini Chawla"});
        (
            async ()=>{
                var
                    db = await MongoClient.connect(usersUrl),
                    speakAppNarrationCollection = db.collection('Narrations'),
                    narrationObjectWithMatchingNarrationIdToNarrationOfWhichTitleHasChangedNarrationId = await speakAppNarrationCollection.findOne(
                        {
                            _id: new ObjectID(request.body.narrationId)
                        }
                    )
                ;

                //console.log("narration object matching to narrationid of narration of which title has changed from client side is " + JSON.stringify(narrationObjectWithMatchingNarrationIdToNarrationOfWhichTitleHasChangedNarrationId));
                narrationObjectWithMatchingNarrationIdToNarrationOfWhichTitleHasChangedNarrationId.title = request.body.title;

                //narration.slideSwitches = narration.slideSwitches || [];
                //narration.slideSwitches.push(request.body.slideSwitches);

                speakAppNarrationCollection.save(narrationObjectWithMatchingNarrationIdToNarrationOfWhichTitleHasChangedNarrationId);
                console.log("narration object after changing title and saving to database is " + JSON.stringify(narrationObjectWithMatchingNarrationIdToNarrationOfWhichTitleHasChangedNarrationId));
                response.send(narrationObjectWithMatchingNarrationIdToNarrationOfWhichTitleHasChangedNarrationId);
                db.close();
                response.end();
            }
        )();
    }

);

app.post(
    '/publishNarrations',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        //response.json({name: "Nalini Chawla"});
        (
            async ()=>{
                var
                    db = await MongoClient.connect(usersUrl),
                    speakAppNarrationCollection = db.collection('Narrations'),
                    speakAppUserCollection = db.collection('speakappuser'),
                    publishedNarrations = [],
                    narrations = []
                    //narrationIdsArray = new Array(request.body.narrationIds),
                ;

                for (const narrationId of request.body.narrationIds) {
                    const narrationObjectWithMatchingNarrationIdToNarrationIdToPublishFromClient = await speakAppNarrationCollection.findOne(
                        {
                            _id: new ObjectID(narrationId)
                        }
                    );
                    console.log("Narration Object with matching narration id to narration id to publish from client before publishing " + JSON.stringify(narrationObjectWithMatchingNarrationIdToNarrationIdToPublishFromClient));
                    narrationObjectWithMatchingNarrationIdToNarrationIdToPublishFromClient.published = true;
                    await speakAppNarrationCollection.save(narrationObjectWithMatchingNarrationIdToNarrationIdToPublishFromClient);
                    console.log("Published narrations array before before pushing published narration object is " + JSON.stringify(publishedNarrations));
                    publishedNarrations.push(narrationObjectWithMatchingNarrationIdToNarrationIdToPublishFromClient);
                    console.log("Published narrations array after pushing published narration object " + JSON.stringify(publishedNarrations));
                    console.log("Narration object after publishing " + JSON.stringify(narrationObjectWithMatchingNarrationIdToNarrationIdToPublishFromClient));
                    console.log("narration object with id "+narrationId);
                }
                if(request.body.pageName == "recordNarrationPage"){
                    response.send(publishedNarrations);
                }

                var userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword = await speakAppUserCollection.findOne(
                        {
                            username: request.body.username,
                            password: request.body.password
                        }
                    )
                ;
                    //new ObjectID(value)
                console.log("USER OBJECT NARRATION IDS ARE " + JSON.stringify(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.narrationIds));
                if(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.narrationIds) {
                    for (const value of userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.narrationIds) {
                        try {
                            //console.log("finding narration with id " + value);
                            const narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds = await speakAppNarrationCollection.findOne(
                                {
                                    _id: new ObjectID(value)
                                }
                            );
                            //narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds.audioFileId = narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds._id;

                            narrations.push(narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds);

                        }
                        catch (e) {
                            console.log("error finding narration with id " + value);
                        }

                    }
                }
                //var narrations = await speakAppNarrationCollection.find({}).toArray;
                //response.send(publishedNarrationObjects);
                if(request.body.pageName == "userAreaPage"){
                    response.send(narrations);
                }
                db.close();
                response.end();
            }
        )();
    }
);
app.post(
    '/unpublishNarrations',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        //response.json({name: "Nalini Chawla"});
        (
            async ()=>{
                var
                    db = await MongoClient.connect(usersUrl),
                    speakAppNarrationCollection = db.collection('Narrations'),
                    speakAppUserCollection = db.collection('speakappuser'),
                    //narrationIdsArray = new Array(request.body.narrationIds),
                    narrations = []
                ;

                for (var narrationId of request.body.narrationIds) {
                    const narrationObjectWithMatchingNarrationIdToNarrationIdToUnpublishFromClient = await speakAppNarrationCollection.findOne(
                        {
                            _id: new ObjectID(narrationId)
                        }
                    );
                    narrationObjectWithMatchingNarrationIdToNarrationIdToUnpublishFromClient.published = false;
                    await speakAppNarrationCollection.save(narrationObjectWithMatchingNarrationIdToNarrationIdToUnpublishFromClient);
                    //publishedNarrationObjects.push(narrationObjectWithMatchingNarrationIdToNarrationIdToPublishFromClient);


                    console.log("narration object with id "+narrationId);

                }

                var userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword = await speakAppUserCollection.findOne(
                    {
                        username: request.body.username,
                        password: request.body.password
                    }
                    )
                ;
                //new ObjectID(value)
                console.log("USER OBJECT NARRATION IDS ARE " + JSON.stringify(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.narrationIds));
                if(userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.narrationIds) {
                    for (const value of userObjectWithMatchingUsernameAndPasswordToLoginRequestUserNameAndPassword.narrationIds) {
                        try {
                            //console.log("finding narration with id " + value);
                            const narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds = await speakAppNarrationCollection.findOne(
                                {
                                    _id: new ObjectID(value)
                                }
                            );
                            //narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds.audioFileId = narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds._id;

                            narrations.push(narrationObjectWithMatchingNarrationIdToUserObjectNarrationIds);

                        }
                        catch (e) {
                            console.log("error finding narration with id " + value);
                        }

                    }
                }
                //var narrations = await speakAppNarrationCollection.find({}).toArray;
                //response.send(publishedNarrationObjects);
                response.send(narrations);
                db.close();
            }
        )();
    }
);
app.post(
    '/saveComment',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        //response.json({name: "Nalini Chawla"});
        (
            async () => {
            var
                db = await MongoClient.connect(usersUrl),
                speakAppCommentsCollection = db.collection('Comments'),
                timeInMs = Date.now(),
                commentObject =
                    await
                        speakAppCommentsCollection.insertOne(
                            {
                                commentText: request.body.comment,
                                narrationId: request.body.narrationId,
                                userID: request.body.userID,
                                commentTimeInUnixTimestamp: timeInMs
                            }
                        )
                ;
                console.log("Saved comment object in comments collection is " + JSON.stringify(commentObject));
                response.send(commentObject);
                db.close();
            }
        )();
    }
);
app.post(
    '/getAllCommentsForSelectedNarration',
    function (request, response) {
        console.log("REQUEST BODY IS " + JSON.stringify(request.body));
        console.log("REQUEST PATH IS " + request.path);
        //response.json({name: "Nalini Chawla"});
        (
            async () => {
            var
                db = await MongoClient.connect(usersUrl),
                speakAppCommentsCollection = db.collection('Comments'),
                commentObjectsWithMatchingNarrationIdToNarrationSelectedOnPublicAreaNarrationIdOfWhichCommentsNeedToBeViewed = await speakAppCommentsCollection.find(
                    {
                        narrationId: request.body.narrationId
                    }
                ).toArray();
            console.log("Comment Objects matching with narration id of narration selected on public area of which comments want to be viewed are " + JSON.stringify(commentObjectsWithMatchingNarrationIdToNarrationSelectedOnPublicAreaNarrationIdOfWhichCommentsNeedToBeViewed));
            commentObjectsWithMatchingNarrationIdToNarrationSelectedOnPublicAreaNarrationIdOfWhichCommentsNeedToBeViewed.sort(function(a, b)
                {
                    return b.commentTimeInUnixTimestamp - a.commentTimeInUnixTimestamp
                }
            );
            console.log("Sorted Comment Object Array is descending " + JSON.stringify(commentObjectsWithMatchingNarrationIdToNarrationSelectedOnPublicAreaNarrationIdOfWhichCommentsNeedToBeViewed));
            var speakAppUserCollection = db.collection('speakappuser');

            for(const commentObject of commentObjectsWithMatchingNarrationIdToNarrationSelectedOnPublicAreaNarrationIdOfWhichCommentsNeedToBeViewed) {
                const
                    userObject = await speakAppUserCollection.findOne(
                        {
                            _id: new ObjectID(commentObject.userID)
                        }
                    )
                ;
                commentObject.username = userObject.username;
                console.log(JSON.stringify(commentObject.commentText) + "," + JSON.stringify(userObject.username));
            }
            console.log("Comments and usernames are listed together as array " + JSON.stringify(commentObjectsWithMatchingNarrationIdToNarrationSelectedOnPublicAreaNarrationIdOfWhichCommentsNeedToBeViewed));
            response.send(commentObjectsWithMatchingNarrationIdToNarrationSelectedOnPublicAreaNarrationIdOfWhichCommentsNeedToBeViewed);
            db.close();
            }
        )();
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





