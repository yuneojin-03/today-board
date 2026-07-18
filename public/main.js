// HTML에서 입력창과 버튼을 찾아온다.
const commentInput = document.querySelector('#comment-input');
const submitBtn = document.querySelector('.comment-submit-btn');

submitBtn.addEventListener('click', async function() {
    const text = commentInput.value;
    
    // 빈칸 검사
    if (text === '') {
        alert('댓글을 입력해주세요!');
        return; // 아래 코드를 실행하지 않고 여기서 멈춤
    }

    // 현재 주소창에서 게시글 번호 빼오기 (예: /posts/1 -> 1 추출)
    const urlParts = window.location.pathname.split('/');
    const postId = urlParts[urlParts.length - 1];

    // 서버로 데이터 쏘기 (Fetch API)
    const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // "나 JSON 보낸다!" 하고 서버에 알려줌
        },
        body: JSON.stringify({ content: text }) // 실제 보낼 데이터를 포장해서 넣음
    });

    // 서버가 돌려준 응답 확인하기
    const result = await response.json();

    if (result.success === true) {
        alert('댓글이 서버에 안전하게 저장되었습니다!');
        commentInput.value = ''; // 입력창 싹 비워주기
        
        // 새로 쓴 댓글을 HTML 형태로 예쁘게 조립한다.
        const newCommentHTML = `
            <li class="comment-item">
                <span class="comment-text">${text}</span>
                <div class="comment-right">
                    <span class="comment-time">방금 전</span>
                    <button class="delete-comment-btn">삭제</button>
                </div>
            </li>
        `;

        // 조립한 HTML을 댓글 목록(ul)의 맨 끝부분에 끼워 넣는다.
        const commentList = document.querySelector('.comment-list');
        commentList.insertAdjacentHTML('beforeend', newCommentHTML);

        // 만약 '아직 댓글이 없습니다' 문구가 있다면 지워준다.
        const emptyComment = document.querySelector('.empty-comment');
        if(emptyComment) emptyComment.remove();

    }
});

// 좋아요 누르기 기능 추가

const likeBtn = document.querySelector('.likes'); // 하트가 있는 span 태그 찾기

if (likeBtn) {
    likeBtn.style.cursor = 'pointer'; // 마우스 올렸을 때 손가락 모양으로 바꾸기

    likeBtn.addEventListener('click', async function() {
        const urlParts = window.location.pathname.split('/');
        const postId = urlParts[urlParts.length - 1];

        // 서버의 좋아요 API로 POST 요청 쏘기
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST'
        });

        const result = await response.json();

        if (result.success === true) {
            // 서버가 돌려준 최신 좋아요 숫자로 화면 글자를 바꾼다. (DOM 조작)
            likeBtn.textContent = `♥ ${result.newLikes}`;
        }
    });
}