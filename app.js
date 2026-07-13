// 1. 방금 설치한 express 도구를 불러옵니다.
const express = require('express');
const app = express();

// 서버를 열 주소(포트) 번호를 정합니다. 보통 3000번을 많이 씁니다.
const port = 3000;

// 2. 사용자가 메인 페이지('/')로 들어왔을 때 할 일을 정해줍니다.
app.get('/', function(req, res) {
  // 브라우저 화면에 아래 글자를 보내줍니다. (응답)
  res.send('Hello World! 나의 첫 Express 서버입니다.');
});

// 3. 서버를 켜고 사용자를 기다립니다.
app.listen(port, function() {
  console.log('서버가 성공적으로 켜졌습니다!');
  console.log('브라우저에서 http://localhost:3000 으로 접속해보세요.');
});