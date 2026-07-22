'use strict';
let path = require('path'),
  multer = require('multer'),
  randString = require('../services/randString.js');

let storage = multer.diskStorage({
	destination: (req,file,cb) => {
		cb(null,path.join(__dirname,'/../uploads'))
	},
	filename: (req,file,cb) => {
		cb(null, randString.create() + file.originalname)
	} 
});

let upload = multer({
	storage:storage
});
module.exports = upload;
