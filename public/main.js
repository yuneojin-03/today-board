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
        
        // 오늘은 일단 새로고침(F5)을 해서 서버 데이터가 잘 그려지는지 확인해 보기.
    }
});