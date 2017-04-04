var moment = require('moment')
var helper = require('../helpers/helper.js')
var validator = require('validator')
var bcrypt = require('bcrypt-nodejs');
var request = require('request');

var headers = {
    'Accept':       'application/json',
    'Content-Type':     'application/json',
    'Authorization': 'Basic VlQtc2VydmVyLVU0SGw5cU1Nb1FxelFoRklKTEhlcHY4RTo='
}

var form = {
  "transaction_details": {
    "order_id": "ORDER-101",
    "gross_amount": 10000
  }
}

var options = {
    url: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
    method: 'POST',
    headers: headers,
    form: form
}

const QUERY = {
  SELECT_CORPORATE_BY_ID : "SELECT mt_corp.id, mt_corp.name, mt_corp.dt_created, user.fullName FROM mt_corp INNER JOIN user on mt_corp.created_by = user.id WHERE mt_corp.id = ?",
  SELECT_USER_BY_USERNAME_AND_CORP_ID : "SELECT username, role, fullName, phone, email FROM USER WHERE username = ? AND corpId = ?",
  SELECT_CORPORATE_USER_BY_CORP_ID : "SELECT id,username, role, fullName, phone, email FROM USER where corpId = ?",
  ADD_NEW_CORPORATE_USER : "INSERT INTO USER SET ?",
  DELETE_CORPORATE_USER: "DELETE FROM USER WHERE ID = ?"
}

module.exports = {
  getAdd          : getAdd,
  postAdd         : postAdd,
  deleteCorpUser  : deleteCorpUser,
}

function getAdd(req,res,next){
  request(options, function (error, response, token) {
    if(error)console.log(error);
    if (!error && response.statusCode == 201) {
        // Print out the response body
        res.render('payment/paymentAdd.ejs',{
      		user : req.user,
          token: token,
          message: ''
        })
    }
  })
}

function postAdd(req,res,next){
  var token = JSON.parse(decodeURIComponent(req.body.token))
  console.log(req.body);
  console.log(token);
}

function deleteCorpUser(req,res,next){
  var corpUserId = req.query.corpUserId,
      corpId     = req.query.corpId
  req.getConnection(function(err,connection){
    connection.query(QUERY.DELETE_CORPORATE_USER, [corpUserId], function(err, rows){
      if(err)console.log(err)
      req.getConnection(function(err,connection){
        connection.query(QUERY.SELECT_CORPORATE_BY_ID,[corpId], function(err, corporateDetail){
          if(err)console.log(err)
          connection.query(QUERY.SELECT_CORPORATE_USER_BY_CORP_ID,[corpId], function(err, corporateUserList){
            if(err)console.log(err)
            console.log(corporateUserList);
            res.render('corporate/corporateDetail.ejs',{
              user : req.user,
              corporateDetail : corporateDetail,
              corporateUserList : corporateUserList,
              moment : moment,
              message : ''
              })
          })
        })
      })
    })
  })
}
