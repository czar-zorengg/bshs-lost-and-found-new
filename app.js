const DB={
  users:"bshs_users",
  session:"bshs_student_session",
  reports:"bshs_reports",
  claims:"bshs_claims",
  device:"bshs_device_id"
};

function getJSON(key,fallback=[]){try{return JSON.parse(localStorage.getItem(key))??fallback}catch(e){return fallback}}
function setJSON(key,value){localStorage.setItem(key,JSON.stringify(value))}
function getDeviceId(){
  let id=localStorage.getItem(DB.device);
  if(!id){id="device-"+Date.now()+"-"+Math.random().toString(36).slice(2);localStorage.setItem(DB.device,id)}
  return id;
}
function currentUser(){return localStorage.getItem(DB.session)||""}
function isLoggedIn(){return !!currentUser()}
function logout(){localStorage.removeItem(DB.session);window.location.href="index.html"}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function uid(prefix){return prefix+"-"+Date.now()+"-"+Math.random().toString(36).slice(2,8)}

function renderStudentNav(){
  const nav=document.getElementById("studentNav"); if(!nav)return;
  nav.innerHTML=`
    <a href="index.html">Home</a>
    <a href="items.html">Items</a>
    <a href="my-reports.html">My Reports</a>
    <a href="claim-requests.html">My Claim Requests</a>
    ${isLoggedIn()?`<a href="#" onclick="logout();return false;">Logout</a>`:`<a href="students-login.html">Login</a>`}
  `;
}

function statusClass(s){
  return String(s||"").toLowerCase().replace(/\s+/g,"-");
}

function saveReport(report){
  const reports=getJSON(DB.reports);
  reports.push(report); setJSON(DB.reports,reports);
}

function reportOwner(){
  return currentUser()?{type:"account",id:currentUser()}:{type:"device",id:getDeviceId()};
}

function requireStudentLogin(next){
  if(!isLoggedIn()){
    localStorage.setItem("bshs_after_login",next||"items.html");
    window.location.href="students-login.html";
    return false;
  }
  return true;
}
