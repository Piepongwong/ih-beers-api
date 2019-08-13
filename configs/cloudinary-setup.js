const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require("dotenv");
const Beer = require("../models/Beer");
dotenv.config();

cloudinary.config({
  cloud_name: process.env.cloudName,
  api_key: process.env.cloudKey,
  api_secret: process.env.cloudSecret
});

var storage = cloudinaryStorage({
  cloudinary,
  folder: 'thing-gallery', // The name of the folder in cloudinary
  allowedFormats: ['jpg', 'png'],
  // params: { resource_type: 'raw' }, => this is in case you want to upload other type of files, not just images
  filename: function (req, res, cb) {
    cb(null, res.originalname); // The file on cloudinary would have the same name as the original file name
  }
});

module.exports = {
    beerUploader: multer({ storage})
};

function fileFilger(req,file,cb){
    let newBeer = new Beer(req.body);
    newBeer
        .validate()
        .then(()=> {
            cb(null, true)
        })
        .catch((error)=> {
            cb(error.message, false)
        })
} 