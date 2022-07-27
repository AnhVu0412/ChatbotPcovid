require('dotenv').config();
import request from 'request';
import chatbotService from '../services/chatbotService';

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const WEBVIEW_URL = process.env.WEBVIEW_URL;

const DOCTOR_IMAGE_URL = "https://bralowmedicalgroup.com/wp-content/uploads/2018/06/blog.jpg";
const DOCTOR_URL = "https://doctorcare-v1.herokuapp.com/";

const BOOKING_IMAGE_URL = "http://ipright.vn/wp-content/uploads/2014/03/36322201-procedure-word-write-on-paper-Stock-Photo-1200x545_c.jpg";
const BOOKING_URL = "https://doctorcare-v1.herokuapp.com/";

const COXUONGKHOP_IMAGE_URL = "https://cdn.pixabay.com/photo/2015/10/31/11/59/information-1015298_960_720.jpg";
const COXUONGKHOP_URL = "https://doctorcare-v1.herokuapp.com/";

const TIEUHOA_IMAGE_URL = "https://cdn.pixabay.com/photo/2015/10/31/11/59/information-1015298_960_720.jpg";
const TIEUHOA_URL = "https://doctorcare-v1.herokuapp.com/";

const INFOWEBSITE_IMAGE_URL = "https://cdn.pixabay.com/photo/2015/10/31/11/59/information-1015298_960_720.jpg";
const INFOWEBSITE_URL = "https://doctorcare-v1.herokuapp.com/";

const DEFAULT_IMAGE_URL = "https://www.freseniusmedicalcare.com.vn/fileadmin/_processed_/5/4/csm_SPE001_service-support-employee_7614d83ad5.jpg";
const DEFAULT_URL = "https://doctorcare-v1.herokuapp.com/";

let getHomePage = (req, res) => {
    return res.render('homepage.ejs');
};

let postWebhook = (req, res) => {
    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {
            // Gets the body of the webhook event
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                chatbotService.handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
}

let getWebhook = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
}

// Handles messaging_postbacks events
async function handlePostback (sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    switch (payload) {
        case 'RESTART_BOT':
        case 'GET_STARTED':
            await chatbotService.handleGetStarted(sender_psid);
            break;
        case 'BACK_TO_MENU':
            await chatbotService.handleBackToMenu(sender_psid);
            break;
        case "DOCTORS":
            await chatbotService.sendMessageReplyDoctors(sender_psid);
            break;
        case "CLINICS":
            await chatbotService.sendMessageReplyClinics(sender_psid);
            break;
        case "SPECIALIZATION":
            await chatbotService.sendMessageReplySpecialization(sender_psid);
            break;
        case "CUSTOMER_SERVICE":
            await chatbotService.chatWithCustomerService(sender_psid);
            break;
        case "yes":
            response = "Thanks!";
            // Send the message to acknowledge the postback
            await callSendAPI(sender_psid, response);
            resolve("OK");
            break;
        case "no":
            response = "Oops, try sending another image.";
            // Send the message to acknowledge the postback
            await callSendAPI(sender_psid, response);
            resolve("OK");
            break;
        default:
            response = { "text": `Sorry, I didn't understand response with postback ${payload}.` };
    }
    // Send the message to acknowledge the postback
    //callSendAPI(sender_psid, response);
}

//Sends response messages via the Send API
// function callSendAPI(sender_psid, response) {
//     // Construct the message body
//     let request_body = {
//         "recipient": {
//             "id": sender_psid
//         },
//         "message": response
//     }

//     // Send the HTTP request to the Messenger Platform
//     request({
//         "uri": "https://graph.facebook.com/v2.6/me/messages",
//         "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
//         "method": "POST",
//         "json": request_body
//     }, (err, res, body) => {
//         if (!err) {
//             console.log('message sent!')
//         } else {
//             console.error("Unable to send message:" + err);
//         }
//     });
// }

let callSendAPI = (sender_psid, message) => {
    return new Promise(async (resolve, reject) => {
        try {
            await markMessageSeen(sender_psid);
            await sendTypingOn(sender_psid);
            // Construct the message body
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "message": {
                    "text": message
                }
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve("ok");
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

let markMessageSeen = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "sender_action": "mark_seen"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve('done!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

let sendTypingOn = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "sender_action": "typing_on"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve('done!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

let setUpProfile = async (req, res) => {
    //call profile facebook api
    let request_body = {
        "get_started": { "payload": "GET_STARTED" },
        "whitelisted_domains": ["https://p-covid-care-bot-g26.herokuapp.com/"]
    }

    // Send the HTTP request to the Messenger Platform
    await request({
        "uri": `https://graph.facebook.com/v14.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        console.log(body);
        if (!err) {
            console.log('Setup user profile success!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });

    return res.send("Setup user profile success");
}

let setUpPersistentMenu = async (req, res) => {
    //call profile facebook api
    let request_body = {
        "persistent_menu": [
            {
                "locale": "default",
                "composer_input_disabled": false,
                "call_to_actions": [
                    {
                        "type": "web_url",
                        "title": "Website P-Covid Care",
                        "url": "https://p-covid-care-bot-g26.herokuapp.com/",
                    },
                    {
                        "type": "postback",
                        "title": "Khởi động lại bot ",
                        "payload": "RESTART_BOT"
                    }
                ]
            }
        ]
    }

    // Send the HTTP request to the Messenger Platform
    await request({
        "uri": `https://graph.facebook.com/v14.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        console.log(body);
        if (!err) {
            console.log('Setup persistent menu success!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });

    return res.send("Setup persistent menu success");
}

let handleMakeAppointment = (req, res) => {
    let senderId = req.params.senderId;
    return res.render('make-appointment.ejs', {
        senderId: senderId
    });
}

let handlePostMakeAppointment = async (req, res) => {
    try {
        let customerName = "";
        if (req.body.customerName === "") {
            customerName = "Để trống";
        } else customerName = req.body.customerName;

        // I demo response with sample text
        // you can check database for customer order's status

        let response1 = {
            "text": `---Thông tin của khách hàng đặt lịch---
            \nHọ và tên: ${customerName}
            \nĐịa chỉ email: ${req.body.email}
            \nSố điện thoại: ${req.body.phoneNumber}
            `
        };

        await chatbotService.callSendAPI(req.body.psid, response1);

        console.log(req.body);

        return res.status(200).json({
            message: "ok"
        });
    } catch (e) {
        return res.status(500).json({
            message: "Server error"
        });
    }
}

module.exports = {
    getHomePage: getHomePage,
    postWebhook: postWebhook,
    getWebhook: getWebhook,
    setUpProfile: setUpProfile,
    setUpPersistentMenu: setUpPersistentMenu,
    handleMakeAppointment: handleMakeAppointment,
    handlePostMakeAppointment: handlePostMakeAppointment
}