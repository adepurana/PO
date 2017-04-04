var moment = require('moment')
var helper = require('../helpers/helper.js')
var validator = require('validator')

const QUERY = {
  SELECT_ALL_CORPORATE : "SELECT mt_corp.id, mt_corp.name, mt_corp.dt_created, user.fullName FROM mt_corp INNER JOIN user on mt_corp.created_by = user.id",
  SELECT_CORPORATE_BY_NAME : "SELECT mt_corp.id, mt_corp.name, mt_corp.dt_created, user.fullName FROM mt_corp INNER JOIN user on mt_corp.created_by = user.id WHERE mt_corp.name = ?",
  SELECT_CORPORATE_BY_ID : "SELECT mt_corp.id, mt_corp.name, mt_corp.dt_created, user.fullName FROM mt_corp INNER JOIN user on mt_corp.created_by = user.id WHERE mt_corp.id = ?",
  SELECT_CORPORATE_USER_BY_CORP_ID : "SELECT id,username, role, fullName, phone, email FROM USER where corpId = ?",
  ADD_NEW_CORPORATE : "INSERT INTO mt_corp SET ?",
  DELETE_CORPORATE : "DELETE FROM mt_corp WHERE ID = ?"
}

module.exports = {
  getList       : getList,
  getAdd        : getAdd,
  postAdd       : postAdd,
  deleteCorp    : deleteCorp,
  detailCorp    : detailCorp
}

function getList(req,res,next){
  req.getConnection(function(err,connection){
    connection.query(QUERY.SELECT_ALL_CORPORATE, function(err, corporateList){
        res.render('corporate/corporateList.ejs',{
      		user : req.user,
          corporateList : corporateList,
          moment : moment,
          message : ''
      	})
    })
  })
}

function getAdd(req,res,next){
  res.render('corporate/corporateAdd.ejs',{
		user : req.user,
    message: ''
	})
}

function postAdd(req,res,next){
  //validation
  var message = []
  if(validator.isEmpty(req.body.name))message.push('Name is mandatory field')
  if(message.length>0){
    res.render('corporate/corporateAdd.ejs',{
      user : req.user,
      message : message
    })
  }
  else{
    //pass mandatory check . will continue to duplicate check
    req.getConnection(function(err,connection){
      connection.query(QUERY.SELECT_CORPORATE_BY_NAME,[req.body.name], function(err, corporate){
        if(err)console.log(err)
        if(corporate.length>0){
          message.push("Data is duplicated")
          res.render('corporate/corporateAdd.ejs',{
            user : req.user,
            message : message
          })
        }
        //pass duplicate check, continue to adding new record
        else{
          var newCorporate = {
              id: helper.generateUUID(),
              name: req.body.name,
              dt_created: new Date(),
              created_by: req.user.id
          }
          req.getConnection(function(err,connection){
            connection.query(QUERY.ADD_NEW_CORPORATE, newCorporate, function(err, rows){
              if(err)console.log(err)
              req.getConnection(function(err,connection){
                connection.query(QUERY.SELECT_ALL_CORPORATE, function(err, corporateList){
                    //render getList with message
                    res.render('corporate/corporateList.ejs',{
                  		user : req.user,
                      corporateList : corporateList,
                      moment : moment,
                      message : `Corporate ${req.body.name} has been successfully added`
                  	})
                })
              })
            })
          })
        }
      })
    })
  }
}

function deleteCorp(req,res,next){
  var corpId = req.params.id
  req.getConnection(function(err,connection){
    connection.query(QUERY.DELETE_CORPORATE, [corpId], function(err, rows){
      if(err)console.log(err)
      connection.query(QUERY.SELECT_ALL_CORPORATE, function(err, corporateList){
          res.render('corporate/corporateList.ejs',{
        		user : req.user,
            corporateList : corporateList,
            moment : moment,
            message : 'Record has been successfully deleted'
        	})
      })
    })
  })
}

function detailCorp(req,res,next){
  var corpId = req.params.id
  req.getConnection(function(err,connection){
    connection.query(QUERY.SELECT_CORPORATE_BY_ID,[corpId], function(err, corporateDetail){
      if(err)console.log(err)
      connection.query(QUERY.SELECT_CORPORATE_USER_BY_CORP_ID,[corpId], function(err, corporateUserList){
        if(err)console.log(err)
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
}
