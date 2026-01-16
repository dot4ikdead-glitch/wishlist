import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase конфиг
const firebaseConfig = {
  apiKey: "AIzaSyDMIHaQLB4I975YQLBIcLFrn3zzeu5_UXU",
  authDomain: "wishlist-f18e4.firebaseapp.com",
  databaseURL: "https://wishlist-f18e4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wishlist-f18e4",
  storageBucket: "wishlist-f18e4.firebasestorage.app",
  messagingSenderId: "1080567870967",
  appId: "1:1080567870967:web:6d583c2ae7b6b34c702af2",
  measurementId: "G-WZQFQE6C0Z"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const wishesRef = ref(db, 'wishes');
const colorsRef = ref(db, 'colors');

const wishlistEl = document.getElementById('wishlist');
const counterEl = document.getElementById('counter');
const bgInput = document.getElementById('bgColor');
const cardInput = document.getElementById('cardColor');
const textInput = document.getElementById('textColor');
const bgImageInput = document.getElementById('bgImageInput');
const bgFileInput = document.getElementById('bgFile');
const addBtn = document.getElementById('addBtn');
const applyBgBtn = document.getElementById('applyBgBtn');

let wishes = [];
let colors = { bg:'#f0f0f0', card:'#fff', text:'#000', bgImage:'' };

// Функция обновления счетчика
function updateCounter() {
  const done = wishes.filter(w => w.done).length;
  const total = wishes.length;
  counterEl.textContent = `Выполнено: ${done} / ${total}`;
}

// Рендер списка с чекбоксами
function render() {
  wishlistEl.innerHTML = '';
  wishes.forEach((itemObj, index)=>{
    const item = document.createElement('div');
    item.className='item';
    item.innerHTML = `
      <label style="flex:1; display:flex; align-items:center; gap:10px;">
        <input type="checkbox" ${itemObj.done ? 'checked' : ''}>
        <span style="text-decoration:${itemObj.done ? 'line-through' : 'none'}">${itemObj.text}</span>
      </label>
      <button class="delete">Удалить</button>
    `;
    const checkbox = item.querySelector('input[type="checkbox"]');
    const span = item.querySelector('span');
    checkbox.addEventListener('change', ()=>{
      wishes[index].done = checkbox.checked;
      span.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
      set(wishesRef, wishes);
      updateCounter();
    });
    const btn = item.querySelector('button');
    btn.addEventListener('click', ()=>{
      wishes.splice(index,1);
      set(wishesRef, wishes);
      updateCounter();
    });
    wishlistEl.appendChild(item);
  });
  updateCounter();
}

// Установка цветов и фона
function setColors(bg, card, text, bgImage='') {
  document.documentElement.style.setProperty('--bg-color', bg);
  document.documentElement.style.setProperty('--card-color', card);
  document.documentElement.style.setProperty('--text-color', text);
  colors={ bg, card, text, bgImage };
  if(bgImage) document.body.style.background=`url('${bgImage}') center/cover no-repeat fixed`;
  else document.body.style.background=bg;
  set(colorsRef, colors);
}

// Добавление желания
function addWish() {
  const input=document.getElementById('wishInput');
  const text=input.value.trim();
  if(!text) return;
  wishes.push({ text, done:false });
  set(wishesRef, wishes);
  input.value='';
}

// Применение фона по URL
function applyBgImage() {
  const url = bgImageInput.value.trim();
  setColors(bgInput.value, cardInput.value, textInput.value, url);
}

// Слушатели цветов
bgInput.addEventListener('input',()=>setColors(bgInput.value, cardInput.value, textInput.value, colors.bgImage));
cardInput.addEventListener('input',()=>setColors(bgInput.value, cardInput.value, textInput.value, colors.bgImage));
textInput.addEventListener('input',()=>setColors(bgInput.value, cardInput.value, textInput.value, colors.bgImage));

addBtn.addEventListener('click', addWish);
applyBgBtn.addEventListener('click', applyBgImage);

bgFileInput.addEventListener('change', (e)=>{
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(ev){
    setColors(bgInput.value, cardInput.value, textInput.value, ev.target.result);
  }
  reader.readAsDataURL(file);
});

// Firebase слушатели
onValue(wishesRef, snapshot=>{
  wishes = snapshot.val() || [];
  render();
});

onValue(colorsRef, snapshot=>{
  const val = snapshot.val();
  if(val){
    setColors(val.bg,val.card,val.text,val.bgImage);
    bgInput.value = val.bg;
    cardInput.value = val.card;
    textInput.value = val.text;
    bgImageInput.value = val.bgImage||'';
  }
});
