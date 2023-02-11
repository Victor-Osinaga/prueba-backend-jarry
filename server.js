const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const folderPath = "./uploads";

const app = express();
const upload = multer({ dest: "uploads/" });

const firebase = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    storageBucket: "gs://jarry-imagenes-prueba.appspot.com"
});

const deleteFolderRecursive = folderPath => {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            const currentPath = path.join(folderPath, file);
            if (fs.lstatSync(currentPath).isDirectory()) {
                deleteFolderRecursive(currentPath);
            } else {
                fs.unlinkSync(currentPath);
            }
        });
        fs.rmdirSync(folderPath);
    }
};

app.post("/upload", upload.single("image"), (req, res) => {
    const file = req.file;
    const bucket = firebase.storage().bucket();
    const newFileName = `${Date.now()}-${file.originalname}`;

    bucket.upload(file.path, {
        destination: newFileName,
        public: true
    }).then(() => {
        deleteFolderRecursive(folderPath);
        console.log(`The folder "${folderPath}" and its contents have been deleted.`);
    }).catch(error => {
        res.status(500).send(error);
    });

    const fileNew = bucket.file(newFileName);

    fileNew.getSignedUrl({
        action: "read",
        expires: "03-09-2491"
    }).then(signedUrls => {
        const url = signedUrls[0];
        console.log(`La URL de la imagen es: ${url}`);
        res.status(200).json({status: "File uploaded successfully.", url: url});
    }).catch(err => {
        console.error(`Error al obtener la URL: ${err}`);
    });
    
});

app.listen(3000, () => {
    console.log("Server running on port 3000.");
});







// const express = require("express");
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");

// const folderPath = "./uploads";

// const app = express();
// const upload = multer({ dest: "uploads/" });

// const firebase = require("firebase-admin");
// const serviceAccount = require("./serviceAccountKey.json");

// firebase.initializeApp({
//     credential: firebase.credential.cert(serviceAccount),
//     storageBucket: "gs://jarry-imagenes-prueba.appspot.com"
// });

// const deleteFolderRecursive = folderPath => {
//     if (fs.existsSync(folderPath)) {
//         fs.readdirSync(folderPath).forEach(file => {
//             const currentPath = path.join(folderPath, file);
//             if (fs.lstatSync(currentPath).isDirectory()) {
//                 deleteFolderRecursive(currentPath);
//             } else {
//                 fs.unlinkSync(currentPath);
//             }
//         });
//         fs.rmdirSync(folderPath);
//     }
// };

// app.post("/upload", upload.single("image"), (req, res) => {
//     const file = req.file;
//     const bucket = firebase.storage().bucket();
//     const newFileName = `${Date.now()}-${file.originalname}`;

//     bucket.upload(file.path, {
//         destination: newFileName,
//         public: true
//     }).then(() => {
//         const fileNew = bucket.file(newFileName);

//         fileNew.getSignedUrl({
//             action: "read",
//             expires: "03-09-2491"
//         }).then(signedUrls => {
//             const url = signedUrls[0];
//             console.log(`La URL de la imagen es: ${url}`);
//             deleteFolderRecursive(folderPath);
//             console.log(`The folder "${folderPath}" and its contents have been deleted.`);
//             res.status(200).send("File uploaded successfully." + url);
//         }).catch(err => {
//             console.error(`Error al obtener la URL: ${err}`);
//         });
//     }).catch(error => {
//         res.status(500).send(error);
//     });

    

// });

// app.listen(3000, () => {
//     console.log("Server running on port 3000.");
// });