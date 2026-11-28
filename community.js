(() => {
  "use strict";
  const words = {
    guestbook:["留言板","留言板","Guestbook","掲示板"],
    publicHint:["发表后，所有访问者都能看到你的昵称和留言。","發表後，所有訪客都能看到你的暱稱和留言。","Your nickname and message will be visible to everyone.","投稿すると、ニックネームとメッセージが全員に公開されます。"],
    recent:["最新留言","最新留言","Recent messages","新着メッセージ"],
    refresh:["刷新","重新整理","Refresh","更新"],
    older:["查看更多","顯示更多","Show older messages","以前の投稿を表示"],
    nickname:["昵称","暱稱","Nickname","ニックネーム"],
    message:["留言","留言","Message","メッセージ"],
    publish:["发表留言","發表留言","Post message","投稿する"],
    contact:["联系我","聯絡我","Contact","お問い合わせ"],
    contactHeading:["联系 家恩宝贝","聯絡 家恩宝贝","Contact J.E. Baby","J.E. Babyへのお問い合わせ"],
    back:["← 返回规划器","← 返回規劃器","← Back to planner","← プランナーに戻る"],
    privateHint:["建议会私下发给 家恩宝贝。如果希望收到回复，请留下联系方式。","建議會私下寄給 家恩宝贝。如果希望收到回覆，請留下聯絡方式。","Your feedback goes privately to J.E. Baby. Leave contact details if you would like a reply.","ご意見はJ.E. Babyに直接届きます。返信をご希望の場合は連絡先をご記入ください。"],
    suggestion:["建议内容","建議內容","Your feedback","ご意見・ご要望"],
    sender:["你的称呼（选填）","你的稱呼（選填）","Your name (optional)","お名前（任意）"],
    reply:["联系方式（选填）","聯絡方式（選填）","Contact details (optional)","連絡先（任意）"],
    send:["发送建议","送出建議","Send feedback","送信する"],
    language:["语言","語言","Language","言語"],
    offlineBoard:["留言板尚未开放。","留言板尚未開放。","The guestbook is not open yet.","掲示板は現在準備中です。"],
    offlineMail:["建议收件服务尚未开通。","建議收件服務尚未開通。","The feedback inbox is not open yet.","お問い合わせの受付は現在準備中です。"],
    loading:["正在读取留言…","正在讀取留言…","Loading messages…","投稿を読み込み中…"],
    empty:["还没有留言。","目前還沒有留言。","No messages yet.","まだ投稿がありません。"],
    loadError:["读取失败，请点「刷新」重试。","讀取失敗，請點「重新整理」再試一次。","Couldn’t load messages. Select Refresh to try again.","読み込めませんでした。「更新」を押して再度お試しください。"],
    sending:["正在发送…","正在傳送…","Sending…","送信中…"],
    published:["留言已公开发表。","留言已公開發表。","Your message is now public.","メッセージを公開しました。"],
    sent:["建议已提交，谢谢你的反馈。","建議已送出，謝謝你的回饋。","Feedback submitted. Thank you.","ご意見を受け付けました。ありがとうございます。"],
    limit:["操作过于频繁，请稍后再试。","操作過於頻繁，請稍後再試。","Too many requests. Please try later.","しばらく待ってから再度お試しください。"],
    sendError:["未能确认提交结果，请检查网络后重试。","無法確認送出結果，請檢查網路後再試一次。","We couldn’t confirm submission. Check your connection and try again.","送信結果を確認できませんでした。接続を確認して再度お試しください。"],
    invalid:["昵称需为 1～24 个字符，留言需为 1～500 个字符。","暱稱須為 1～24 個字元，留言須為 1～500 個字元。","Use 1–24 characters for your nickname and 1–500 for your message.","ニックネームは1〜24文字、メッセージは1〜500文字で入力してください。"],
    required:["请填写建议内容。","請填寫建議內容。","Please enter your feedback.","ご意見をご記入ください。"],
    forbidden:["当前网址尚未获准发表留言，请从正式站点打开。","目前網址尚未獲准發表留言，請從正式網站開啟。","Posting is unavailable from this address. Open the published site to post.","このURLからは投稿できません。公開サイトからご利用ください。"]
  };
  const byId = id => document.getElementById(id);
  const config = window.SONAR_SERVICES || {};
  const word = key => words[key][0];
  const notices = new Map();
  function notice(id, key, error = false) {
    notices.set(id,key);
    const element = byId(id);
    element.textContent = key ? word(key) : "";
    element.dataset.error = String(error);
  }
  function translate() {
    document.querySelectorAll("[data-word]").forEach(node => {node.textContent = word(node.dataset.word);});
    for (const [id,key] of notices) byId(id).textContent = key ? word(key) : "";
    document.querySelectorAll("time[datetime]").forEach(node => {
      const date = new Date(node.dateTime);
      node.textContent = new Intl.DateTimeFormat(document.documentElement.lang,{dateStyle:"medium",timeStyle:"short"}).format(date);
    });
    
  }
  function getGuestbookUrl() {
    if (!config.guestbookUrl) return null;
    try {
      const url = new URL(config.guestbookUrl);
      const local = ["127.0.0.1","localhost","[::1]"].includes(url.hostname);
      if (url.protocol === "https:" || (local && url.protocol === "http:")) return url;
    } catch {}
    return null;
  }
  async function request(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),18000);
    try {
      const response = await fetch(url,{...options,signal:controller.signal,credentials:"omit",cache:"no-store"});
      if (!response.ok) {
        const error = new Error("Request failed");
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } finally {clearTimeout(timeout);}
  }
  function startGuestbook() {
    const url = getGuestbookUrl();
    const form = byId("guest-form"), list = byId("public-messages");
    const refresh = byId("refresh-messages"), older = byId("older-messages"), publish = byId("publish-message");
    let cursor = null, busy = false, submission = null;
    function lock(value) {
      busy = value;
      refresh.disabled = older.disabled = publish.disabled = value || !url;
    }
    function drawItem(item) {
      if (!Number.isSafeInteger(item?.id) || typeof item.nickname !== "string" || typeof item.message !== "string" ||
          !Number.isFinite(Date.parse(item.createdAt))) throw new Error("Invalid message");
      const li = document.createElement("li"), meta = document.createElement("div");
      li.dataset.messageId = item.id; meta.className = "message-meta";
      const name = document.createElement("strong"), date = document.createElement("time"), body = document.createElement("p");
      name.textContent = item.nickname; date.dateTime = item.createdAt; body.textContent = item.message;
      meta.append(name,date); li.append(meta,body); return li;
    }
    async function load(append) {
      if (busy || !url) return;
      lock(true); notice("feed-state","loading");
      try {
        const target = new URL(url);
        if (append && cursor) target.searchParams.set("before",String(cursor));
        const data = await request(target);
        if (!Array.isArray(data.messages)) throw new Error("Invalid response");
        const entries = data.messages.map(drawItem);
        if (!append) list.replaceChildren();
        for (const li of entries) if (!list.querySelector('[data-message-id="'+li.dataset.messageId+'"]')) list.append(li);
        cursor = data.nextCursor; older.hidden = !cursor;
        notice("feed-state",list.childElementCount ? "" : "empty");
        translate();
      } catch {notice("feed-state","loadError",true);}
      finally {lock(false);}
    }
    refresh.onclick = () => load(false); older.onclick = () => load(true);
    form.onsubmit = async event => {
      event.preventDefault();
      if (!url || busy) return;
      const nickname = byId("guest-name").value.trim(), message = byId("guest-text").value.trim();
      if (!nickname || [...nickname].length>24 || !message || [...message].length>500) {notice("post-state","invalid",true);return;}
      if (submission?.nickname !== nickname || submission?.message !== message) {
        submission = {nickname,message,submissionId:crypto.randomUUID()};
      }
      lock(true); notice("post-state","sending");
      try {
        const data = await request(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(submission)});
        const entry = drawItem(data.message);
        if (!list.querySelector('[data-message-id="'+entry.dataset.messageId+'"]')) list.prepend(entry);
        if (byId("guest-text").value.trim() === message) byId("guest-text").value = "";
        submission = null;
        notice("post-state","published"); notice("feed-state",""); translate();
      } catch (error) {
        const reason = ({400:"invalid",403:"forbidden",429:"limit"})[error.status] || "sendError";
        notice("post-state",reason,true);
      } finally {lock(false);}
    };
    if (url) load(false);
    else {lock(false);notice("feed-state","offlineBoard");}
  }
  function startContact() {
    const form = byId("contact-form"), button = byId("send-feedback");
    const id = String(config.formspreeId || "").trim();
    if (!/^[a-zA-Z0-9_-]{5,64}$/.test(id)) {button.disabled=true;notice("contact-state","offlineMail");}
    form.onsubmit = async event => {
      event.preventDefault();
      if (button.disabled) return;
      const payload = new FormData(form);
      payload.set("source", "精英队长抽选规划器 · 家恩宝贝");
      payload.set("page", location.href);
      const message = String(payload.get("message")).trim();
      if (!message) {notice("contact-state","required",true);return;}
      payload.set("message",message);
      button.disabled = true; notice("contact-state","sending");
      try {
        const data = await request("https://formspree.io/f/"+id,{method:"POST",headers:{Accept:"application/json"},body:payload});
        if (!data || data.ok === false || data.errors?.length) throw new Error("Submission rejected");
        if (byId("suggestion").value.trim() === message) byId("suggestion").value="";
        notice("contact-state","sent");
      } catch(error) {notice("contact-state",error.status===429?"limit":"sendError",true);}
      finally {button.disabled=false;}
    };
  }
  document.addEventListener('planner-language',translate);
  if (byId("guest-form")) {translate();startGuestbook();}
  else if (byId("contact-form")) {translate();startContact();}
})();
