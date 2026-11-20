const notes = ["C","D♭","D","E♭","E","F","G♭","G","A♭","A","B♭","B"];
const answerChoices = [
  {label:"C",note:"C"},
  {label:"C♯/D♭",note:"D♭"},
  {label:"D",note:"D"},
  {label:"E♭",note:"E♭"},
  {label:"E",note:"E"},
  {label:"F",note:"F"},
  {label:"F♯/G♭",note:"G♭"},
  {label:"G",note:"G"},
  {label:"G♯/A♭",note:"A♭"},
  {label:"A",note:"A"},
  {label:"A♯/B♭",note:"B♭"},
  {label:"B",note:"B"}
];
const chordTypes = {
  major:{name:"",tones:[[0,"Root"],[4,"3rd"],[7,"5th"]]},
  minor:{name:"m",tones:[[0,"Root"],[3,"♭3rd"],[7,"5th"]]},
  aug:{name:"aug",tones:[[0,"Root"],[4,"3rd"],[8,"#5th"]]},
  dim:{name:"dim",tones:[[0,"Root"],[3,"♭3rd"],[6,"5th"]]},
  sus2:{name:"sus2",tones:[[0,"Root"],[2,"2nd"],[7,"5th"]]},
  sus4:{name:"sus4",tones:[[0,"Root"],[5,"4th"],[7,"5th"]]},
  power:{name:"5",tones:[[0,"Root"],[7,"5th"]]},
  omit3:{name:"(omit3)",tones:[[0,"Root"],[7,"5th"]]},
  slash3:{name:"",slash:true,bass:4,tones:[[0,"Root"],[4,"3rd"],[7,"5th"],[4,"Bass"]]},
  slash5:{name:"",slash:true,bass:7,tones:[[0,"Root"],[4,"3rd"],[7,"5th"],[7,"Bass"]]},
  dom7:{name:"7",tones:[[0,"Root"],[4,"3rd"],[7,"5th"],[10,"7"]]},
  maj7:{name:"△7",tones:[[0,"Root"],[4,"3rd"],[7,"5th"],[11,"7"]]},
  min7:{name:"m7",tones:[[0,"Root"],[3,"♭3rd"],[7,"5th"],[10,"7"]]},
  halfdim:{name:"m7♭5",tones:[[0,"Root"],[3,"♭3rd"],[6,"5th"],[10,"7"]]},
  dim7:{name:"dim7",tones:[[0,"Root"],[3,"♭3rd"],[6,"5th"],[9,"7"]]},
  nine:{name:"9",tones:[[0,"Root"],[4,"3rd"],[7,"5th"],[10,"7"],[2,"9th"]]},
  eleven:{name:"11",tones:[[0,"Root"],[4,"3rd"],[7,"5th"],[10,"7"],[2,"9th"],[5,"11th"]]},
  thirteen:{name:"13",tones:[[0,"Root"],[4,"3rd"],[7,"5th"],[10,"7"],[2,"9th"],[5,"11th"],[9,"13th"]]},
  add9:{name:"add9",tones:[[0,"Root"],[4,"3rd"],[7,"5th"],[2,"9th"]]}
};
const sets = {
  basic:["major","minor"],
  major:["major","maj7","add9"],
  minor:["minor","min7","halfdim"],
  seventh:["dom7","maj7","min7","halfdim","dim7"],
  all:Object.keys(chordTypes)
};
const labels = {basic:"メジャー＆マイナー",major:"メジャー中心",minor:"マイナー中心",seventh:"7th 系",all:"すべて混合"};
const $ = id => document.getElementById(id);
const screens = {setup:$("setup"),game:$("game"),result:$("result")};
let mode="basic", seconds=60, game, sound=true;

document.querySelectorAll(".mode").forEach(btn => btn.addEventListener("click",() => {
  mode = btn.dataset.mode;
  document.querySelectorAll(".mode").forEach(el => el.classList.toggle("active",el===btn));
}));
document.querySelectorAll("[data-time]").forEach(btn => btn.addEventListener("click",() => {
  seconds = Number(btn.dataset.time);
  document.querySelectorAll("[data-time]").forEach(el => el.classList.toggle("active",el===btn));
}));
$("startBtn").addEventListener("click",start);
$("retryBtn").addEventListener("click",start);
$("backBtn").addEventListener("click",() => show("setup"));
$("soundBtn").addEventListener("click",() => {
  sound=!sound;
  $("soundBtn").setAttribute("aria-pressed",sound);
  $("soundBtn").innerHTML=`♪ <span>Sound ${sound?"on":"off"}</span>`;
});

