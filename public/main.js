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
        const commentId = Date.now(); // 겹치지 않는 임시 번호 생성
        
        // 새로 쓴 댓글을 HTML 형태로 예쁘게 조립한다.
        const newCommentHTML = `
            <li class="comment-item">
                <span class="comment-text">${text}</span>
                <div class="comment-right">
                    <span class="comment-time">방금 전</span>
                    <button class="delete-comment-btn" data-id="${commentId}">삭제</button>
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

// 좋아요 누르기 기능 , LocalStorage 중복 방지 적용 추가

const likeBtn = document.querySelector('.likes'); // 하트가 있는 span 태그 찾기

if (likeBtn) {
    const urlParts = window.location.pathname.split('/');
    const postId = urlParts[urlParts.length - 1]; // 현재 글 번호

    // LocalStorage에서 '내가 좋아요 누른 글 번호들'을 가져온다. (없으면 빈 배열 [] 세팅)
    // 문자열로 저장되어 있으므로 JSON.parse()로 다시 배열로 푼다.
    let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];

    // 만약 이미 좋아요를 누른 글이라면? (배열 안에 현재 글 번호가 있다면)
    if (likedPosts.includes(postId)) {
        likeBtn.style.color = '#ef4444'; // 하트를 빨간색으로 칠해둠
        likeBtn.style.cursor = 'default';
    } else {
        likeBtn.style.cursor = 'pointer'; 
    }

    // 하트 클릭 이벤트
    likeBtn.addEventListener('click', async function() {
        // [중단 조건] 이미 배열에 이 글 번호가 들어있다면 경고창을 띄우고 통신을 막는다
        if (likedPosts.includes(postId)) {
            alert('이미 좋아요를 누른 게시글입니다.');
            return; 
        }

        // 중복이 아니라면 정상적으로 서버에 1 올려달라고 요청한다.
        const response = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
        const result = await response.json();

        if (result.success === true) {
            likeBtn.textContent = `♥ ${result.newLikes}`;
            likeBtn.style.color = '#ef4444'; 
            likeBtn.style.cursor = 'default'; 

            // LocalStorage에 방금 누른 글 번호를 추가해서 영구 저장한다.
            likedPosts.push(postId);
            localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        }
    });
}

// 게시글 삭제 기능
const deletePostBtn = document.querySelector('.delete-post-btn');
if (deletePostBtn) {
    deletePostBtn.addEventListener('click', async function() {
        if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            const urlParts = window.location.pathname.split('/');
            const postId = urlParts[urlParts.length - 1];

            const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            const result = await response.json();

            if (result.success) {
                alert('게시글이 삭제되었습니다.');
                window.location.href = '/'; // 메인 목록 페이지로 강제 이동
            }
        }
    });
}

// 댓글 삭제 기능 (이벤트 위임 활용)
const commentList = document.querySelector('.comment-list');
if (commentList) {
    commentList.addEventListener('click', async function(event) {
        // 클릭된 녀석이 '삭제 버튼'이 맞을 때만 실행한다.
        if (event.target.classList.contains('delete-comment-btn')) {
            if (confirm('이 댓글을 삭제할까요?')) {
                const urlParts = window.location.pathname.split('/');
                const postId = urlParts[urlParts.length - 1];
                
                // HTML에 몰래 달아둔 비밀 이름표(data-id)에서 번호를 꺼내온다.
                const commentId = event.target.dataset.id;

                const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, { 
                    method: 'DELETE' 
                });
                const result = await response.json();

                if (result.success) {
                    // 서버에서 지워졌으니, 화면에서도 해당 댓글(li)을 즉시 뜯어낸다.
                    event.target.closest('.comment-item').remove();
                }
            }
        }
    });
}