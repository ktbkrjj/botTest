var express = require('express'); // express ��ǂݍ���
var app = express(); // Express �� Aplication �I�u�W�F�N�g���쐬

app.get('/', function (request, response) {
    response.send('Hello, World!');
}); // ���[�e�B���O�ݒ� (������:�p�X, ������:���s���e)

var server = app.listen(7777, function () {
    console.log('Server runnning ...\nPort: 7777');
}); // �T�[�o�[�ݒ� (������:Port, ������:�����������̎��s���e)