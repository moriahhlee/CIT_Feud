(() => {
  const rounds = window.CIT_FEUD_ROUNDS || [];
  let roundIndex = 0;
  let scores = [0, 0];
  let strikeCount = 0;
  let revealed = new Set();

  const $ = id => document.getElementById(id);
  const els = {
    team1Score:$('team1Score'), team2Score:$('team2Score'), roundNumber:$('roundNumber'),
    roundTitle:$('roundTitle'), question:$('question'), board:$('answerBoard'), roundBank:$('roundBank'),
    strikes:$('strikes'), previous:$('previousRound'), next:$('nextRound'), modal:$('modal'), modalText:$('modalText')
  };

  function currentRound(){ return rounds[roundIndex]; }
  function bankTotal(){
    const r = currentRound();
    return [...revealed].reduce((sum, i) => sum + Number(r.answers[i]?.[1] || 0), 0);
  }
  function updateScores(){ els.team1Score.textContent=scores[0]; els.team2Score.textContent=scores[1]; }
  function updateBank(){ els.roundBank.textContent=bankTotal(); }
  function updateStrikes(){
    els.strikes.innerHTML = strikeCount ? Array.from({length:strikeCount},()=>'<b>✕</b>').join('') : '<span>—</span>';
  }
  function renderRound(){
    if(!rounds.length){ els.question.textContent='Add rounds in index.html to begin.'; return; }
    const r=currentRound();
    revealed=new Set(); strikeCount=0;
    els.roundNumber.textContent=`ROUND ${roundIndex+1}`;
    els.roundTitle.textContent=r.title;
    els.question.textContent=r.question;
    els.board.innerHTML='';
    r.answers.forEach((answer,i)=>{
      const btn=document.createElement('button');
      btn.className='answer';
      btn.innerHTML=`<span class="revealed"><span class="answer-text">${escapeHtml(answer[0])}</span><span class="answer-points">${Number(answer[1])||0}</span></span><span class="cover"><b>${i+1}</b></span>`;
      btn.addEventListener('click',()=>reveal(i,btn));
      els.board.appendChild(btn);
    });
    els.previous.disabled=roundIndex===0;
    els.next.disabled=roundIndex===rounds.length-1;
    updateBank(); updateStrikes();
  }
  function reveal(i,btn){
    if(revealed.has(i)) return;
    revealed.add(i); btn.classList.add('open'); updateBank();
  }
  function changeScore(team, amount){
    scores[team-1]=Math.max(0,scores[team-1]+amount); updateScores();
  }
  function awardBank(team){ const total=bankTotal(); if(total>0) changeScore(team,total); }
  function addStrike(){ strikeCount=Math.min(3,strikeCount+1); updateStrikes(); }
  function openNote(){ els.modalText.textContent=currentRound()?.note || 'No facilitator note entered for this round.'; els.modal.classList.add('show'); els.modal.setAttribute('aria-hidden','false'); }
  function closeNote(){ els.modal.classList.remove('show'); els.modal.setAttribute('aria-hidden','true'); }
  function escapeHtml(value){ const d=document.createElement('div'); d.textContent=String(value); return d.innerHTML; }

  $('previousRound').addEventListener('click',()=>{if(roundIndex>0){roundIndex--;renderRound();}});
  $('nextRound').addEventListener('click',()=>{if(roundIndex<rounds.length-1){roundIndex++;renderRound();}});
  $('resetBoard').addEventListener('click',renderRound);
  $('awardTeam1').addEventListener('click',()=>awardBank(1));
  $('awardTeam2').addEventListener('click',()=>awardBank(2));
  $('addStrike').addEventListener('click',addStrike);
  $('clearStrikes').addEventListener('click',()=>{strikeCount=0;updateStrikes();});
  $('facilitatorNote').addEventListener('click',openNote);
  $('closeModal').addEventListener('click',closeNote);
  $('resetGame').addEventListener('click',()=>{if(confirm('Reset both team scores and return to Round 1?')){scores=[0,0];roundIndex=0;updateScores();renderRound();}});
  document.querySelectorAll('[data-score-team]').forEach(btn=>btn.addEventListener('click',()=>{
    const value=Math.abs(parseInt($('manualPoints').value,10)||0);
    changeScore(Number(btn.dataset.scoreTeam),value*Number(btn.dataset.scoreDirection));
  }));
  document.addEventListener('keydown',e=>{
    if(e.target.matches('input')) return;
    if(/^[1-8]$/.test(e.key)){
      const i=Number(e.key)-1, btn=els.board.children[i]; if(btn) reveal(i,btn);
    } else if(e.key.toLowerCase()==='x') addStrike();
    else if(e.key.toLowerCase()==='f') openNote();
    else if(e.key==='ArrowRight' && roundIndex<rounds.length-1){roundIndex++;renderRound();}
    else if(e.key==='ArrowLeft' && roundIndex>0){roundIndex--;renderRound();}
    else if(e.key==='Escape') closeNote();
  });

  updateScores(); renderRound();
})();
