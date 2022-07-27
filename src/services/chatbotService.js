const request = require('request');
require('dotenv').config();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const IMAGE_GET_STARTED = 'https://bit.ly/3y5ykzP';

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

let handlePostback = (sender_psid, received_postback) => {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    switch (payload) {
        case 'RESTART_BOT':
        case 'GET_STARTED':
            handleGetStarted(sender_psid);
            break;
        case 'BACK_TO_MENU':
            handleBackToMenu(sender_psid);
            break;
        case "DOCTORS":
            sendMessageReplyDoctors(sender_psid);
            break;
        // case "CLINICS":
        //     await sendMessageReplyClinics(sender_psid);
        //     break;
        // case "SPECIALIZATION":
        //     await sendMessageReplySpecialization(sender_psid);
        //     break;
        // case "CUSTOMER_SERVICE":
        //     await chatWithCustomerService(sender_psid);
        //     break;
        // case "yes":
        //     response = "Thanks!";
        //     // Send the message to acknowledge the postback
        //     await callSendAPI(sender_psid, response);
        //     resolve("OK");
        //     break;
        // case "no":
        //     response = "Oops, try sending another image.";
        //     // Send the message to acknowledge the postback
        //     await callSendAPI(sender_psid, response);
        //     resolve("OK");
        //     break;
        default:
            response = { "text": `Sorry, I didn't understand response with postback ${payload}.` };
    }
    // Send the message to acknowledge the postback
    //callSendAPI(sender_psid, response);
}

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
//         "uri": "https://graph.facebook.com/v9.0/me/messages",
//         "qs": { "access_token": PAGE_ACCESS_TOKEN },
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
        } catch (e) {
            reject(e);
        }
    });
};

let callSendAPIv2 = (sender_psid, title, subtitle, imageUrl, redirectUrl) => {
    return new Promise(async (resolve, reject) => {
        try {
            await markMessageSeen(sender_psid);
            await sendTypingOn(sender_psid);
            let body = {
                "recipient": {
                    "id": sender_psid
                },
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [
                                {
                                    "title": title,
                                    "image_url": imageUrl,
                                    "subtitle": subtitle,
                                    "default_action": {
                                        "type": "web_url",
                                        "url": redirectUrl,
                                        "webview_height_ratio": "tall",
                                    },
                                    "buttons": [
                                        {
                                            "type": "web_url",
                                            "url": redirectUrl,
                                            "title": "Xem chi tiết"
                                        },
                                    ]
                                }
                            ]
                        }
                    }
                }
            };

            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": body
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
    })

};

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

let firstEntity = (nlp, name) => {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
};

let handleMessage = async (sender_psid, received_message) => {
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
                await callSendAPIv2(sender_psid, title, subtitle, DOCTOR_IMAGE_URL, DOCTOR_URL);
            }
            break;
        case "booking":
            await callSendAPI(sender_psid, "Bạn đang cần đặt lịch khám bệnh, xem thêm hướng dẫn đặt lịch chi tiết ở link bên dưới nhé.");
            await callSendAPIv2(sender_psid, "Đặt lịch khám bệnh", "Hướng dẫn đặt lịch khám bệnh tại P-Covid Care", BOOKING_IMAGE_URL, BOOKING_URL);
        case "info":
            await callSendAPI(sender_psid, "Bạn đang tìm hiểu về thông tin website, xem thêm ở link bên dưới nhé.");
            await callSendAPIv2(sender_psid, "Thông tin website", "Thông tin website P-Covid Care", INFOWEBSITE_IMAGE_URL, INFOWEBSITE_URL);
        default:
            await callSendAPI(sender_psid, "Rất tiếc bot chưa được hướng dẫn để trả lời câu hỏi của bạn. Để được hỗ trợ, vui lòng truy câp:");
            await callSendAPIv2(sender_psid, "Hỗ trợ khách hàng", "Thông tin hỗ trợ khách hàng P-Covid Care", DEFAULT_IMAGE_URL, DEFAULT_URL);
    }
};

let sendMessage = (sender_psid, response) => {
    return new Promise(async (resolve, reject) => {
        try {
            await markMessageSeen(sender_psid);
            await sendTypingOn(sender_psid);
            // Construct the message body
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "message": response,
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                console.log(body)
                if (!err) {
                    resolve("ok")
                } else {
                    reject(err);
                }
            });
        } catch (e) {
            reject(e);
        }
    })
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
                                "image_url": "https://doctorcare-v1.herokuapp.com/images/users/doctor.jpg",
                                "subtitle": "Y học cổ truyền",
                                // "default_action": {
                                //     "type": "web_url",
                                //     "url": "https://doctorcare-v1.herokuapp.com/detail/doctor/2",
                                //     "webview_height_ratio": "tall"
                                // }
                            },

                            {
                                "title": "GS.TS Hoàng Đình Tùng",
                                "image_url": "https://doctorcare-v1.herokuapp.com/images/users/doctor-hoang-dinh-tung.jpg",
                                "subtitle": "Cơ xương khớp",
                                // "default_action": {
                                //     "type": "web_url",
                                //     "url": "https://doctorcare-v1.herokuapp.com/detail/doctor/4",
                                //     "webview_height_ratio": "tall"
                                // }
                            },
                            {
                                "title": "GS.TS Eric Pham",
                                "image_url": "https://doctorcare-v1.herokuapp.com/images/users/doctor-eric-pham.jpg",
                                "subtitle": "Tai mũi họng",
                                // "default_action": {
                                //     "type": "web_url",
                                //     "url": "https://doctorcare-v1.herokuapp.com/detail/doctor/5",
                                //     "webview_height_ratio": "tall"
                                // }
                            },
                            {
                                
                                "title": "Quay trở lại",
                                "subtitle": "Quay trở lại Menu chính",
                                "buttons": [
                                    {
                                        "type": "postback",
                                        "title": "Quay trở lại",
                                        "payload": "BACK_TO_MENU"
                                    }
                                ]
                            }
                            
                        ]
                    }
                }
            };

            await sendMessage(sender_psid, response1);
            await sendMessage(sender_psid, response2);
            
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
    handleMessage: handleMessage,
    handlePostback: handlePostback,
    getStartedTemplate: getStartedTemplate,
    handleBackToMenu: handleBackToMenu,
    handleSendMainMenu: handleSendMainMenu,
    sendMessageReplyDoctors: sendMessageReplyDoctors,
}