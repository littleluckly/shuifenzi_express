var express = require("express")
var router = express.Router()
var db = require("../utils/db")

router.get("/list", function(req, res, next) {
  db.query("select * from product", function(err, data) {
    if (!err) {
      res.send({
        code: 200,
        data
      })
    } else {
      res.send({
        code: 500,
        status: "error"
      })
    }
  })
})
module.exports = router
