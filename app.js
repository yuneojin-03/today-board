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
  // data.json 파일의 내용을 읽어온다. (await는 다 읽을 때까지 기다리라는 뜻)
  const fileData = await fs.readFile('./data.json', 'utf8');

  // 읽어온 글자(문자열)를 자바스크립트가 쓸 수 있는 배열 형태로 변환한다.
  const posts = JSON.parse(fileData);

  // views/index.ejs 파일을 찾아 화면을 그리는데, 이때 데이터(posts)를 넘겨준다.
  res.render('index', { posts: posts });
});

app.get('/posts/:id', async function(req, res) {
  // data.json 파일의 내용을 읽어온다. (await는 다 읽을 때까지 기다리라는 뜻)
  const fileData = await fs.readFile('./data.json', 'utf8');
  
  // 읽어온 글자(문자열)를 자바스크립트가 쓸 수 있는 배열 형태로 변환한다.
  const posts = JSON.parse(fileData);

  // 사용자가 클릭한 주소의 숫자(id)를 가져온다. 
  // (주소창의 값은 기본적으로 글자 취급이라 Number()로 숫자로 바꿔준다)
  const targetId = Number(req.params.id);
  
  // 우리가 찾을 게시글을 담을 빈 상자를 하나 만든다.
  let targetPost = null;

  // 전체 게시글을 하나씩 뒤져서 id가 똑같은 글을 찾는다.
  for(let i = 0; i < posts.length; i++) {
    if(posts[i].id === targetId) {
      targetPost = posts[i]; // 찾았다면 상자에 담아준다.
      break; // 찾았으니 반복문을 바로 멈춘다.
    }
  }

  // 글을 찾았으면 post.ejs 화면을 그려주고, 못 찾았으면 에러 메시지를 띄운다.
  if(targetPost === null) {
    res.send('게시글을 찾을 수 없습니다.');
  } else {
    res.render('post', { post: targetPost });
  }
});

// 서버를 켜고 사용자를 기다린다.
app.listen(port, function() {
  console.log('서버가 켜졌습니다: http://localhost:3000');
});
