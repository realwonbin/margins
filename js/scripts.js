document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('#posts a');
    const content = document.getElementById('content');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            fetch(e.target.dataset.md)
                .then(response => response.text())
                .then(mdText => {
                    const parts = mdText.split('---');
                    let yaml = {}, markdown = mdText;

                    if(parts.length >= 3){
                        yaml = jsyaml.load(parts[1]);
                        markdown = parts.slice(2).join('---');
                    }

                    content.innerHTML = `
                        <h2>${yaml.title || '제목 없음'}</h2>
                        <small>${yaml.date || ''}</small>
                        ${marked.parse(markdown)}
                    `;
                })
                .catch(err => {
                    content.innerHTML = "<p>게시물을 불러오는 중 오류가 발생했습니다.</p>";
                    console.error(err);
                });
        });
    });
});
