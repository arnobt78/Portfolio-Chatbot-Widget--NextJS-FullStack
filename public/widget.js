/** Portfolio Chatbot Widget - Fast Loading Embeddable Script */
(function(){
'use strict';
const C={
  u:window.CHATBOT_BASE_URL||window.location.origin,
  t:window.CHATBOT_TITLE||'Arnob\'s Assistant',
  p:window.CHATBOT_PLACEHOLDER||'Ask about Arnob...',
  g:window.CHATBOT_GREETING||'👋 How can I help you today?'
};
let open=0,msgs=[],typing=0,menu=0,dark=false;
try{dark=matchMedia('(prefers-color-scheme:dark)').matches;}catch(e){}
const $=id=>document.getElementById(id),tog=(e,c,on)=>e&&e.classList&&e.classList.toggle(c,on);

function init(){
  // Create button immediately - appears instantly
  const btn=document.createElement('button');
  btn.id='cb-btn';
  btn.className='fixed bottom-6 right-6 w-14 h-14 bg-black rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all z-[99999]';
  btn.style.cssText='pointer-events:auto!important;background-color:#000000!important;border-radius:9999px!important;width:3.5rem!important;height:3.5rem!important;';
  btn.innerHTML=`<svg id="cb-o" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg><svg id="cb-x" class="w-6 h-6 text-white absolute opacity-0 scale-50 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>`;
  document.body.appendChild(btn);
  
  // Load CSS asynchronously (non-blocking)
  const l=document.createElement('link');
  l.rel='stylesheet';
  l.href=C.u+'/styles.css';
  document.head.appendChild(l);
  
  // Create chat window
  const d=document.createElement('div');
  d.id='cb';
  d.innerHTML=`<div id="cb-w" class="fixed bottom-24 right-6 w-[400px] h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[99999] opacity-0 scale-95 pointer-events-none transition-all origin-bottom-right bg-white dark:bg-gray-900">
<div class="flex items-center justify-between px-5 py-4 border-b bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-black rounded-full flex items-center justify-center"><span class="text-white font-bold text-lg">A</span></div><h3 class="font-semibold text-gray-900 dark:text-white">${C.t}</h3></div>
<div class="relative"><button id="cb-m" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><svg class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg></button>
<div id="cb-d" class="hidden absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50">
<button id="cb-th" class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><svg id="cb-s" class="w-4 h-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/></svg><svg id="cb-n" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg><span id="cb-tt">Dark Mode</span></button>
<button id="cb-cl" class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>Clear Chat</button></div></div></div>
<div id="cb-ms" class="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50 dark:bg-gray-950"></div>
<div id="cb-ty" class="hidden px-5 pb-2 bg-gray-50 dark:bg-gray-950"><div class="flex items-center gap-2 text-gray-400 text-sm"><div class="flex gap-1"><span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span><span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:.15s"></span><span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:.3s"></span></div>Thinking...</div></div>
<form id="cb-f" class="flex items-center gap-3 px-4 py-4 border-t bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"><input id="cb-i" type="text" class="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600" placeholder="${C.p}" autocomplete="off"/><button type="submit" id="cb-se" class="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full disabled:opacity-50"><svg class="w-5 h-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/></svg></button></form></div>`;
  document.body.appendChild(d);
  
  bind();
  theme();
  // Load history in background (non-blocking)
  setTimeout(()=>load().catch(()=>{}),100);
}

function bind(){
  const btn=$('cb-btn'),form=$('cb-f'),menuBtn=$('cb-m'),themeBtn=$('cb-th'),clearBtn=$('cb-cl'),dropdown=$('cb-d');
  if(btn)btn.onclick=flip;
  if(form)form.onsubmit=send;
  if(menuBtn)menuBtn.onclick=e=>{e.stopPropagation();menu=!menu;tog(dropdown,'hidden',!menu);};
  if(themeBtn)themeBtn.onclick=()=>{dark=!dark;theme();menu=0;tog(dropdown,'hidden',1);};
  if(clearBtn)clearBtn.onclick=()=>{msgs=[];draw();menu=0;tog(dropdown,'hidden',1);};
  document.onclick=()=>menu&&(menu=0,tog(dropdown,'hidden',1));
}

function theme(){
  const cb=$('cb'),tt=$('cb-tt'),s=$('cb-s'),n=$('cb-n');
  tog(cb,'dark',dark);
  if(tt)tt.textContent=dark?'Light Mode':'Dark Mode';
  tog(s,'hidden',!dark);
  tog(n,'hidden',dark);
}

function flip(){
  open=!open;
  const w=$('cb-w'),o=$('cb-o'),x=$('cb-x'),input=$('cb-i');
  if(w){
    tog(w,'opacity-0',!open);
    tog(w,'scale-95',!open);
    tog(w,'pointer-events-none',!open);
    tog(w,'opacity-100',open);
    tog(w,'scale-100',open);
  }
  if(o){
    tog(o,'opacity-0',open);
    tog(o,'scale-50',open);
  }
  if(x){
    tog(x,'opacity-0',!open);
    tog(x,'scale-50',!open);
    tog(x,'opacity-100',open);
    tog(x,'scale-100',open);
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
  ms.innerHTML=msgs.map((m,i)=>m.role==='user'
    ?`<div class="flex justify-end"><div class="bg-black text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]"><div id="m${i}" class="text-sm whitespace-pre-wrap">${esc(m.content)}</div></div></div>`
    :`<div class="flex justify-start"><div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] border border-gray-200 dark:border-gray-700 shadow-sm"><div class="flex items-center gap-2 mb-2"><div class="w-6 h-6 bg-black rounded-full flex items-center justify-center"><span class="text-white font-bold text-xs">A</span></div><span class="text-sm font-medium text-gray-700 dark:text-gray-300">${C.t}</span></div><div id="m${i}" class="text-sm leading-relaxed whitespace-pre-wrap">${esc(m.content)}</div></div></div>`
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
  tog(typingEl,'hidden',0);
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
              tog(typingEl,'hidden',1);
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
    tog(typingEl,'hidden',1);
    typing=0;
    add('assistant','Sorry, an error occurred.');
  }finally{
    if(submit)submit.disabled=0;
    typing=0;
    tog(typingEl,'hidden',1);
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

// Initialize immediately - button appears instantly
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
}else{
  init();
}
})();
