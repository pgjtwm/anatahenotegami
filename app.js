document.addEventListener('DOMContentLoaded', () => {
    const createBtn = document.getElementById('create-btn');
    const hero = document.querySelector('.hero');
    const container = document.querySelector('.container');

    createBtn.addEventListener('click', () => {
        showEditor();
    });

    function showEditor() {
        // Smooth transition to editor
        hero.style.opacity = '0';
        hero.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            hero.remove();
            renderEditor();
        }, 500);
    }

    function renderEditor() {
        const editorHTML = `
            <div class="editor-container fade-in">
                <h2>メッセージを作成</h2>
                
                <div class="input-group">
                    <label>宛名</label>
                    <input type="text" id="to-name" placeholder="大切なあの方へ">
                </div>

                <div class="input-group">
                    <label>本文</label>
                    <textarea id="message-body" placeholder="心温まるメッセージを..."></textarea>
                </div>

                <div class="input-group">
                    <label>テーマ選択</label>
                    <div class="theme-grid">
                        <div class="theme-option active" data-theme="gold">Champagne Gold</div>
                        <div class="theme-option" data-theme="midnight">Midnight Blue</div>
                        <div class="theme-option" data-theme="rose">Rose Quartz</div>
                    </div>
                </div>

                <div class="input-group">
                    <label>差出人</label>
                    <input type="text" id="from-name" placeholder="あなたの名前">
                </div>

                <button class="cta-button" id="generate-btn">リンクを発行する</button>
            </div>
        `;

        const main = document.createElement('main');
        main.innerHTML = editorHTML;
        container.appendChild(main);

        setupEditorEvents();
    }

    function setupEditorEvents() {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                themeOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            });
        });

        document.getElementById('generate-btn').addEventListener('click', () => {
            const data = {
                t: document.getElementById('to-name').value,
                m: document.getElementById('message-body').value,
                f: document.getElementById('from-name').value,
                th: document.querySelector('.theme-option.active').dataset.theme
            };

            // Encode data into URL hash to keep it serverless and free
            const encodedData = btoa(encodeURIComponent(JSON.stringify(data)));
            const baseUrl = window.location.href.split('#')[0];
            const shareUrl = baseUrl + '#card=' + encodedData;

            showShareModal(shareUrl);
        });
    }

    function showShareModal(url) {
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal">
                    <h3>カードが完成しました！</h3>
                    <p>このリンクを大切な人に送ってください。</p>
                    <div class="url-box">${url}</div>
                    <button class="cta-button" onclick="navigator.clipboard.writeText('${url}'); alert('コピーしました')">リンクをコピー</button>
                    
                    <div class="affiliate-box">
                        <p>💡 おすすめのギフトを添えませんか？</p>
                        <a href="https://amzn.to/example" target="_blank">人気のカタログギフトを見る</a>
                    </div>

                    <button class="close-btn" onclick="location.reload()">トップに戻る</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Check if viewing a card
    function checkHash() {
        const hash = window.location.hash;
        if (hash.startsWith('#card=')) {
            let encoded = hash.slice(6);

            // Fix missing padding if necessary
            encoded = encoded.split('&')[0]; // Remove any trailing URL params
            while (encoded.length % 4 !== 0) {
                encoded += '=';
            }

            try {
                // Handle the case where the data might be double-encoded or have special characters
                const rawData = atob(encoded);
                const decodedData = decodeURIComponent(rawData);
                const data = JSON.parse(decodedData);
                renderViewer(data);
            } catch (e) {
                console.error('Invalid card data', e);
                alert('カードデータの読み込みに失敗しました。リンクが途切れている可能性があります。');
                window.location.hash = '';
            }
        }
    }

    checkHash();
    window.addEventListener('hashchange', checkHash);

    function renderViewer(data) {
        hero?.remove();
        document.querySelector('header')?.remove();

        // Render envelope initially
        document.body.innerHTML = `
            <div class="viewer-container theme-${data.th} fade-in">
                <div class="envelope-wrapper" id="envelope">
                    <div class="seal">Aura</div>
                    <div class="paper-preview"></div>
                </div>
                <p id="click-hint" style="margin-top: 2rem; color: var(--text-dim); font-size: 0.9rem;">クリックして開封する</p>
            </div>
        `;

        const envelope = document.getElementById('envelope');
        envelope.addEventListener('click', () => {
            envelope.classList.add('open');
            document.getElementById('click-hint').style.opacity = '0';

            setTimeout(() => {
                showLetter(data);
            }, 1000);
        });
    }

    function showLetter(data) {
        // Logic for context-aware recommendations
        const isBirthday = data.m.includes('誕生日') || data.m.includes('おめでとう');
        const isThanks = data.m.includes('ありがとう') || data.m.includes('感謝');

        let giftTitle = "想い出に、ギフトを添えませんか？";
        let link1Text = "Amazonギフト券 (一番人気)";
        let link1Url = "https://www.amazon.co.jp/dp/B004N3APGO?tag=pgjtwm-22"; // User's Amazon ID set
        let link2Text = isBirthday ? "人気のバースデー体験ギフト" : (isThanks ? "癒やしのカタログギフト" : "失敗しない鉄板ギフト");
        let link2Url = "https://hb.afl.rakuten.co.jp/hgc/YOUR_ID_HERE"; // Placeholder for Rakuten/ASP ID

        const viewerHTML = `
            <div class="viewer-container theme-${data.th} fade-in">
                <div class="letter-card">
                    <div class="to">To: ${data.t}</div>
                    <div class="content">${data.m.replace(/\n/g, '<br>')}</div>
                    <div class="from">From: ${data.f}</div>
                </div>
                <div class="viewer-footer" style="margin-top: 3rem; text-align: center;">
                    <a href="${window.location.origin}${window.location.pathname}" class="create-own" style="color: var(--primary); text-decoration: none; border: 1px solid var(--primary); padding: 0.8rem 1.5rem; border-radius: 50px;">あなたもメッセージを送ってみませんか？</a>
                    
                    <div class="monetization-area" style="margin-top: 4rem; padding: 2rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(192, 160, 128, 0.2);">
                        <p style="font-size: 0.9rem; color: var(--primary); margin-bottom: 1.5rem; font-weight: bold;">${giftTitle}</p>
                        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
                            <a href="${link1Url}" target="_blank" style="color: #fff; font-size: 0.9rem; text-decoration: underline;">🎁 ${link1Text}</a>
                            <a href="${link2Url}" target="_blank" style="color: #fff; font-size: 0.9rem; text-decoration: underline;">✨ ${link2Text}</a>
                        </div>
                        <p style="font-size: 0.7rem; color: var(--text-dim); margin-top: 1.5rem;">※Amazonおよび楽天などのアフィリエイトリンクが含まれています</p>
                    </div>
                </div>
            </div>
        `;
        document.body.innerHTML = viewerHTML;
        document.body.style.background = 'radial-gradient(circle at center, #1a1a1c 0%, #000 100%)';
    }
});
