(function () {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const commentsKey = 'comments';
  const commentsWrap = document.getElementById('comments');
  const form = document.getElementById('comment-form');
  const authorInput = document.getElementById('comment-author');
  const textInput = document.getElementById('comment-text');
  const clearAllBtn = document.getElementById('clear-all');

  function load() {
    try { return JSON.parse(localStorage.getItem(commentsKey)) || []; }
    catch (e) { return []; }
  }

  function save(arr) {
    localStorage.setItem(commentsKey, JSON.stringify(arr));
  }

  function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString();
  }

  function render() {
    if (!commentsWrap) {
      return;
    }
    const comments = load().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    commentsWrap.innerHTML = '';

    if (comments.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'Seja o(a) primeiro(a) a comentar!';
      commentsWrap.appendChild(empty);
      return;
    }

    comments.forEach(c => {
      const div = document.createElement('div');
      div.className = 'comment';
      div.dataset.id = c.id;

      const content = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = c.author || 'Anônimo';
      const p = document.createElement('p');
      p.textContent = c.text;
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = 'Publicado em ' + fmtDate(c.createdAt);

      content.appendChild(strong);
      content.appendChild(p);
      content.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'actions';
      const likeBtn = document.createElement('button');
      likeBtn.type = 'button';
      likeBtn.textContent = '👍 Like';
      likeBtn.addEventListener('click', () => {
        c.likes += 1;
        save(updateComment(c));
        render();
      });

      const likeCount = document.createElement('span');
      likeCount.className = 'badge';
      likeCount.textContent = c.likes + ' likes';

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'ghost';
      delBtn.textContent = 'Remover';
      delBtn.addEventListener('click', () => {
        const ok = confirm('Remover este comentário?');
        if (ok) {
          save(removeComment(c.id));
          render();
        }
      });

      actions.appendChild(likeBtn);
      actions.appendChild(likeCount);
      actions.appendChild(delBtn);

      div.appendChild(content);
      div.appendChild(actions);
      commentsWrap.appendChild(div);
    });
  }

  function addComment(author, text) {
    const arr = load();
    arr.push({
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      author, text,
      likes: 0,
      createdAt: new Date().toISOString()
    });
    save(arr);
  }

  function updateComment(updated) {
    const arr = load().map(c => c.id === updated.id ? updated : c);
    return arr;
  }

  function removeComment(id) {
    const arr = load().filter(c => c.id !== id);
    return arr;
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const author = authorInput.value.trim();
      const text = textInput.value.trim();
      if (!text) { textInput.focus(); return; }
      addComment(author, text);
      form.reset();
      render();
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja apagar todos os comentários?')) {
        localStorage.removeItem(commentsKey);
        render();
      }
    });
  }

  render();
})();
