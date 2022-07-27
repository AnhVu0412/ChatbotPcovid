const request = require('request');
require('dotenv').config();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const IMAGE_GET_STARTED = 'https://bit.ly/3y5ykzP';

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
        "uri": "https://graph.facebook.com/v9.0/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
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

let getUserName = (sender_psid) => {
    return new Promise((resolve, reject) => {
        request({
            "uri": `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
            "method": "GET"
        }, (err, res, body) => {
            if (!err) {
                console.log(body);
                body = JSON.parse(body);
                let username = `${body.first_name} ${body.last_name}`;
                resolve(username);
            } else {
                console.error("Unable to send message: " + err);
                reject(err)
            }
        })
    })
}

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let username = await getUserName(sender_psid);
            let response1 = { "text": `Chào mừng bạn ${username} đến với P-Covid` }

            let response2 = getStartedTemplate(sender_psid);

            //send text message
            await callSendAPI(sender_psid, response1);

            //send generic template message
            await callSendAPI(sender_psid, response2);
            resolve('Done');
        } catch {
            reject('Error');
        }
    })
}

let getStartedTemplate = (senderID) => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Xin chào bạn đến với P-Covid",
                    "subtitle": "Dưới đây là các dịch vụ của P-Covid",
                    "image_url": IMAGE_GET_STARTED,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Chi tiết bác sĩ",
                            "payload": "DOCTORS",
                        },
                        {
                            "title": "Đặt lịch hẹn",
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true,
                        },
                        {
                            "type": "postback",
                            "title": "Hướng dẫn sử dụng bot",
                            "payload": "GUIDE_TO_USE_BOT",
                        }
                    ],
                }]
            }
        }
    }
    return response;
}


let sendMessageReplyDoctors = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = {
                "text": "P-Covid Care tự hào mang đến cho bạn đội ngũ bác sĩ hàng đầu, chất lượng và uy tín." +
                    "\n\nMột số bác sĩ tiêu biểu trên P-Covid Care:"
            };

            let response2 = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "GS.TS Phạm Văn Tuấn",
                                "image_url": IMAGE_GET_STARTED,
                                "subtitle": "Y học cổ truyền",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://doctorcare-v1.herokuapp.com/detail/doctor/2",
                                    "webview_height_ratio": "tall"
                                }
                            },
                            {
                                "title": "GS.TS Hoàng Đình Tùng",
                                "image_url": IMAGE_GET_STARTED,
                                "subtitle": "Cơ xương khớp",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://doctorcare-v1.herokuapp.com/detail/doctor/4",
                                    "webview_height_ratio": "tall"
                                }
                            },
                            {
                                "title": "GS.TS Eric Pham",
                                "image_url": IMAGE_GET_STARTED,
                                "subtitle": "Tai mũi họng",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://doctorcare-v1.herokuapp.com/detail/doctor/5",
                                    "webview_height_ratio": "tall"
                                }
                            },
                            {
                                "type": "postback",
                                "title": "Quay trở lại",
                                "payload": "BACK_TO_MENU",
                            }
                        ]
                    }
                }
            };

            // let response3 = {
            //     "text": "Xem thêm thông tin:",
            //     "quick_replies": [
            //         {
            //             "content_type": "text",
            //             "title": "Phòng khám",
            //             "payload": "CLINICS",
            //         },
            //         {
            //             "content_type": "text",
            //             "title": "Chuyên khoa",
            //             "payload": "SPECIALIZATION",
            //         },
            //         {
            //             "content_type": "text",
            //             "title": "Khám bệnh",
            //             "payload": "KHAM_BENH",
            //         },
            //     ]
            // };

            await callSendAPI(sender_psid, response1);
            await callSendAPI(sender_psid, response2);
            //await callSendAPI(sender_psid, response3);

            resolve("ok");
        } catch (e) {
            reject(e);
        }
    });
};

let handleSendMainMenu = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = getStartedTemplate();
            await callSendAPI(sender_psid, response1);

            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

let handleBackToMenu = async (sender_psid) => {
    await handleSendMainMenu(sender_psid);
}

module.exports = {
    callSendAPI: callSendAPI,
    handleGetStarted: handleGetStarted,
    getStartedTemplate: getStartedTemplate,
    handleBackToMenu: handleBackToMenu,
    handleSendMainMenu: handleSendMainMenu,
    sendMessageReplyDoctors: sendMessageReplyDoctors,
}