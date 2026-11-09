'use strict';
/* ============ UTILIDADES ============ */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const COLORS = ['#ff5d73','#4da3ff','#ffc94d','#4de0a0','#b583ff','#ff9a4d','#4dd9e0','#ff7ad9','#a4e04d','#9aa5b8'];
const TEAM_LABEL = {2:'Duplas',3:'Trios',4:'Quartetos',5:'Quintetos'};
const teamLabel = n => TEAM_LABEL[n] || ('Times de ' + n);

const BANK = {
  'Animais':['Elefante','Girafa','Macaco','Cachorro','Gato','Cobra','Pinguim','Canguru','Coelho','Tartaruga','Leão','Caranguejo','Borboleta','Galinha','Cavalo','Polvo','Morcego','Pato','Tubarão','Sapo','Urso','Jacaré','Aranha','Papagaio','Golfinho'],
  'Filmes e Séries':['Titanic','Homem-Aranha','Shrek','Rei Leão','Harry Potter','Frozen','Toy Story','Procurando Nemo','Jurassic Park','Batman','Matrix','Velozes e Furiosos','Todo Mundo em Pânico','Chaves','Stranger Things','Round 6','Avatar','King Kong','Homem de Ferro','Branca de Neve','Cinderela','Os Vingadores','Cidade de Deus','Divertida Mente','Minions'],
  'Profissões':['Médico','Professor','Bombeiro','Cozinheiro','Policial','Dentista','Pintor','Jogador de futebol','Piloto','Cabeleireiro','Padeiro','Pescador','Mágico','Palhaço','Fotógrafo','Jardineiro','Garçom','Astronauta','Motorista','Pedreiro','Dançarina','Cantor','Veterinário','Mecânico','Juiz'],
  'Ações':['Escovar os dentes','Dirigir','Nadar','Pescar','Tomar banho','Dormir','Pular corda','Cozinhar','Andar de bicicleta','Tirar selfie','Jogar videogame','Pentear o cabelo','Lavar louça','Surfar','Cantar no karaokê','Atravessar a rua','Tocar guitarra','Soprar velas','Espirrar','Escalar montanha','Passar roupa','Tomar sorvete','Fazer yoga','Digitar no computador','Dançar valsa'],
  'Objetos':['Guarda-chuva','Telefone','Escada','Tesoura','Relógio','Óculos','Violão','Espelho','Vassoura','Bicicleta','Chave','Geladeira','Balão','Martelo','Câmera','Cadeira','Ventilador','Mochila','Secador de cabelo','Controle remoto','Lanterna','Microfone','Aspirador de pó','Escova de dentes','Cama'],
  'Comidas':['Pizza','Pipoca','Sorvete','Macarrão','Hambúrguer','Churrasco','Brigadeiro','Banana','Melancia','Sushi','Café','Pastel','Coxinha','Bolo','Ovo frito','Cachorro-quente','Milho','Açaí','Feijoada','Chocolate','Sanduíche','Pão de queijo','Salada','Sopa','Algodão-doce'],
  'Esportes':['Futebol','Vôlei','Basquete','Natação','Boxe','Judô','Tênis','Golfe','Skate','Ginástica','Ciclismo','Surfe','Corrida','Handebol','Esgrima','Arco e flecha','Patinação','Levantamento de peso','Pingue-pongue','Beisebol','Remo','Escalada','Salto com vara','Karatê','Sinuca'],
  'Lugares':['Praia','Hospital','Escola','Circo','Cinema','Aeroporto','Zoológico','Floresta','Deserto','Biblioteca','Academia','Supermercado','Parque de diversões','Igreja','Castelo','Farmácia','Banco','Padaria','Estádio','Museu','Praça','Piscina','Rodoviária','Fazenda','Lua']
};
const ALL_CATS = Object.keys(BANK);

