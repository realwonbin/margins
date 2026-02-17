document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const fileName = params.get('file');
  const content = document.getElementById('content');

  if (!fileName) {
    content.innerHTML = "<p>게시물을 지정하지 않았습니다.</p>";
    return;
  }

  // 1. 현재 폴더에 있는 index.json을 불러옴
  fetch('./index.json')
    .then(res => {
      if (!res.ok) throw new Error("index.json 파일을 찾을 수 없습니다.");
      return res.json();
    })
    .then(posts => {
      const post = posts.find(p => p.file === fileName);
      if (!post) throw new Error("목록에서 해당 파일을 찾을 수 없습니다.");

      // 2. 이미 index.json 안에 content 내용이 들어있으므로 바로 출력
      marked.setOptions({ breaks: true });
      const dateLine = post.date + (post.location ? ` · ${post.location}` : '');

      content.innerHTML = `
        <h1 class="post-title">${post.title}</h1>
        <div class="post-meta">${dateLine}</div>
        <div class="post-body">${marked.parse(post.content)}</div>
      `;

      // 3. 이전/다음 네비게이션 생성
      const currentIndex = posts.findIndex(p => p.file === fileName);
      const prev = posts[currentIndex + 1];
      const next = posts[currentIndex - 1];

      let navHTML = '<nav class="post-nav">';
      navHTML += prev ? `<a href="viewer.html?file=${encodeURIComponent(prev.file)}">← ${prev.title}</a>` : '<span></span>';
      navHTML += next ? `<a href="viewer.html?file=${encodeURIComponent(next.file)}">${next.title} →</a>` : '<span></span>';
      navHTML += '</nav>';
      
      content.innerHTML += navHTML;
    })
    .catch(err => {
      content.innerHTML = `<p style="color:#c0392b;">오류: ${err.message}</p>`;
    });
});