function show(name){Object.entries(screens).forEach(([key,screen])=>screen.classList.toggle("hidden",key!==name));}
function shuffle(list){return [...list].sort(()=>Math.random()-.5);}
function timeText(s){return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;}
function start(){
  if(game?.timer) clearInterval(game.timer);
  game={score:0,correct:0,wrong:0,streak:0,best:0,count:0,left:seconds,locked:false,timer:null};
  $("score").textContent="0"; $("streak").textContent="0"; $("time").textContent=timeText(seconds);
  $("bar").style.width="100%"; $("modeTitle").textContent=labels[mode]; show("game");
  nextQuestion(); game.timer=setInterval(tick,1000);
}
function tick(){
  game.left--;
  $("time").textContent=timeText(Math.max(0,game.left));
  $("bar").style.width=`${Math.max(0,game.left/seconds*100)}%`;
  if(game.left<=0){clearInterval(game.timer); finish();}
}
function nextQuestion(){
  if(!game||game.left<=0) return;
  game.locked=false; game.count++;
  const typeName=sets[mode][Math.floor(Math.random()*sets[mode].length)];
  const root=Math.floor(Math.random()*12);
  const type=chordTypes[typeName];
  const tone=type.tones[Math.floor(Math.random()*type.tones.length)];
  game.answer=notes[(root+tone[0])%12];
  $("chord").textContent=notes[root]+type.name+(type.slash?"/"+notes[(root+type.bass)%12]:"");
  $("degree").textContent=tone[1];
  $("number").textContent=`QUESTION ${String(game.count).padStart(2,"0")}`;
  $("feedback").innerHTML="&nbsp;"; $("feedback").className="feedback";
  $("questionCard").className="card question";
  $("answers").innerHTML=answerChoices.map(choice=>`<button class="answer" data-note="${choice.note}">${choice.label}</button>`).join("");
  document.querySelectorAll(".answer").forEach(btn=>btn.addEventListener("click",()=>answer(btn)));
}
function answer(button){
  if(game.locked||game.left<=0) return;
  game.locked=true;
  const correct=button.dataset.note===game.answer;
  document.querySelectorAll(".answer").forEach(btn=>{
    btn.disabled=true;
    if(btn.dataset.note===game.answer) btn.classList.add("good");
  });
  if(correct){
    game.correct++; game.streak++; game.best=Math.max(game.best,game.streak);
    const points=game.streak>=5?15:10; game.score+=points;
    $("feedback").textContent=game.streak>=5?"正解！連続正解ボーナス +15":"正解！ +10";
    $("questionCard").classList.add("correct"); beep(660,.08);
  }else{
    game.wrong++; game.streak=0; button.classList.add("bad");
    $("feedback").textContent=`正解は ${game.answer}`; $("feedback").classList.add("bad");
    $("questionCard").classList.add("wrong"); beep(180,.13);
  }
  $("score").textContent=game.score; $("streak").textContent=game.streak;
  setTimeout(nextQuestion,750);
}
function finish(){
  game.locked=true;
  const total=game.correct+game.wrong;
  const accuracy=total?Math.round(game.correct/total*100):0;
  $("finalScore").textContent=game.score;
  $("correct").textContent=game.correct;
  $("accuracy").textContent=`${accuracy}%`;
  $("best").textContent=game.best;
  $("message").textContent=accuracy>=85
    ?"すばらしい！構成音がかなり身についています。次は「すべて混合」で挑戦してみよう。"
    :accuracy>=60
      ?"いい調子！苦手なコードのモードを選んで、もう一度スプリントしよう。"
      :"まずはメジャー＆マイナーを繰り返そう。声に出して答えると、指板でも見つけやすくなります。";
  show("result");
}
function beep(freq,duration){
  if(!sound) return;
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.frequency.value=freq; gain.gain.setValueAtTime(.055,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+duration);
  }catch(e){}
}
