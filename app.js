var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var async = require('async');

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: true }));  // JSON�̑��M������
app.use(bodyParser.json());                        // JSON�̃p�[�X���y�Ɂi��M���j
// app.get('/', function(request, response) {
//     response.send('Hello World!');
// });

app.post('/callback', function (req, res) {

    async.waterfall([
        // ����Ȃ�API
        function (callback) {

            var json = req.body;

            // ��M�e�L�X�g
            var search_place = json['result'][0]['content']['text'];
            var search_place_array = search_place.split("\n");

            //�����L�[���[�h
            var gnavi_keyword = "";
            if (search_place_array.length == 2) {
                var keyword_array = search_place_array[1].split("�A");
                gnavi_keyword = keyword_array.join();
            }

            // ����Ȃ�API ���X�g��������API
            var gnavi_url = 'http://api.gnavi.co.jp/RestSearchAPI/20150630/';
            // ����Ȃ� ���N�G�X�g�p�����[�^�̐ݒ�
            var gnavi_query = {
                "keyid": "<����Ȃт̃A�N�Z�X�L�[>",
                "format": "json",
                "address": search_place_array[0],
                "hit_per_page": 1,
                "freeword": gnavi_keyword,
                "freeword_condition": 2
            };
            var gnavi_options = {
                url: gnavi_url,
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                qs: gnavi_query,
                json: true
            };

            // �������ʂ��I�u�W�F�N�g��
            var search_result = {};

            request.get(gnavi_options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    if ('error' in body) {
                        console.log("�����G���[" + JSON.stringify(body));
                        return;
                    }

                    // �X��
                    if ('name' in body.rest) {
                        search_result['name'] = body.rest.name;
                    }
                    // �摜
                    if ('image_url' in body.rest) {
                        search_result['shop_image1'] = body.rest.image_url.shop_image1;
                    }
                    // �Z��
                    if ('address' in body.rest) {
                        search_result['address'] = body.rest.address;
                    }
                    // �ܓx
                    if ('latitude' in body.rest) {
                        search_result['latitude'] = body.rest.latitude;
                    }
                    // �y�x
                    if ('longitude' in body.rest) {
                        search_result['longitude'] = body.rest.longitude;
                    }
                    // �c�Ǝ���
                    if ('opentime' in body.rest) {
                        search_result['opentime'] = body.rest.opentime;
                    }

                    callback(null, json, search_result);

                } else {
                    console.log('error: ' + response.statusCode);
                }
            });

        },
    ],

    // LINE BOT
    function (err, json, search_result) {
        if (err) {
            return;
        }

        //�w�b�_�[���`
        var headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Line-ChannelID': '<Your Channel ID>',
            'X-Line-ChannelSecret': '<Your Channel Secret>',
            'X-Line-Trusted-User-With-ACL': '<Your MID>'
        };

        // ���M����̐ݒ�i�z��j
        var to_array = [];
        to_array.push(json['result'][0]['content']['from']);


        // ���M�f�[�^�쐬
        var data = {
            'to': to_array,
            'toChannel': 1383378250, //�Œ�
            'eventType': '140177271400161403', //�Œ�
            "content": {
                "messageNotified": 0,
                "messages": [
                    // �e�L�X�g
                    {
                        "contentType": 1,
                        "text": '������͂������ł����H\n�y���X�z' + search_result['name'] + '\n�y�c�Ǝ��ԁz' + search_result['opentime'],
                    },
                    // �摜
                    {
                        "contentType": 2,
                        "originalContentUrl": search_result['shop_image1'],
                        "previewImageUrl": search_result['shop_image1']
                    },
                    // �ʒu���
                    {
                        "contentType": 7,
                        "text": search_result['name'],
                        "location": {
                            "title": search_result['address'],
                            "latitude": Number(search_result['latitude']),
                            "longitude": Number(search_result['longitude'])
                        }
                    }
                ]
            }
        };

        //�I�v�V�������`
        var options = {
            url: 'https://trialbot-api.line.me/v1/events',
            proxy: process.env.FIXIE_URL,
            headers: headers,
            json: true,
            body: data
        };

        request.post(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            } else {
                console.log('error: ' + JSON.stringify(response));
            }
        });

    });

});

app.listen(app.get('port'), function () {
    console.log('Node app is running');
});