function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

document.addEventListener("DOMContentLoaded", () => {
  const file = decodeURIComponent(getQueryParam('file'));
  const content = document.getElementById('content');

  if (!file) {
    content.innerHTML = "<p>파일이 지정되지 않았습니다.</p>";
    return;
  }

  // 📄 1. 본문 로딩
  fetch('posts/' + file)
    .then(res => {
      if (!res.ok) throw new Error("파일을 찾을 수 없습니다.");
      return res.text();
    })
    .then(md => {
      // ✅ 마크다운 줄바꿈 처리 옵션
      marked.setOptions({
        breaks: true  // 한 줄 개행도 <br>로 처리
      });

      const parts = md.split('---');
      let yaml = {}, markdown = md;

      if (parts.length >= 3) {
        yaml = jsyaml.load(parts[1]);
        markdown = parts.slice(2).join('---');
      }

      // ✅ 줄바꿈 2줄 이상 → <br><br> 처리
      const processedMarkdown = markdown.replace(/\n{2,}/g, match => '<br>'.repeat(match.length - 1));

      const dateOnly = (typeof yaml.date === "string" && yaml.date.includes("T"))
        ? yaml.date.split("T")[0]
        : yaml.date;

      let metaLine = "";
      if (yaml.date) metaLine += dateOnly;
      if (yaml.location) metaLine += ` · ${yaml.location}`;

      // ✅ 문제 있던 줄을 템플릿 문자열 안에 포함
      content.innerHTML = `
        <h1 class="post-title">${yaml.title || '제목 없음'}</h1>
        <div class="post-meta">${metaLine}</div>
        <div class="post-body">${marked.parse(processedMarkdown)}</div>
      `;

      // 🧭 2. 이전/다음 글 정보 로딩
      return fetch('posts/index.json');
    })
    .then(res => res.json())
    .then(posts => {
      const currentFile = decodeURIComponent(getQueryParam('file'));
      const currentIndex = posts.findIndex(p => p.file === currentFile);
      const prev = posts[currentIndex + 1];
      const next = posts[currentIndex - 1];

      let navHTML = '<nav class="post-nav">';
      if (prev) {
        navHTML += `<a class="prev" href="viewer.html?file=${encodeURIComponent(prev.file)}">← ${prev.title}</a>`;
      } else {
        navHTML += `<span></span>`;
      }

      if (next) {
        navHTML += `<a class="next" href="viewer.html?file=${encodeURIComponent(next.file)}">${next.title} →</a>`;
      } else {
        navHTML += `<span></span>`;
      }

      navHTML += '</nav>';
      content.innerHTML += navHTML;
    })
    .catch(err => {
      content.innerHTML = `<p>게시물을 불러오는 중 오류가 발생했습니다.<br>Error: ${err.message}</p>`;
    });
});
