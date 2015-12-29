var express = require('express');
var router = express.Router();
var controller = require('./../controller');
var fs = require('fs');


router.get('/:path', function(req, res) {
  var path = decodeURIComponent(req.params.path);

  controller.serveRawFile(path, res);
});

module.exports = router;