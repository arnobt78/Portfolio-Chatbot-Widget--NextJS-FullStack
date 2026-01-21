/** Portfolio Chatbot Widget - Fast Loading Embeddable Script */
(function(){
'use strict';
const C={
  u:window.CHATBOT_BASE_URL||window.location.origin,
  t:window.CHATBOT_TITLE||'Chat Assistant',
  p:window.CHATBOT_PLACEHOLDER||'Message...',
  g:window.CHATBOT_GREETING||'👋 How can I help you today?'
};
let open=0,msgs=[],typing=0,menu=0,dark=false;
try{dark=matchMedia('(prefers-color-scheme:dark)').matches;}catch(e){}
const $=id=>document.getElementById(id),tog=(e,c,on)=>e&&e.classList&&e.classList.toggle(c,on);

// Add bounce animation keyframes if not exists
if(!document.getElementById('cb-animations')){
  const style=document.createElement('style');
  style.id='cb-animations';
  style.textContent='@keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-25%);}}';
  document.head.appendChild(style);
}

function init(){
  // Create button immediately - appears instantly
  const btn=document.createElement('button');
  btn.id='cb-btn';
  btn.className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 bg-black rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all z-[99998]';
  // CRITICAL: Inline styles ensure positioning works even without Tailwind
  btn.style.cssText='position:fixed!important;bottom:1rem!important;right:1rem!important;width:3.5rem!important;height:3.5rem!important;background-color:#000000!important;border-radius:9999px!important;border:none!important;cursor:pointer!important;z-index:99998!important;pointer-events:auto!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25)!important;';
  btn.innerHTML=`<svg id="cb-o" style="width:1.5rem;height:1.5rem;color:white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg><svg id="cb-x" style="width:1.5rem;height:1.5rem;color:white;position:absolute;opacity:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>`;
  document.body.appendChild(btn);
  
  // Load CSS asynchronously (non-blocking)
  const l=document.createElement('link');
  l.rel='stylesheet';
  l.href=C.u+'/styles.css';
  document.head.appendChild(l);
  
  // Create chat window - convert all Tailwind classes to inline styles
  const d=document.createElement('div');
  d.id='cb';
  const chatWindowBaseStyle='position:fixed!important;bottom:5rem!important;right:1rem!important;width:calc(100vw - 2rem)!important;max-width:calc(100vw - 2rem)!important;height:calc(100vh - 6rem)!important;max-height:600px!important;border-radius:1rem!important;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25)!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;z-index:99999!important;opacity:0!important;transform:scale(0.95)!important;pointer-events:none!important;background-color:#ffffff!important;transition:opacity 0.2s,transform 0.2s!important;transform-origin:bottom right!important;';
  d.innerHTML=`<div id="cb-w" style="${chatWindowBaseStyle}">
<div id="cb-header" style="display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0.75rem 1rem!important;border-bottom:1px solid #f3f4f6!important;background-color:#ffffff!important;flex-shrink:0!important;"><div style="display:flex!important;align-items:center!important;gap:0.5rem!important;min-width:0!important;flex:1!important;"><div id="cb-avatar" style="width:2rem!important;height:2rem!important;background-color:#000000!important;border-radius:9999px!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;"><svg style="width:1rem!important;height:1rem!important;color:white!important;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg></div><h3 id="cb-title" style="font-size:0.875rem!important;font-weight:600!important;color:#111827!important;margin:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;">${C.t}</h3></div>
<div style="position:relative!important;flex-shrink:0!important;"><button id="cb-m" style="padding:0.5rem!important;border:none!important;background:transparent!important;cursor:pointer!important;border-radius:9999px!important;color:#6b7280!important;transition:background-color 0.2s!important;" onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='transparent'"><svg style="width:1.25rem!important;height:1.25rem!important;color:inherit!important;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
<div id="cb-d" style="display:none!important;position:absolute!important;right:0!important;top:100%!important;margin-top:0.5rem!important;width:11rem!important;background-color:#ffffff!important;border-radius:0.75rem!important;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)!important;border:1px solid #f3f4f6!important;padding:0.25rem 0!important;z-index:100!important;">
<button id="cb-th" style="width:100%!important;padding:0.5rem 1rem!important;text-align:left!important;font-size:0.875rem!important;color:#374151!important;background:transparent!important;border:none!important;cursor:pointer!important;display:flex!important;align-items:center!important;gap:0.5rem!important;transition:background-color 0.2s!important;" onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='transparent'"><svg id="cb-s" style="display:none!important;width:1rem!important;height:1rem!important;color:currentColor!important;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg><svg id="cb-n" style="width:1rem!important;height:1rem!important;color:currentColor!important;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg><span id="cb-tt">Dark Mode</span></button>
<button id="cb-cl" style="width:100%!important;padding:0.5rem 1rem!important;text-align:left!important;font-size:0.875rem!important;color:#374151!important;background:transparent!important;border:none!important;cursor:pointer!important;display:flex!important;align-items:center!important;gap:0.5rem!important;transition:background-color 0.2s!important;" onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='transparent'"><svg style="width:1rem!important;height:1rem!important;color:currentColor!important;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>Clear Chat</button></div></div></div>
<div id="cb-ms" style="flex:1!important;overflow-y:auto!important;overflow-x:hidden!important;padding:0.75rem 1rem!important;background-color:#f9fafb!important;display:flex!important;flex-direction:column!important;gap:0.75rem!important;"></div>
<div id="cb-ty" style="display:none!important;padding:0 1rem 0.5rem 1rem!important;background-color:#f9fafb!important;"><div style="display:flex!important;align-items:center!important;gap:0.5rem!important;color:#9ca3af!important;font-size:0.875rem!important;"><div style="display:flex!important;gap:0.25rem!important;"><span style="width:0.5rem!important;height:0.5rem!important;background-color:#9ca3af!important;border-radius:9999px!important;animation:bounce 1.4s infinite!important;"></span><span style="width:0.5rem!important;height:0.5rem!important;background-color:#9ca3af!important;border-radius:9999px!important;animation:bounce 1.4s infinite 0.15s!important;"></span><span style="width:0.5rem!important;height:0.5rem!important;background-color:#9ca3af!important;border-radius:9999px!important;animation:bounce 1.4s infinite 0.3s!important;"></span></div>Thinking...</div></div>
<form id="cb-f" style="display:flex!important;align-items:center!important;gap:0.5rem!important;padding:0.75rem 1rem!important;border-top:1px solid #f3f4f6!important;background-color:#ffffff!important;flex-shrink:0!important;"><input id="cb-i" type="text" style="flex:1!important;min-width:0!important;padding:0.5rem 1rem!important;background-color:#f9fafb!important;border:1px solid #e5e7eb!important;border-radius:9999px!important;font-size:0.875rem!important;color:#111827!important;outline:none!important;transition:border-color 0.2s,background-color 0.2s!important;" placeholder="${C.p}" autocomplete="off" onfocus="const isDark=document.getElementById('cb')&&document.getElementById('cb').classList.contains('dark');this.style.borderColor=isDark?'#9ca3af':'#6b7280';this.style.outline='none';" onblur="const isDark=document.getElementById('cb')&&document.getElementById('cb').classList.contains('dark');this.style.borderColor=isDark?'#374151':'#e5e7eb';this.style.outline='none';"/><button type="submit" id="cb-se" style="padding:0.5rem!important;border:none!important;background:transparent!important;cursor:pointer!important;border-radius:9999px!important;color:#4b5563!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;transition:background-color 0.2s!important;" onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='transparent'"><svg style="width:1rem!important;height:1rem!important;color:inherit!important;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/></svg></button></form></div>`;
  document.body.appendChild(d);
  
  // Apply responsive styles for larger screens
  const chatWindow=$('cb-w');
  if(chatWindow && window.matchMedia('(min-width: 640px)').matches){
    chatWindow.style.bottom='6rem';
    chatWindow.style.right='1.5rem';
    chatWindow.style.width='400px';
    chatWindow.style.maxWidth='400px';
    chatWindow.style.height='600px';
  }
  
  // Apply initial dark mode if needed
  if(dark){
    const cb=$('cb');
    if(cb)cb.classList.add('dark');
  }
  
  bind();
  theme();
  // Load history in background (non-blocking)
  setTimeout(()=>load().catch(()=>{}),100);
}

function bind(){
  const btn=$('cb-btn'),form=$('cb-f'),menuBtn=$('cb-m'),themeBtn=$('cb-th'),clearBtn=$('cb-cl'),dropdown=$('cb-d');
  if(btn)btn.onclick=flip;
  if(form)form.onsubmit=send;
  if(menuBtn)menuBtn.onclick=e=>{e.stopPropagation();menu=!menu;if(dropdown)dropdown.style.display=menu?'block':'none';};
  if(themeBtn)themeBtn.onclick=()=>{dark=!dark;theme();menu=0;if(dropdown)dropdown.style.display='none';};
  if(clearBtn)clearBtn.onclick=()=>{msgs=[];draw();menu=0;if(dropdown)dropdown.style.display='none';};
  document.onclick=()=>{if(menu){menu=0;if(dropdown)dropdown.style.display='none';}};
}

function theme(){
  const cb=$('cb'),tt=$('cb-tt'),s=$('cb-s'),n=$('cb-n'),w=$('cb-w'),header=$('cb-header'),ms=$('cb-ms'),ty=$('cb-ty'),f=$('cb-f'),i=$('cb-i'),title=$('cb-title'),m=$('cb-m'),d=$('cb-d'),th=$('cb-th'),cl=$('cb-cl'),se=$('cb-se');
  tog(cb,'dark',dark);
  if(tt)tt.textContent=dark?'Light Mode':'Dark Mode';
  if(s)s.style.display=dark?'block':'none';
  if(n)n.style.display=dark?'none':'block';
  
  // Apply dark mode inline styles
  if(dark){
    if(w)w.style.backgroundColor='#111827';
    if(header){header.style.backgroundColor='#111827';header.style.borderColor='#1f2937';}
    if(title)title.style.color='#ffffff';
    if(m){m.style.color='#9ca3af';m.setAttribute('onmouseover',"this.style.backgroundColor='#1f2937'");m.setAttribute('onmouseout',"this.style.backgroundColor='transparent'");}
    if(d){d.style.backgroundColor='#1f2937';d.style.borderColor='#374151';}
    if(th){th.style.color='#e5e7eb';th.setAttribute('onmouseover',"this.style.backgroundColor='#374151'");th.setAttribute('onmouseout',"this.style.backgroundColor='transparent'");}
    if(cl){cl.style.color='#e5e7eb';cl.setAttribute('onmouseover',"this.style.backgroundColor='#374151'");cl.setAttribute('onmouseout',"this.style.backgroundColor='transparent'");}
    if(ms)ms.style.backgroundColor='#030712';
    if(ty)ty.style.backgroundColor='#030712';
    if(f){f.style.backgroundColor='#111827';f.style.borderColor='#1f2937';}
    if(i){
      i.style.backgroundColor='#1f2937';
      i.style.borderColor='#374151';
      i.style.color='#ffffff';
      i.setAttribute('placeholder',C.p);
      // Update focus handler for dark mode - brighter border (replaces default, no outline)
      // Use #9ca3af for better visibility in dark mode (lighter than #6b7280)
      i.setAttribute('onfocus',"this.style.borderColor='#9ca3af';this.style.outline='none';");
      i.setAttribute('onblur',"this.style.borderColor='#374151';this.style.outline='none';");
    }
    if(se){se.style.color='#d1d5db';se.setAttribute('onmouseover',"this.style.backgroundColor='#1f2937'");se.setAttribute('onmouseout',"this.style.backgroundColor='transparent'");}
    // Redraw messages with correct dark mode colors
    draw();
  }else{
    if(w)w.style.backgroundColor='#ffffff';
    if(header){header.style.backgroundColor='#ffffff';header.style.borderColor='#f3f4f6';}
    if(title)title.style.color='#111827';
    if(m){m.style.color='#6b7280';m.setAttribute('onmouseover',"this.style.backgroundColor='#f3f4f6'");m.setAttribute('onmouseout',"this.style.backgroundColor='transparent'");}
    if(d){d.style.backgroundColor='#ffffff';d.style.borderColor='#f3f4f6';}
    if(th){th.style.color='#374151';th.setAttribute('onmouseover',"this.style.backgroundColor='#f9fafb'");th.setAttribute('onmouseout',"this.style.backgroundColor='transparent'");}
    if(cl){cl.style.color='#374151';cl.setAttribute('onmouseover',"this.style.backgroundColor='#f9fafb'");cl.setAttribute('onmouseout',"this.style.backgroundColor='transparent'");}
    if(ms)ms.style.backgroundColor='#f9fafb';
    if(ty)ty.style.backgroundColor='#f9fafb';
    if(f){f.style.backgroundColor='#ffffff';f.style.borderColor='#f3f4f6';}
    if(i){
      i.style.backgroundColor='#f9fafb';
      i.style.borderColor='#e5e7eb';
      i.style.color='#111827';
      i.setAttribute('placeholder',C.p);
      // Update focus handler for light mode - darker border (replaces default, no outline)
      i.setAttribute('onfocus',"this.style.borderColor='#6b7280';this.style.outline='none';");
      i.setAttribute('onblur',"this.style.borderColor='#e5e7eb';this.style.outline='none';");
    }
    if(se){se.style.color='#4b5563';se.setAttribute('onmouseover',"this.style.backgroundColor='#f3f4f6'");se.setAttribute('onmouseout',"this.style.backgroundColor='transparent'");}
    // Redraw messages with correct light mode colors
    draw();
  }
}

function flip(){
  open=!open;
  const w=$('cb-w'),o=$('cb-o'),x=$('cb-x'),input=$('cb-i');
  if(w){
    // Use inline styles for reliable positioning
    if(open){
      w.style.opacity='1';
      w.style.transform='scale(1)';
      w.style.pointerEvents='auto';
    }else{
      w.style.opacity='0';
      w.style.transform='scale(0.95)';
      w.style.pointerEvents='none';
    }
  }
  if(o){
    if(open){
      o.style.opacity='0';
      o.style.transform='scale(0.5)';
    }else{
      o.style.opacity='1';
      o.style.transform='scale(1)';
    }
  }
  if(x){
    if(open){
      x.style.opacity='1';
      x.style.transform='scale(1)';
    }else{
      x.style.opacity='0';
      x.style.transform='scale(0.5)';
    }
  }
  if(open){
    if(input)input.focus();
    if(!msgs.length)add('assistant',C.g);
  }
}

function add(r,c){
  msgs.push({role:r,content:c});
  draw();
}

function esc(t){
  const d=document.createElement('div');
  d.textContent=t;
  return d.innerHTML.replace(/\n/g,'<br>');
}

function draw(){
  const ms=$('cb-ms');
  if(!ms)return;
  // Check dark mode from the actual DOM element, not just the variable
  const cb=$('cb');
  const isDark=cb&&cb.classList.contains('dark');
  ms.innerHTML=msgs.map((m,i)=>m.role==='user'
    ?`<div style="display:flex!important;justify-content:flex-end!important;"><div style="background-color:#000000!important;color:#ffffff!important;border-radius:1rem 1rem 0.25rem 1rem!important;padding:0.75rem 1rem!important;max-width:85%!important;border:1px solid ${isDark?'#4b5563':'#e5e7eb'}!important;font-size:0.875rem!important;line-height:1.5!important;white-space:pre-wrap!important;word-wrap:break-word!important;"><div id="m${i}">${esc(m.content)}</div></div></div>`
    :`<div style="display:flex!important;justify-content:flex-start!important;"><div style="background-color:${isDark?'#1f2937':'#ffffff'}!important;color:${isDark?'#f9fafb':'#111827'}!important;border-radius:1rem 1rem 1rem 0.25rem!important;padding:0.75rem 1rem!important;max-width:85%!important;border:1px solid ${isDark?'#374151':'#e5e7eb'}!important;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)!important;font-size:0.875rem!important;line-height:1.5!important;white-space:pre-wrap!important;word-wrap:break-word!important;"><div style="display:flex!important;align-items:center!important;gap:0.5rem!important;margin-bottom:0.5rem!important;"><div style="width:1.5rem!important;height:1.5rem!important;background-color:#000000!important;border-radius:9999px!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;"><svg style="width:1rem!important;height:1rem!important;color:white!important;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg></div><span style="font-size:0.875rem!important;font-weight:500!important;color:${isDark?'#d1d5db':'#374151'}!important;">${C.t}</span></div><div id="m${i}">${esc(m.content)}</div></div></div>`
  ).join('');
  ms.scrollTop=ms.scrollHeight;
}

async function send(e){
  e.preventDefault();
  const input=$('cb-i'),submit=$('cb-se'),typingEl=$('cb-ty'),ms=$('cb-ms');
  if(!input)return;
  const m=input.value.trim();
  if(!m||typing)return;
  add('user',m);
  input.value='';
  if(submit)submit.disabled=1;
  typing=1;
  // Wait for scroll to complete before showing typing indicator
  // This ensures the user message is fully visible before the "Thinking..." overlay appears
  setTimeout(()=>{
    if(typingEl)typingEl.style.display='block';
    // Scroll again after showing typing indicator to ensure it's visible
    if(ms)ms.scrollTop=ms.scrollHeight;
  },100);
  try{
    const r=await fetch(C.u+'/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:m}),
      credentials:'include'
    });
    if(!r.ok||!r.body)throw new Error('Request failed');
    const rd=r.body.getReader();
    const dc=new TextDecoder();
    let t='',idx=null;
    while(1){
      const{done,value}=await rd.read();
      if(done)break;
      for(const ln of dc.decode(value,{stream:1}).split('\n')){
        if(!ln.startsWith('data: '))continue;
        const d=ln.slice(6);
        if(d==='[DONE]')continue;
        try{
          const p=JSON.parse(d);
          if(p.response){
            t+=p.response;
            if(idx===null){
              if(typingEl)typingEl.style.display='none';
              typing=0;
              msgs.push({role:'assistant',content:t});
              idx=msgs.length-1;
              draw();
            }else{
              msgs[idx].content=t;
              const el=$('m'+idx);
              if(el)el.innerHTML=esc(t);
            }
            if(ms)ms.scrollTop=ms.scrollHeight;
          }
        }catch(e){}
      }
    }
  }catch(e){
    if(typingEl)typingEl.style.display='none';
    typing=0;
    add('assistant','Sorry, an error occurred.');
  }finally{
    if(submit)submit.disabled=0;
    typing=0;
    if(typingEl)typingEl.style.display='none';
  }
}

async function load(){
  try{
    const r=await fetch(C.u+'/api/history',{credentials:'include'});
    if(r.ok){
      const d=await r.json();
      if(d.messages&&Array.isArray(d.messages)&&d.messages.length){
        msgs=d.messages;
        draw();
      }
    }
  }catch(e){}
}

// Initialize when body is available
function waitForBody(){
  if(document.body){
    init();
  }else{
    setTimeout(waitForBody,10);
  }
}

// Start initialization
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',waitForBody);
}else{
  waitForBody();
}
})();
