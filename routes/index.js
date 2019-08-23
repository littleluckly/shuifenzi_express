const path = require("path")
var express = require("express")
var router = express.Router()
router.get("/", function(req, res, next) {
  //   res.render("index", { title: "Express" })
  res.send("hello world!")
})

module.exports = router
