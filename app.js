const DB = {
  users: "bshs_users",
  session: "bshs_student_session",
  reports: "bshs_reports",
  claims: "bshs_claims",
  device: "bshs_device_id"
};


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL = "https://cuhdvpqgbjzkmrinbyjh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_NI2lEYRyMo6u8tZMF3RHNA_so3UxL30";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);




/* =========================================================
   LOCAL STORAGE HELPERS
========================================================= */

function getJSON(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch (e) {
    return fallback;
  }
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}


/* =========================================================
   DEVICE ID
========================================================= */

function getDeviceId() {
  let id = localStorage.getItem(DB.device);

  if (!id) {
    id =
      "device-" +
      Date.now() +
      "-" +
      Math.random().toString(36).slice(2);

    localStorage.setItem(DB.device, id);
  }

  return id;
}


/* =========================================================
   STUDENT SESSION
========================================================= */

function currentUser() {
  return localStorage.getItem(DB.session) || "";
}

function isLoggedIn() {
  return !!currentUser();
}

function logout() {
  localStorage.removeItem(DB.session);
  window.location.href = "index.html";
}


/* =========================================================
   HELPERS
========================================================= */

function esc(v) {
  return String(v ?? "").replace(
    /[&<>"']/g,
    m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m])
  );
}

function uid(prefix) {
  return (
    prefix +
    "-" +
    Date.now() +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}


/* =========================================================
   STUDENT NAVIGATION
========================================================= */

function renderStudentNav() {
  const nav = document.getElementById("studentNav");

  if (!nav) return;

  nav.innerHTML = `
    <a href="index.html">Home</a>
    <a href="items.html">Items</a>
    <a href="my-reports.html">My Reports</a>
    <a href="claim-requests.html">My Claim Requests</a>

    ${
      isLoggedIn()
        ? `<a href="#" onclick="logout(); return false;">Logout</a>`
        : `<a href="students-login.html">Login</a>`
    }
  `;
}


/* =========================================================
   STATUS
========================================================= */

function statusClass(status) {
  return String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}


/* =========================================================
   REPORT OWNER
========================================================= */

function reportOwner() {
  const user = currentUser();

  if (user) {
    return {
      type: "account",
      id: user
    };
  }

  return {
    type: "device",
    id: getDeviceId()
  };
}


/* =========================================================
   SUPABASE REPORT INSERT
========================================================= */

async function saveReport(report) {

  /*
    student_id is UUID in your Supabase table.

    Your current student login system uses localStorage,
    so we only send student_id if the stored value is
    actually a valid UUID.

    If the student is not logged in, student_id remains null.
  */

  let studentId = null;

  const loggedUser = currentUser();

  if (loggedUser) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (uuidRegex.test(loggedUser)) {
      studentId = loggedUser;
    }
  }


  const reportData = {
    report_type: report.type,
    item_name: report.item,
    category: report.category,
    location: report.location,
    item_date: report.date,
    description: report.description,
    photo_url: report.photo || null,
    status: "Pending"
  };


  if (studentId) {
    reportData.student_id = studentId;
  }


  const { data, error } = await supabaseClient
    .from("reports")
    .insert(reportData)
    .select()
    .single();


  if (error) {
    console.error("SUPABASE REPORT ERROR:", error);
    throw error;
  }


  console.log("Report saved successfully:", data);

  return data;
}


/* =========================================================
   LOGIN REQUIREMENT
========================================================= */

function requireStudentLogin(next) {

  if (!isLoggedIn()) {

    localStorage.setItem(
      "bshs_after_login",
      next || "items.html"
    );

    window.location.href = "students-login.html";

    return false;
  }

  return true;
}
