'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const Bot = require('messenger-bot');
const requestify= require('requestify');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

let bot = new Bot({
  token: 'EAALAdLRA9ZBYBAEN1tk3dXI4tUKBgB7ctgH5JnOXOmun0JAAUFvav9ZAq6mnakHqjOV8ZAmbvVGI5rfw6RbEODfVZAzZCwP8TZA7EX3ZBAZCAhsZCnCZBcjNZCZCIyIGpvCeg7XXmQtZBe2l2id9yTMZApWutCXZBYwjxoTNmZAgxZAT5g4sCPIZC4oAHA2hVoUZAUZCPYdIGH4ZD',
  verify: 'agricultural',
  app_secret: 'dc009b565123757c59306853177b1b47'
})
 
exports.MYM = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  const sender = request.body.originalDetectIntentRequest.payload.data.sender;
  const senderId = sender.id;  
  console.log('senderid: '+senderId);
  

  function welcome(agent) {  
    return requestify.get('https://graph.facebook.com/'+senderId+'?fields=first_name,last_name,profile_pic&access_token=EAAPBwhpqGfoBAJ3HMGL0mZC9ZCiLvfdj3r1mlNDHWXsYZB0ZBusL6rpwlqdozA0FjhVll3Bb3SYXfB4egoggZCr8iSHPkCFXYzAUKDB4K6BgQJkE6ZBUDZCKtyPIcIONretktWNBcfaGRepZCkKEgaw8VlKFkDmiXP4ieyVxFyvt5wZDZD')
    .then(function (fbprofile){
      let mess = JSON.parse(fbprofile.body);
  console.log("relt:",mess.first_name)
      bot.sendMessage(senderId, {
    "text": `Hi ${mess.first_name}! Ready to meet your makers? 😈`,
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Ye, why not? 😁",
        "payload":"Yes"
      },{
        "content_type":"text",
        "title":"Nahh 😌",
        "payload":"No"
      }
    ]
  }, "","RESPONSE");
      })
  }

  function carousel(agent) {
    bot.sendMessage(senderId, {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Welcome! 😁",
            "image_url":"https://petersfancybrownhats.com/company_image.png",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://petersfancybrownhats.com/view?item=103",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"postback",
                "title":"Click Me 😈",
                "payload":"someshit"
              }              
            ]      
          },
          {
            "title":"yo! 😌",
            "image_url":"https://petersfancybrownhats.com/company_image.png",
            "subtitle":"We have the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://petersfancybrownhats.com/view?item=103",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"someshit"
              }              
            ]      
          }
        ]
      }
    }
  }, "","RESPONSE");
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Carousel', carousel);

  agent.handleRequest(intentMap);
});
