// 방금 설치한 express 도구를 불러온다.
const express = require('express');
// 파일을 읽고 쓰기 위해 fs 모듈을 가져온다. (promises는 비동기 처리를 위한 것)
const fs = require('fs').promises;

const app = express();

// 서버를 열 주소(포트) 번호를 정한다. 보통 3000번을 많이 쓴다.
const port = 3000;

// 화면을 그릴 때 ejs를 사용할 거야 라고 알려주는 설정이다.
app.set('view engine', 'ejs');

// public 폴더 안에 있는 파일(CSS, JS 등)을 브라우저가 쓸 수 있게 허락해 준다.
app.use(express.static('public'));

// 사용자가 메인 페이지('/')로 들어왔을 때 할 일을 정해준다.
// async 키워드를 붙여서 비동기 함수로 만든다. (파일을 다 읽을 때까지 기다려주기 위함)
app.get('/', async function(req, res) {
  // 1. data.json 파일의 내용을 읽어온다. (await는 다 읽을 때까지 기다리라는 뜻)
  const fileData = await fs.readFile('./data.json', 'utf8');
  
  // 2. 읽어온 글자(문자열)를 자바스크립트가 쓸 수 있는 배열 형태로 변환한다.
  const posts = JSON.parse(fileData);
  
  // 3. views/index.ejs 파일을 찾아 화면을 그리는데, 이때 데이터(posts)를 넘겨준다.
  res.render('index', { posts: posts });
});

// 서버를 켜고 사용자를 기다린다.
app.listen(port, function() {
  console.log('서버가 켜졌습니다: http://localhost:3000');
});