function shuffle(a){ a=[...a]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function norm(s){ return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim(); }
function lev(a,b){
  const m=a.length,n=b.length; if(!m)return n; if(!n)return m;
  let p=Array.from({length:n+1},(_,i)=>i);
  for(let i=1;i<=m;i++){ const c=[i]; for(let j=1;j<=n;j++) c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1)); p=c; }
  return p[n];
}
function isMatch(guess,word){
  const g=norm(guess), w=norm(word); if(!g||!w) return false;
  if(g===w) return true;
  if((' '+g+' ').includes(' '+w+' ')) return true;
  if(w.length>=5 && lev(g,w)<=1) return true;
  return false;
}
function el(tag,cls,text){ const e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
function show(id){ $$('.screen').forEach(s=>s.classList.toggle('active',s.id===id)); window.scrollTo(0,0); }
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('show'),2600); }
function busy(on,txt){ $('#busy').hidden=!on; if(txt) $('#busyTxt').textContent=txt; }
function beep(f=660,d=.18){ try{ const C=window.AudioContext||window.webkitAudioContext; if(!beep.c) beep.c=new C(); const o=beep.c.createOscillator(),g=beep.c.createGain(); o.frequency.value=f; g.gain.value=.15; o.connect(g); g.connect(beep.c.destination); o.start(); o.stop(beep.c.currentTime+d); }catch(e){} }
function makePool(cats){
  let list=shuffle([...new Set(cats.flatMap(c=>BANK[c]||[]))]), i=0;
  return { next(){ if(i>=list.length){ list=shuffle(list); i=0; } return list[i++]; } };
}
function fillSelect(sel,vals,fmt){ sel.innerHTML=''; vals.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=fmt?fmt(v):v; sel.appendChild(o); }); }
function chips(box,selected,onChange,disabled){
  box.innerHTML='';
  ALL_CATS.forEach(c=>{
    const b=el('button','chip'+(selected.includes(c)?' on':''),c); b.type='button'; b.disabled=!!disabled;
    b.onclick=()=>{ const n=selected.includes(c)?selected.filter(x=>x!==c):[...selected,c]; if(n.length) onChange(n); };
    box.appendChild(b);
  });
}
function rankList(box,teams){
  box.innerHTML='';
  const medals=['🥇','🥈','🥉'];
  const sorted=teams.map((t,i)=>({...t,i})).sort((a,b)=>b.score-a.score);
  const best=sorted[0]?sorted[0].score:0;
  sorted.forEach((t,k)=>{
    const r=el('div','r'+(t.score===best?' first':'')); r.style.setProperty('--c',COLORS[t.i%COLORS.length]);
    r.appendChild(el('div','pos',medals[k]||(k+1)+'º'));
    const nm=el('div','nm',t.name); if(t.members){ nm.appendChild(el('small',null,t.members)); }
    r.appendChild(nm); r.appendChild(el('div','pt',t.score)); box.appendChild(r);
  });
}
function scoreChips(box,teams,active){
  box.innerHTML='';
  teams.forEach((t,i)=>{ const d=el('div','score'+(i===active?' act':'')); d.style.setProperty('--c',COLORS[i%COLORS.length]); d.append(el('b',null,t.name),el('span',null,t.score)); box.appendChild(d); });
}

