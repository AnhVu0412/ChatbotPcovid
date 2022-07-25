require('dotenv').config();
import request from 'request';
import chatbotService from '../services/chatbotService';

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

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
                handleMessage(sender_psid, webhook_event.message);
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

async function handleMessage(sender_psid, received_message) {
    if (received_message.sticker_id) {
        await callSendAPI(sender_psid, "Cảm ơn bạn đã sử dụng dịch vụ của P-Covid Care !!!");
        return;
    }
    //checking quick reply
    if (received_message && received_message.quick_reply && received_message.quick_reply.payload) {
        let payload = received_message.quick_reply.payload;
        if (payload === "DOCTORS") {
            await chatbotService.sendMessageReplyDoctors(sender_psid);
            return;
        }
        // } else if (payload === "DOCTORS") {
        //     await sendMessageReplyDoctors(sender_psid);
        //     return;
        // } else if (payload === "CLINICS") {
        //     await sendMessageReplyClinics(sender_psid);
        //     return;
        // } else if (payload === "SPECIALIZATION") {
        //     await sendMessageReplySpecialization(sender_psid);
        //     return;
        // }
    }


    let name = "";
    let entityCheck = {};
    let arrPossibleEntity = [ 'intent', 'booking', 'info' ];
    for (let i = 0; i < arrPossibleEntity.length; i++) {
        let entity = firstEntity(received_message.nlp, arrPossibleEntity[i]);
        if (entity && entity.confidence > 0.8) {
            name = arrPossibleEntity[i];
            entityCheck = entity;
            break;
        }
    }
    await handleEntity(name, sender_psid, entityCheck);
}

let handleEntity = async (name, sender_psid, entity) => {
    switch (name) {
        case "intent":
            if (entity.value === 'doctors') {
                await callSendAPI(sender_psid, "Bạn đang tìm kiếm thông tin về bác sĩ, xem thêm ở link bên dưới nhé.");
                let title = "P-Covid Care";
                let subtitle = 'Thông tin bác sĩ làm việc tại P-Covid Care';
                //await callSendAPIv2(sender_psid, title, subtitle, DOCTOR_IMAGE_URL, DOCTOR_URL);
                await chatbotService.getStartedTemplate(sender_psid, "Xem thêm thông tin:");
            }
            if (entity.value === 'tiêu hóa') {
                await callSendAPI(sender_psid, "Bạn đang gặp vấn đề về bệnh đường tiêu hóa, xem thêm danh sách bác sĩ chuyên khoa TIÊU HÓA.");
                let title = "Chuyên khoa khám bệnh";
                let subtitle = 'Thông tin bác sĩ chuyên khoa tiêu hóa';
                //await callSendAPIv2(sender_psid, title, subtitle, TIEUHOA_IMAGE_URL, TIEUHOA_URL);
                await chatbotService.getStartedTemplate(sender_psid, "Xem thêm thông tin:");
            }
            if (entity.value === 'cơ-xương-khớp') {
                await callSendAPI(sender_psid, "Bạn đang gặp vấn đề về cơ-xương-khớp, xem thêm danh sách bác sĩ chuyên khoa CƠ XƯƠNG KHỚP.");
                let title = "Chuyên khoa khám bệnh";
                let subtitle = 'Thông tin bác sĩ chuyên khoa cơ-xương-khớp';
                //await callSendAPIv2(sender_psid, title, subtitle, COXUONGKHOP_IMAGE_URL, COXUONGKHOP_URL);
                await chatbotService.getStartedTemplate(sender_psid, "Xem thêm thông tin:");
            }
            break;
        // case"booking":
        //     await callSendAPI(sender_psid, "Bạn đang cần đặt lịch khám bệnh, xem thêm hướng dẫn đặt lịch chi tiết ở link bên dưới nhé.");
        //     await callSendAPIv2(sender_psid, "Đặt lịch khám bệnh", "Hướng dẫn đặt lịch khám bệnh tại P-Covid Care", BOOKING_IMAGE_URL, BOOKING_URL);
        //     await sendMessageDefault(sender_psid, "Xem thêm thông tin:");
        //     break;
        // case"info":
        //     await callSendAPI(sender_psid, "Bạn đang tìm hiểu về thông tin website, xem thêm ở link bên dưới nhé.");
        //     await callSendAPIv2(sender_psid, "Thông tin website", "Thông tin website P-Covid Care", INFOWEBSITE_IMAGE_URL, INFOWEBSITE_URL);
        //     await sendMessageDefault(sender_psid, "Xem thêm thông tin:");
        //     break;
        default:
            await callSendAPI(sender_psid, "Rất tiếc bot chưa được hướng dẫn để trả lời câu hỏi của bạn. Để được hỗ trợ, vui lòng truy câp:");
            await callSendAPIv2(sender_psid, "Hỗ trợ khách hàng", "Thông tin hỗ trợ khách hàng P-Covid Care", DEFAULT_IMAGE_URL, DEFAULT_URL);
            await sendMessageDefault(sender_psid, "Xem thêm thông tin:");
    }
};

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    switch (payload) {
        case 'RESTART_BOT':
        case 'GET_STARTED':
            await chatbotService.handleGetStarted(sender_psid);
            break;
        // case 'DOCTOR_DETAIL':
        //     await chatbotService.handleDetailDoctor(sender_psid);
        //     break;
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
        case "ALL_DOCTORS":
            await chatbotService.sendMessageAllDoctors(sender_psid);
            break;
        case "ALL_CLINICS":
            await chatbotService.sendMessageAllClinics(sender_psid);
            break;
        case "ALL_SPECIALIZATION":
            await chatbotService.sendMessageAllSpecializations(sender_psid);
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
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

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