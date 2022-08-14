require('dotenv').config();
const request = require('request');
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

let callSendAPI = (sender_psid, message) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Construct the message body
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "message": response
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

// let firstEntity = (nlp, name) => {
//     return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
// };

// let handleEntity = async (name, sender_psid, entity) => {
//     switch (name) {
//         case "intent":
//             if (entity.value === 'doctors') {
//                 await callSendAPI(sender_psid, "Bạn đang tìm kiếm thông tin về bác sĩ, xem thêm ở link bên dưới nhé.");
//                 let title = "P-Covid Care";
//                 let subtitle = 'Thông tin bác sĩ làm việc tại P-Covid Care';
//                 // await callSendAPIv2(sender_psid, title, subtitle, DOCTOR_IMAGE_URL, DOCTOR_URL);
//             }
//             break;
//         case "booking":
//             await callSendAPI(sender_psid, "Bạn đang cần đặt lịch khám bệnh, xem thêm hướng dẫn đặt lịch chi tiết ở link bên dưới nhé.");
//             // await callSendAPIv2(sender_psid, "Đặt lịch khám bệnh", "Hướng dẫn đặt lịch khám bệnh tại P-Covid Care", BOOKING_IMAGE_URL, BOOKING_URL);
//         case "info":
//             await callSendAPI(sender_psid, "Bạn đang tìm hiểu về thông tin website, xem thêm ở link bên dưới nhé.");
//             // await callSendAPIv2(sender_psid, "Thông tin website", "Thông tin website P-Covid Care", INFOWEBSITE_IMAGE_URL, INFOWEBSITE_URL);
//         default:
//             await callSendAPI(sender_psid, "Rất tiếc bot chưa được hướng dẫn để trả lời câu hỏi của bạn. Để được hỗ trợ, vui lòng truy câp:");
//             // await callSendAPIv2(sender_psid, "Hỗ trợ khách hàng", "Thông tin hỗ trợ khách hàng P-Covid Care", DEFAULT_IMAGE_URL, DEFAULT_URL);
//     }
// };


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
            await callSendAPI(sender_psid, response1);
            await callSendAPI(sender_psid, response2);
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
    handleGetStarted: handleGetStarted,
    //firstEntity: firstEntity,
    callSendAPI: callSendAPI,
    //handleEntity: handleEntity,
    getStartedTemplate: getStartedTemplate,
    handleBackToMenu: handleBackToMenu,
    handleSendMainMenu: handleSendMainMenu,
    sendMessageReplyDoctors: sendMessageReplyDoctors,
}