/* ============ NAVEGAÇÃO ============ */
$$('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
$('#btnOnline').onclick=()=>{ show('omenu'); };
$('#btnLocal').onclick=()=>{ localSetup(); show('lsetup'); };

/* ============ MODO ONLINE (PeerJS / WebRTC) ============ */
const PEER_OPTS={debug:0,config:{iceServers:[
  {urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'},
  {urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turns:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}
],iceCandidatePoolSize:4}};
const NET={peer:null,conns:new Map(),host:false,me:null,hostConn:null,code:'',leaving:false};
let G=null;       // estado completo (apenas anfitrião)
let S=null;       // estado público (todos)
let myWord='';
let localEnd=0;

const cleanName=n=>(n||'').trim().slice(0,14)||'Jogador';
const genCode=()=>{ const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return Array.from({length:5},()=>a[Math.floor(Math.random()*a.length)]).join(''); };
const oErr=m=>{ $('#oErr').textContent=m||''; };

function resetNet(){
  NET.leaving=true;
  try{ NET.conns.forEach(c=>c.close()); }catch(e){}
  try{ NET.peer&&NET.peer.destroy(); }catch(e){}
  if(G&&G.tm) clearTimeout(G.tm);
  NET.peer=null; NET.conns=new Map(); NET.host=false; NET.me=null; NET.hostConn=null; G=null; S=null; myWord='';
  setTimeout(()=>{NET.leaving=false;},300);
}

/* ---- criar sala ---- */
$('#btnCreate').onclick=()=>{
  oErr(''); if(typeof Peer==='undefined'){ oErr('Falha ao carregar a biblioteca online. Verifique sua internet.'); return; }
  const name=cleanName($('#oName').value); busy(true,'Criando sala...');
  const attempt=n=>{
    const code=genCode(); const peer=new Peer('pistavisual-'+code,PEER_OPTS);
    let opened=false;
    peer.on('open',()=>{
      opened=true; NET.peer=peer; NET.host=true; NET.me='host'; NET.code=code; NET.leaving=false;
      initHost(name); peer.on('connection',onConn); busy(false); broadcast();
    });
    peer.on('error',e=>{
      if(!opened){ peer.destroy(); if(e.type==='unavailable-id'&&n<5) attempt(n+1); else { busy(false); oErr('Não foi possível criar a sala ('+e.type+').'); } }
      else if(e.type!=='peer-unavailable') toast('Erro de conexão: '+e.type);
    });
    peer.on('disconnected',()=>{ try{peer.reconnect();}catch(e){} });
  };
  attempt(0);
};

/* ---- entrar na sala ---- */
$('#btnJoin').onclick=()=>{
  oErr(''); if(typeof Peer==='undefined'){ oErr('Falha ao carregar a biblioteca online. Verifique sua internet.'); return; }
  const code=$('#oCode').value.replace(/[^a-zA-Z0-9]/g,'').toUpperCase(); if(code.length!==5){ oErr('Digite o código de 5 letras da sala.'); return; }
  const name=cleanName($('#oName').value); busy(true,'Entrando na sala...');
  const peer=new Peer(undefined,PEER_OPTS); let done=false;
  const fail=m=>{ if(done)return; done=true; busy(false); oErr(m); try{peer.destroy();}catch(e){} };
  const to=setTimeout(()=>fail('Tempo esgotado. Verifique o código e a internet dos dois aparelhos.'),20000);
  peer.on('error',e=>{ clearTimeout(to); fail(e.type==='peer-unavailable'?'Sala não encontrada.':'Erro de conexão ('+e.type+').'); });
  peer.on('open',id=>{
    const conn=peer.connect('pistavisual-'+code,{reliable:true});
    conn.on('open',()=>{
      clearTimeout(to); done=true; NET.peer=peer; NET.hostConn=conn; NET.me=id; NET.code=code; NET.host=false; NET.leaving=false;
      conn.send({t:'join',name});
    });
    conn.on('data',clientData);
    conn.on('close',()=>{ if(NET.leaving) return; if(!done){ fail('Não foi possível entrar.'); return; } resetNet(); busy(false); show('home'); toast('A sala foi encerrada.'); });
  });
};

/* ---- anfitrião ---- */
function initHost(name){
  G={phase:'lobby',players:[{id:'host',name,team:0,on:true}],
     settings:{teamSize:2,rounds:2,time:60,cats:[...ALL_CATS]},
     teams:[],turnNo:0,total:0,cur:null,skips:0,got:0,words:[],feed:[],last:null,word:'',pool:null,endsAt:0,tm:null};
  assignTeams(false);
}
function assignTeams(shuf){
  const ps=shuf?shuffle(G.players):G.players;
  const n=Math.max(1,Math.floor(ps.length/G.settings.teamSize));
  G.teams=Array.from({length:n},(_,i)=>({name:'Time '+(i+1),score:0}));
  ps.forEach((p,i)=>p.team=i%n);
}
function onConn(conn){
  conn.on('data',msg=>{
    if(!G||!msg) return;
    if(msg.t==='join'&&!NET.conns.has(conn.peer)){
      const deny=m=>{ try{conn.send({t:'deny',m});}catch(e){} setTimeout(()=>conn.close(),400); };
      if(G.phase!=='lobby') return deny('A partida já começou.');
      if(G.players.length>=20) return deny('Sala cheia (máx. 20 jogadores).');
      NET.conns.set(conn.peer,conn);
      let nm=cleanName(msg.name),k=2; const base=nm; while(G.players.some(p=>p.name===nm)) nm=base+' '+(k++);
      G.players.push({id:conn.peer,name:nm,team:0,on:true}); assignTeams(false); broadcast();
    } else if(NET.conns.has(conn.peer)) hostHandle(conn.peer,msg);
  });
  conn.on('close',()=>hostLeave(conn.peer));
  conn.on('error',()=>hostLeave(conn.peer));
}
function hostLeave(id){
  if(!G||!NET.conns.has(id)) return; NET.conns.delete(id);
  const p=G.players.find(x=>x.id===id); if(!p) return;
  if(G.phase==='lobby'){ G.players=G.players.filter(x=>x!==p); assignTeams(false); }
  else{
    p.on=false;
    if(G.phase==='turn'&&G.cur.performer===id) endTurn();
    else if(G.phase==='ready'&&G.cur&&G.cur.performer===id) setCur();
  }
  broadcast();
}
function applyCfg(k,v){
  const s=G.settings;
  if(k==='teamSize'){ s.teamSize=Math.min(10,Math.max(2,+v||2)); assignTeams(false); }
  else if(k==='rounds') s.rounds=Math.min(8,Math.max(1,+v||1));
  else if(k==='time') s.time=Math.min(180,Math.max(20,+v||60));
  else if(k==='cats'){ const c=(Array.isArray(v)?v:[]).filter(x=>ALL_CATS.includes(x)); if(c.length) s.cats=c; }
}
function setCur(){
  while(G.turnNo<G.total){
    const ti=G.turnNo%G.teams.length, rd=Math.floor(G.turnNo/G.teams.length);
    const mem=G.players.filter(p=>p.team===ti&&p.on);
    if(mem.length){ G.cur={team:ti,performer:mem[rd%mem.length].id}; return; }
    G.turnNo++;
  }
  G.phase='end';
}
function startGame(){
  G.teams.forEach(t=>t.score=0); G.total=G.settings.rounds*G.teams.length; G.turnNo=0;
  G.feed=[]; G.last=null; G.pool=makePool(G.settings.cats); G.phase='ready'; setCur();
}
function sendWord(){
  const id=G.cur.performer;
  if(id==='host'){ myWord=G.word; renderGame(); }
  else { const c=NET.conns.get(id); if(c&&c.open) c.send({t:'word',w:G.word}); }
}
function nextWord(){ G.word=G.pool.next(); sendWord(); }
function startTurn(){
  G.phase='turn'; G.skips=3; G.got=0; G.words=[]; G.feed=[];
  G.endsAt=Date.now()+G.settings.time*1000; clearTimeout(G.tm);
  G.tm=setTimeout(()=>{ if(G&&G.phase==='turn'){ endTurn(); broadcast(); } },G.settings.time*1000+50);
  nextWord();
}
function gotIt(){ G.words.push(G.word); G.teams[G.cur.team].score++; G.got++; nextWord(); }
function endTurn(){
  clearTimeout(G.tm);
  const per=G.players.find(p=>p.id===G.cur.performer);
  G.last={team:G.cur.team,performer:per?per.name:'?',words:G.words||[]};
  G.words=[]; G.word=''; myWord=''; G.phase='ready'; G.turnNo++; setCur();
}
function guess(id,text){
  if(G.phase!=='turn'||!text.trim()) return;
  const p=G.players.find(x=>x.id===id); if(!p||p.team!==G.cur.team||id===G.cur.performer) return;
  const ok=isMatch(text,G.word); G.feed.push({n:p.name,t:text,ok}); if(G.feed.length>40) G.feed.shift();
  if(ok) gotIt();
}
function hostHandle(id,msg){
  const H=id==='host';
  switch(msg.t){
    case 'cfg': if(H&&G.phase==='lobby') applyCfg(msg.k,msg.v); break;
    case 'shuffle': if(H&&G.phase==='lobby') assignTeams(true); break;
    case 'start': if(H&&G.phase==='lobby'&&G.players.length>=2) startGame(); break;
    case 'go': if(G.phase==='ready'){ const per=G.players.find(p=>p.id===G.cur.performer); if(id===G.cur.performer||(H&&per&&!per.on)) startTurn(); } break;
    case 'ok': if(G.phase==='turn'&&id===G.cur.performer) gotIt(); break;
    case 'skip': if(G.phase==='turn'&&id===G.cur.performer&&G.skips>0){ G.skips--; nextWord(); } break;
    case 'guess': guess(id,String(msg.text||'').slice(0,40)); break;
    case 'again': if(H&&G.phase==='end'){ G.phase='lobby'; G.players=G.players.filter(p=>p.on||p.id==='host'); G.teams.forEach(t=>t.score=0); assignTeams(false); } break;
    default: return;
  }
  broadcast();
}
function pub(){
  return {phase:G.phase,players:G.players.map(({id,name,team,on})=>({id,name,team,on})),settings:G.settings,teams:G.teams,
    turnNo:G.turnNo,total:G.total,cur:G.cur,skips:G.skips,got:G.got,
    left:G.phase==='turn'?Math.max(0,G.endsAt-Date.now()):0,feed:G.feed.slice(-30),last:G.last};
}
function broadcast(){
  if(!G) return; const s=pub(); applyState(s);
  NET.conns.forEach(c=>{ if(c.open) c.send({t:'state',s}); });
}

/* ---- cliente ---- */
function clientData(msg){
  if(!msg) return;
  if(msg.t==='state') applyState(msg.s);
  else if(msg.t==='word'){ myWord=msg.w; renderGame(); }
  else if(msg.t==='deny'){ resetNet(); busy(false); show('omenu'); oErr(msg.m); }
}
function act(msg){
  if(NET.host) hostHandle('host',msg);
  else if(NET.hostConn&&NET.hostConn.open) NET.hostConn.send(msg);
}

/* ---- renderização ---- */
function applyState(s){
  S=s; localEnd=Date.now()+s.left;
  if(s.phase==='lobby'){ show('lobby'); renderLobby(); }
  else if(s.phase==='end'){ show('end'); renderEnd(); }
  else{ if(!$('#game').classList.contains('active')) show('game'); renderGame(); }
}
const me=()=>S&&S.players.find(p=>p.id===NET.me);

function renderLobby(){
  const s=S, host=NET.host;
  $('#lCode').textContent=NET.code;
  $('#lInfo').textContent=`${s.players.length}/20 jogadores · ${s.teams.length} ${s.teams.length>1?'times':'time'}`;
  const ul=$('#lPlayers'); ul.innerHTML='';
  s.players.forEach(p=>{
    const li=el('li'); const d=el('span','dot'); d.style.setProperty('--c',COLORS[p.team%COLORS.length]);
    li.append(d,document.createTextNode((p.id==='host'?'👑 ':'')+p.name+(p.id===NET.me?' (você)':''))); ul.appendChild(li);
  });
  const tb=$('#lTeams'); tb.innerHTML='';
  s.teams.forEach((t,i)=>{
    const d=el('div','team'); d.style.setProperty('--c',COLORS[i%COLORS.length]); d.appendChild(el('b',null,t.name));
    s.players.filter(p=>p.team===i).forEach(p=>d.appendChild(el('span',null,p.name))); tb.appendChild(d);
  });
  if(s.teams.length===1) tb.appendChild(el('p','muted','Só há um time: todos jogam juntos, em modo cooperativo. Com mais jogadores os times se dividem.'));
  const cT=$('#cTeam'),cR=$('#cRounds'),cM=$('#cTime');
  if(!cT.options.length){
    fillSelect(cT,[2,3,4,5,6,7,8,9,10],v=>`${teamLabel(v)} (${v})`);
    fillSelect(cR,[1,2,3,4,5,6,8]); fillSelect(cM,[30,45,60,90,120,180]);
  }
  cT.value=s.settings.teamSize; cR.value=s.settings.rounds; cM.value=s.settings.time;
  [cT,cR,cM].forEach(x=>x.disabled=!host);
  chips($('#cCats'),s.settings.cats,v=>act({t:'cfg',k:'cats',v}),!host);
  $('#lWho').textContent=host?'(você é o anfitrião)':'(definidas pelo anfitrião)';
  $('#btnShuffle').hidden=!host;
  $('#btnStart').hidden=!host; $('#btnStart').disabled=s.players.length<2;
  $('#btnStart').textContent=s.players.length<2?'Aguardando mais jogadores (mín. 2)':'▶ Iniciar jogo';
  $('#lWait').hidden=host;
}
$('#cTeam').onchange=e=>act({t:'cfg',k:'teamSize',v:e.target.value});
$('#cRounds').onchange=e=>act({t:'cfg',k:'rounds',v:e.target.value});
$('#cTime').onchange=e=>act({t:'cfg',k:'time',v:e.target.value});
$('#btnShuffle').onclick=()=>act({t:'shuffle'});
$('#btnStart').onclick=()=>act({t:'start'});
$('#btnCopy').onclick=()=>{ const t=NET.code; (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Código copiado!')).catch(()=>toast('Código: '+t)); };
const leave=()=>{ resetNet(); show('home'); };
$('#lbLeave').onclick=leave; $('#gLeave').onclick=()=>{ if(confirm('Sair da partida?')) leave(); }; $('#eLeave').onclick=leave;

function renderGame(){
  const s=S; if(!s||!s.cur||s.phase==='lobby'||s.phase==='end') return;
  const nT=s.teams.length;
  $('#gRound').textContent=`Rodada ${Math.min(s.settings.rounds,Math.floor(s.turnNo/nT)+1)}/${s.settings.rounds}`;
  scoreChips($('#gScores'),s.teams,s.cur.team);
  const perf=s.players.find(p=>p.id===s.cur.performer)||{name:'?',on:false};
  const isPerf=s.cur.performer===NET.me, m=me(), myTeam=m?m.team:-1, ct=s.teams[s.cur.team];
  ['pReady','pPerf','pGuess','pWatch'].forEach(id=>$('#'+id).hidden=true);
  if(s.phase==='ready'){
    $('#pReady').hidden=false;
    $('#rTitle').textContent=`Vez do ${ct.name}`;
    $('#rSub').textContent=isPerf?'Você é o mímico! Prepare-se.':`Mímico: ${perf.name}`;
    const lb=$('#rLast'); lb.innerHTML='';
    if(s.last){
      const lt=s.teams[s.last.team];
      lb.appendChild(el('div',null,`Última vez: ${lt.name} (${s.last.performer}) acertou ${s.last.words.length}`));
      s.last.words.forEach(w=>lb.appendChild(el('span','w',w)));
    }
    $('#btnGo').hidden=!(isPerf||(NET.host&&!perf.on));
  } else if(s.phase==='turn'){
    if(isPerf){
      $('#pPerf').hidden=false; $('#wordBox').textContent=myWord||'...'; $('#skipN').textContent=s.skips; $('#btnSkip').disabled=s.skips<=0;
    } else if(myTeam===s.cur.team){
      $('#pGuess').hidden=false; $('#gSub').textContent=`${perf.name} está fazendo mímica!`;
    } else {
      $('#pWatch').hidden=false; $('#wTitle').textContent=`${ct.name} está jogando`; $('#wSub').textContent=`Mímico: ${perf.name} · ${s.got} acerto(s)`;
    }
  }
  const fb=$('#gFeed'); fb.innerHTML='';
  s.feed.slice().reverse().forEach(f=>{ const li=el('li',f.ok?'ok':''); li.append(el('b',null,f.n+': '),document.createTextNode(f.t+(f.ok?' ✔':''))); fb.appendChild(li); });
}
$('#btnGo').onclick=()=>act({t:'go'});
$('#btnOk').onclick=()=>{ beep(880,.12); act({t:'ok'}); };
$('#btnSkip').onclick=()=>act({t:'skip'});
$('#gForm').onsubmit=e=>{ e.preventDefault(); const i=$('#gInput'),v=i.value.trim(); if(v) act({t:'guess',text:v}); i.value=''; i.focus(); };
setInterval(()=>{
  const t=$('#gTimer');
  if(S&&S.phase==='turn'){ const l=Math.max(0,Math.ceil((localEnd-Date.now())/1000)); t.textContent=l; t.classList.toggle('low',l<=10); if(l<=5&&l>0&&setInterval.l!==l){ setInterval.l=l; beep(520,.08); } }
  else{ t.textContent='⏱'; t.classList.remove('low'); }
},200);

function renderEnd(){
  const s=S;
  rankList($('#eRank'),s.teams.map((t,i)=>({...t,members:s.players.filter(p=>p.team===i).map(p=>p.name).join(', ')})));
  $('#btnAgain').hidden=!NET.host; $('#eWait').hidden=NET.host;
}
$('#btnAgain').onclick=()=>act({t:'again'});

/* ============ MODO LOCAL ============ */
const L={n:2,rounds:2,time:60,cats:[...ALL_CATS],names:[]};
function localSetup(){
  const sn=$('#lN'); if(!sn.options.length){ fillSelect(sn,[2,3,4,5,6,7,8,9,10]); fillSelect($('#lR'),[1,2,3,4,5,6,8]); fillSelect($('#lT'),[30,45,60,90,120,180]); sn.value=L.n; $('#lR').value=L.rounds; $('#lT').value=L.time; }
  namesUI(); chips($('#lCats'),L.cats,v=>{ L.cats=v; localSetup(); });
}
function namesUI(){
  const box=$('#lNames'); const old=$$('#lNames input').map(i=>i.value); box.innerHTML='';
  for(let i=0;i<L.n;i++){ const inp=document.createElement('input'); inp.maxlength=16; inp.setAttribute('maxlength','16'); inp.placeholder='Time '+(i+1); inp.value=old[i]||''; box.appendChild(inp); }
}
$('#lN').onchange=e=>{ L.n=+e.target.value; namesUI(); };
$('#lR').onchange=e=>L.rounds=+e.target.value;
$('#lT').onchange=e=>L.time=+e.target.value;
$('#btnLStart').onclick=()=>{
  L.names=$$('#lNames input').map((i,k)=>i.value.trim().slice(0,16)||('Time '+(k+1)));
  L.teams=L.names.map(n=>({name:n,score:0})); L.turn=0; L.total=L.rounds*L.n; L.pool=makePool(L.cats); lPass();
};
function lPass(){
  const ti=L.turn%L.n; show('lpass');
  scoreChips($('#lpScores'),L.teams,ti);
  $('#lpRound').textContent=`Rodada ${Math.floor(L.turn/L.n)+1}/${L.rounds}`;
  $('#lpTeam').textContent=`Vez do ${L.teams[ti].name}`;
}
$('#btnLReady').onclick=()=>{
  L.got=[]; L.skips=3; L.end=Date.now()+L.time*1000; L.word=L.pool.next();
  const ti=L.turn%L.n; $('#lyTeam').textContent=L.teams[ti].name; lRender(); show('lplay');
  clearInterval(L.iv); L.iv=setInterval(lTick,200); lTick();
};
function lRender(){ $('#lyWord').textContent=L.word; $('#lyGot').textContent=L.got.length+' ✔'; $('#lySkip').textContent=L.skips; $('#btnLSkip').disabled=L.skips<=0; }
function lTick(){
  const l=Math.max(0,Math.ceil((L.end-Date.now())/1000)); const t=$('#lyTimer'); t.textContent=l; t.classList.toggle('low',l<=10);
  if(l<=0) lEndTurn();
}
$('#btnLOk').onclick=()=>{ beep(880,.12); L.got.push(L.word); L.teams[L.turn%L.n].score++; L.word=L.pool.next(); lRender(); };
$('#btnLSkip').onclick=()=>{ if(L.skips>0){ L.skips--; L.word=L.pool.next(); lRender(); } };
function lEndTurn(){
  clearInterval(L.iv); beep(300,.5); if(navigator.vibrate) navigator.vibrate(300);
  const ti=L.turn%L.n;
  $('#lrTitle').textContent=`⏰ Tempo! ${L.teams[ti].name} acertou ${L.got.length}`;
  const w=$('#lrWords'); w.innerHTML=''; L.got.forEach(x=>w.appendChild(el('span','w',x)));
  rankList($('#lrScores'),L.teams);
  L.turn++; $('#btnLNext').textContent=L.turn>=L.total?'🏆 Ver resultado':'Próximo ▶'; show('lres');
}
$('#btnLNext').onclick=()=>{ if(L.turn>=L.total){ rankList($('#leRank'),L.teams); show('lend'); } else lPass(); };
$('#btnLAgain').onclick=()=>{ L.teams.forEach(t=>t.score=0); L.turn=0; L.pool=makePool(L.cats); lPass(); };
$('#btnLHome').onclick=()=>show('home');
