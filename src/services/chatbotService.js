require('dotenv').config();
const request = require('request');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const WIT_SERVER_TOKEN = process.env.WIT_AI_SERVER_TOKEN;
const IMAGE_GET_STARTED = 'https://bit.ly/3y5ykzP';

const DOCTOR_IMAGE_URL = "https://bralowmedicalgroup.com/wp-content/uploads/2018/06/blog.jpg";
const DOCTOR_URL = "https://p-covid-care-g26.herokuapp.com/";

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

let callSendAPI = (sender_psid, response) => {
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

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let username = await getUserName(sender_psid);
            let response1 = { "text": `Chào mừng ${username} đến với P-Covid` }

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

let getWitEntities = () => {
    return new Promise((resolve, reject) => {
        try {
            request({
                "uri": "https://api.wit.ai/entities",
                "method": "GET",
                "auth": {
                    'bearer': WIT_SERVER_TOKEN
                }
            }, (err, res, body) => {
                if (!err) {
                    let result = JSON.parse(body);
                    let arr = [];
                    for (let [ key, value ] of Object.entries(result)) {

                        // arr.push(value)

                        arr.push(value.name)
                    }
                    // new wit update, tạm thời comment lại
                    // let userEntity = arr.filter(e => {
                    //     return e.indexOf("wit") !== 0;
                    // });
                    // resolve(userEntity);
                    resolve(arr)
                } else {
                    reject(err);
                }
            });

        } catch (e) {
            reject(e);
        }
    });
};

let getEntityByName = (name) => {
    return new Promise((resolve, reject) => {
        try {
            request({
                "uri": `https://api.wit.ai/entities/${name}?v=20170307`,
                "method": "GET",
                "auth": {
                    'bearer': WIT_SERVER_TOKEN
                }
            }, (err, res, body) => {
                if (!err) {
                    resolve(body);
                } else {
                    reject(err);
                }
            });

        } catch (e) {
            reject(e);
        }
    });
};

let getWitEntitiesWithExpression = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let entities = await getWitEntities();
            let result = [];
            await Promise.all(entities.map(async (name) => {
                let b = await getEntityByName(name);
                result.push(JSON.parse(b));
            }));
            resolve(result);
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
                            // "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            // "webview_height_ratio": "tall",
                            // "messenger_extensions": true,
                            "url": "https://p-covid-care-g26.herokuapp.com/all-doctors",
                            "webview_height_ratio": "tall"
                        },
                        {
                            "type": "postback",
                            "title": "Hướng dẫn sử dụng bot",
                            "payload": "GUIDE_TO_USE",
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
                                "title": "GS.TS Nguyễn Đình Tiến",
                                "image_url": "https://bit.ly/3AIwF5Z",
                                "subtitle": "Tai-mũi-họng",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://p-covid-care-g26.herokuapp.com/detail/doctor/2",
                                    "webview_height_ratio": "tall"
                                }
                            },

                            {
                                "title": "GS.TS Nguyễn Xuân Chinh",
                                "image_url": "https://bit.ly/3pB8FLE",
                                "subtitle": "Phẫu thuật",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://p-covid-care-g26.herokuapp.com/detail/doctor/3",
                                    "webview_height_ratio": "tall"
                                }
                            },
                            {
                                "title": "GS.TS Nguyễn Văn Tuấn",
                                "image_url": "https://bit.ly/3cec005",
                                "subtitle": "Gan thận",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://p-covid-care-g26.herokuapp.com/detail/doctor/17",
                                    "webview_height_ratio": "tall"
                                }
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

let handleGuideToUseBot = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let username = await getUserName(sender_psid);
            let response1 = { "text": `Xin chào bạn ${username}, mình là chatbot P-Covid Care.\nĐể biết thêm về cách sử dụng các chức năng của chatbot vui lòng xem video bên dưới` }

            let response2 = getBotMediaTemplate()
            await callSendAPI(sender_psid, response1);
            await callSendAPI(sender_psid, response2);
            resolve('done');
        } catch (e) {
            reject(e);
        }
    })
}

let getBotMediaTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "media",
                "elements": [
                    {
                        "media_type": "video",
                        //"attachment_id": "<ATTACHMENT_ID>",
                        "url": "https://business.facebook.com/101707255939057/videos/1272951703510633/",
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Menu chính",
                                "payload": "BACK_TO_MENU",
                            }
                        ]
                    }
                ]
            }
        }
    };
    return response;
}

module.exports = {
    getWitEntitiesWithExpression: getWitEntitiesWithExpression,
    handleGetStarted: handleGetStarted,
    callSendAPIv2: callSendAPIv2,
    firstEntity: firstEntity,
    callSendAPI: callSendAPI,
    //handleEntity: handleEntity,
    getStartedTemplate: getStartedTemplate,
    handleBackToMenu: handleBackToMenu,
    handleSendMainMenu: handleSendMainMenu,
    sendMessageReplyDoctors: sendMessageReplyDoctors,
    handleGuideToUseBot: handleGuideToUseBot
}