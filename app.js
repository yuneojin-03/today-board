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

// 클라이언트가 보낸 JSON 데이터를 해석하게 해주는 기능이다.
app.use(express.json());

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

// 댓글 작성 API (CSR 방식으로 호출될 주소)
app.post('/api/posts/:id/comments', async function(req, res) {
  // 1. 기존 데이터 읽어오기
  const fileData = await fs.readFile('./data.json', 'utf8');
  const posts = JSON.parse(fileData);

  // 주소창의 게시글 번호와, 클라이언트가 보낸 댓글 내용 꺼내기
  const targetId = Number(req.params.id);
  const newCommentContent = req.body.content; 

  // 배열을 뒤져서 댓글을 달 게시글 찾기
  let targetPost = null;
  for(let i = 0; i < posts.length; i++) {
    if(posts[i].id === targetId) {
      targetPost = posts[i];
      break;
    }
  }

  // 새 댓글 정보 뭉치를 만들어서 해당 게시글의 comments 배열에 밀어 넣기
  const newComment = {
    id: Date.now(), // 안 겹치는 숫자(현재 시간)를 아이디로 씁니다.
    content: newCommentContent,
    date: "19:00" // 임시 고정 시간 (나중에는 진짜 시간으로 바꿀 수 있습니다)
  };
  targetPost.comments.push(newComment);

  // 바뀐 전체 배열을 다시 문자열로 포장해서 data.json 파일에 덮어쓰기
  // (JSON.stringify의 null, 2는 파일을 예쁘게 줄바꿈해서 저장하라는 뜻입니다)
  await fs.writeFile('./data.json', JSON.stringify(posts, null, 2), 'utf8');

  // 6. 브라우저에게 "성공했어!" 라고 답변(JSON) 보내주기
  res.json({ success: true, message: '댓글 저장 성공!' });
});

// 좋아요 올리기 API (CSR)

app.post('/api/posts/:id/like', async function(req, res) {
  const fileData = await fs.readFile('./data.json', 'utf8');
  const posts = JSON.parse(fileData);
  const targetId = Number(req.params.id);

  let currentLikes = 0;

  // 전체 글을 뒤져서 해당 게시글의 좋아요 수를 1 증가시킨다.
  for(let i = 0; i < posts.length; i++) {
    if(posts[i].id === targetId) {
      posts[i].likes += 1;
      currentLikes = posts[i].likes; // 1 증가된 최신 숫자를 기억해둔다.
      break;
    }
  }

  // 바뀐 전체 데이터를 다시 data.json 파일에 덮어쓴다.
  await fs.writeFile('./data.json', JSON.stringify(posts, null, 2), 'utf8');

  // 클라이언트에게 "성공했고, 이제 좋아요 숫자는 이거야!" 라고 알려준다.
  res.json({ success: true, newLikes: currentLikes });
});

// 서버를 켜고 사용자를 기다린다.
app.listen(port, function() {
  console.log('서버가 켜졌습니다: http://localhost:3000');
});
