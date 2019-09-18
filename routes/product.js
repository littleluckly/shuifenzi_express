var express = require("express")
var router = express.Router()
var db = require("../utils/db")

router.get("/list", function(req, res, next) {
  //   console.log(req.query)
  const { pageNo, pageSize } = req.query
  let sql = ""
  let response = {}
  if (pageNo) {
    db.query(
      `select SQL_CALC_FOUND_ROWS * from product limit ${(Number(pageNo) - 1) *
        Number(pageSize)}, ${Number(pageSize)};`,
      (err, data) => {
        if (!err) {
          response = data
          db.query(`SELECT FOUND_ROWS() as total;`, (err, data) => {
            res.send({
              code: 200,
              data: response,
              total: data[0].total
            })
          })
        } else {
          res.send({
            code: 500
          })
        }
      }
    )
  } else {
    sql = `select * from product`
    console.log(sql)
    db.query(sql, function(err, data) {
      console.log(err)
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
  }
})
module.exports = router
