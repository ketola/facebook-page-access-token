var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')

var app = express()

app.use(express.static('static'))
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

var appSecret = 'APP-SECRET-HERE'

// the web page will post here the user token / short lived token
app.post('/access_token', function (req, res) {
  console.log('Short lived token: ' + req.body.token)
  console.log('User Id: ' + req.body.userId)

  var token = req.body.token
  var userId = req.body.userId
  var url = 'https://graph.facebook.com/v2.10/oauth/access_token?grant_type=fb_exchange_token&client_id=349839645446838&client_secret='+appSecret+'&fb_exchange_token='+token

  // request the long lived token
  request.get(url,
    function (error, response, body) {
      var longLivedToken = JSON.parse(body).access_token
      console.log('Long lived token: ' + longLivedToken)

      var pageTokenUrl = 'https://graph.facebook.com/v2.10/'+userId+'/accounts?access_token=' + longLivedToken
      // request the eternal page access token
      request.get(pageTokenUrl,
        function(error, response, body){
          var eternalToken = JSON.parse(body).data[0].access_token
          console.log('****************** Eternal token: **************')
          console.log(eternalToken)
          console.log('************************************************')

          // read something using the token
          var conversationUrl = 'https://graph.facebook.com/v2.10/t_mid.$cAAVNMMRYjEVkFx6AsFd5dk3Z-otq/messages?access_token='+eternalToken+'&debug=all&fields=message%2Ccreated_time%2Cto%2Cfrom&format=json&method=get&pretty=0&suppress_http_code=1'
          request.get(conversationUrl,
            function(error, response, body){
              console.log(body)
              res.send('Great success')
            }
          )
        }
      )
    }
  )
})

app.listen(3000)
