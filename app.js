// Импорт Firebase модулей
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Конфигурация Firebase
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

// Ссылки на базу данных
const wishesRef = ref(db, 'wishes');
const colorsRef = ref(db, 'colors');

// DOM элементы
const wishlistEl = document.getElementById('wishlist');
const bgInput = document.getElementById('bgColor');
const cardInput = document.getElementById('cardColor');
const textInput = document.getElementById('textColor');
const bgImageInput = document.getElementById('bgImageInput');
const bgFileInput = document.getElementById('bgFile');
const addBtn = document.getElementById('addBtn');
const applyBgBtn = document.getElementById('applyBgBtn');

let wishes = [];
let colors = { bg:'#f0f0f0', card:'#fff', text:'#000', bgImage:'' };

// Рендер списка
function render() {
  wishlistEl.innerHTML = '';
  wishes.forEach((text,index)=>{
    const item = document.createElement('div');
    item.className='item';
    item.innerHTML = `<div>${text}</div><button class="delete">Удалить</button>`;
    const btn = item.querySelector('button');
    btn.addEventListener('click',()=>removeWish(index));
    wishlistEl.appendChild(item);
  });
}

// Установка цветов и фона
function setColors(bg, card, text, bgImage='') {
  document.documentElement.style.setProperty('--bg-color', bg);
  document.documentElement.style.setProperty('--card-color', card);
  document.documentElement.style.setProperty('--text-color', text);
  colors={ bg, card, text, bgImage };
  if(bgImage) document.body.style.background=`url('${bgImage}') center/cover no-repeat fixed`;
  else document.body.style.background=bg;
  set(colorsRef, colors); // синхронизация
}

// Добавление желания
function addWish() {
  const input=document.getElementById('wishInput');
  const text=input.value.trim();
  if(!text) return;
  wishes.push(text);
  set(wishesRef, wishes);
  input.value='';
}

// Удаление желания
function removeWish(index){
  wishes.splice(index,1);
  set(wishesRef, wishes);
}

// Применение фона по URL
function applyBgImage() {
  const url = bgImageInput.value.trim();
  setColors(bgInput.value, cardInput.value, textInput.value, url);
}

// Слушатели изменения цветов
bgInput.addEventListener('input',()=>setColors(bgInput.value, cardInput.value, textInput.value, colors.bgImage));
cardInput.addEventListener('input',()=>setColors(bgInput.value, cardInput.value, textInput.value, colors.bgImage));
textInput.addEventListener('input',()=>setColors(bgInput.value, cardInput.value, textInput.value, colors.bgImage));

addBtn.addEventListener('click', addWish);
applyBgBtn.addEventListener('click', applyBgImage);

// Слушатель загрузки файла
bgFileInput.addEventListener('change', (e)=>{
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(ev){
    setColors(bgInput.value, cardInput.value, textInput.value, ev.target.result);
  }
  reader.readAsDataURL(file);
});

// Слушатели Firebase (реальное время)
onValue(wishesRef, snapshot=>{
  wishes = snapshot.val()||[];
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
