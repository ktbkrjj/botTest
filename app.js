var express = require('express'); // express を読み込む
var app = express(); // Express の Aplication オブジェクトを作成

app.get('/', function (request, response) {
    response.send('Hello, World!');
}); // ルーティング設定 (第一引数:パス, 第二引数:実行内容)

var server = app.listen(7777, function () {
    console.log('Server runnning ...\nPort: 7777');
}); // サーバー設定 (第一引数:Port, 第二引数:処理完了時の実行内容)