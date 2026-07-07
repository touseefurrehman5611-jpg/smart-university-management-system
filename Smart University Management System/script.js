const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const courseSearch = document.getElementById('courseSearch');
const gpaForm = document.getElementById('gpaForm');
const feedbackForm = document.getElementById('feedbackForm');
const gpaResult = document.getElementById('gpaResult');
const feedbackStatus = document.getElementById('feedbackStatus');
const tableRows = document.querySelectorAll('.data-table tbody tr');
const loginForms = document.querySelectorAll('.role-login-form');
const userPanel = document.getElementById('userPanel');
const dashboardSection = document.getElementById('dashboard');
const currentRoleBadge = document.getElementById('currentRoleBadge');
const userGreeting = document.getElementById('userGreeting');
const userRoleDescription = document.getElementById('userRoleDescription');
const dashboardRoleName = document.getElementById('dashboardRoleName');
const dashboardAccessLevel = document.getElementById('dashboardAccessLevel');
const logoutBtn = document.getElementById('logoutBtn');
const tabs = document.querySelectorAll('.tab-btn');
const authPanels = document.querySelectorAll('.tab-panel');
const signupForm = document.getElementById('signupForm');
const signupName = document.getElementById('signupName');
const signupRole = document.getElementById('signupRole');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupMessage = document.getElementById('signupMessage');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const resetPanel = document.getElementById('resetPanel');
const resetForm = document.getElementById('resetForm');
const resetEmail = document.getElementById('resetEmail');
const resetRole = document.getElementById('resetRole');
const resetMessage = document.getElementById('resetMessage');
const studentProfileForm = document.getElementById('studentProfileForm');
const studentQuizForm = document.getElementById('studentQuizForm');
const quizTopicInput = document.getElementById('quizTopicInput');
const quizScoreInput = document.getElementById('quizScoreInput');
const downloadPdfButton = document.getElementById('downloadPdfButton');
const downloadTranscriptBtn = document.getElementById('downloadTranscriptBtn');
const downloadIdCardBtn = document.getElementById('downloadIdCardBtn');

const appData = {
  roles: {
    student: {
      label: 'Student',
      description: 'Access your courses, assignments, attendance, marks, notices, and chat.',
      access: 'Courses, Attendance, Assignments, Results, Chat',
      dashboardText: 'Student Dashboard',
    },
    teacher: {
      label: 'Teacher',
      description: 'Manage courses, upload assignments, mark attendance, publish notices, and message students.',
      access: 'Course Management, Attendance, Assignments, Results, Notices, Chat',
      dashboardText: 'Teacher Dashboard',
    },
    admin: {
      label: 'Admin',
      description: 'Oversee all courses, users, analytics, notices, and system administration tasks.',
      access: 'User Management, Course Controls, Analytics, Notices, Chat',
      dashboardText: 'Admin Dashboard',
    },
  },
  credentials: {
    student: { email: 'student@university.edu', password: 'student123' },
    teacher: { email: 'teacher@university.edu', password: 'teacher123' },
    admin: { email: 'admin@university.edu', password: 'admin123' },
  },
};

// --- Persistent app state (users, courses, registrations, attendance, marks) ---
function getState() {
  return JSON.parse(localStorage.getItem('su-state') || '{}');
}

function saveState(state) {
  localStorage.setItem('su-state', JSON.stringify(state));
}

function ensureState() {
  const state = getState();
  if (!state.users) state.users = {};
  if (!state.courses) state.courses = [];
  if (!state.registrations) state.registrations = {};
  if (!state.attendance) state.attendance = [];
  if (!state.marks) state.marks = [];
  saveState(state);
  return state;
}

function seedCoursesFromDOM() {
  const state = ensureState();
  if (state.courses && state.courses.length) return; // already seeded
  const rows = document.querySelectorAll('.data-table tbody tr');
  let id = 1;
  rows.forEach((r) => {
    const cells = r.querySelectorAll('td');
    if (cells.length >= 3) {
      state.courses.push({ id: id++, name: cells[0].textContent.trim(), instructor: cells[1].textContent.trim(), semester: cells[2].textContent.trim(), status: cells[3] ? cells[3].textContent.trim() : 'Open' });
    }
  });
  saveState(state);
}

// current session
function setSession(session) {
  localStorage.setItem('su-session', JSON.stringify(session || {}));
}

function getSession() {
  return JSON.parse(localStorage.getItem('su-session') || 'null');
}


function applyTheme(theme) {
  if (theme === 'dark') {
    body.classList.add('dark');
    themeToggle.textContent = 'Light Mode';
  } else {
    body.classList.remove('dark');
    themeToggle.textContent = 'Dark Mode';
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem('su-theme') || 'light';
  applyTheme(savedTheme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('su-theme', nextTheme);
  });
}

function setActiveRole(roleKey) {
  const role = appData.roles[roleKey];
  if (!role) return;

  currentRoleBadge.textContent = role.label;
  userGreeting.textContent = `Welcome back, ${role.label}`;
  userRoleDescription.textContent = role.description;
  dashboardRoleName.textContent = role.label;
  dashboardAccessLevel.textContent = role.access;
  userPanel.classList.remove('hidden');
  dashboardSection.classList.remove('hidden');
  const authSection = document.getElementById('auth');
  if (authSection) {
    authSection.classList.add('hidden');
  }
  const loginTabButton = document.querySelector('.tab-btn[data-target="loginTab"]');
  if (loginTabButton) {
    loginTabButton.click();
  }

  document.querySelectorAll('.role-panel').forEach((panel) => panel.classList.add('hidden'));
  if (roleKey === 'student') {
    document.getElementById('studentPortal').classList.remove('hidden');
  }
  if (roleKey === 'teacher') {
    document.getElementById('teacherPortal').classList.remove('hidden');
  }
  if (roleKey === 'admin') {
    document.getElementById('adminPortal').classList.remove('hidden');
  }

  window.location.hash = '#userPanel';
}

function validateLogin(roleKey, email, password) {
  const stored = JSON.parse(localStorage.getItem('su-users') || '{}');
  const credentials = stored[roleKey] || appData.credentials[roleKey];
  return credentials.email === email && credentials.password === password;
}

function handleRoleLogin(form) {
  const roleKey = form.dataset.role;
  const emailField = form.querySelector('input[type="email"]');
  const passwordField = form.querySelector('input[type="password"]');
  const email = emailField?.value.trim() || '';
  const password = passwordField?.value.trim() || '';

  if (!email || !password) {
    alert('Please enter your email and password.');
    return;
  }

  if (validateLogin(roleKey, email, password)) {
    setSession({ role: roleKey, email });
    setActiveRole(roleKey);
    form.reset();
  } else {
    alert('Login failed. Please check your email and password.');
  }
}

function saveUserAccount(roleKey, name, email, password) {
  const stored = JSON.parse(localStorage.getItem('su-users') || '{}');
  stored[roleKey] = { name, email, password };
  localStorage.setItem('su-users', JSON.stringify(stored));
}

function ensureDefaultAccounts() {
  const stored = JSON.parse(localStorage.getItem('su-users') || '{}');
  Object.keys(appData.credentials).forEach((role) => {
    if (!stored[role]) {
      stored[role] = appData.credentials[role];
    }
  });
  localStorage.setItem('su-users', JSON.stringify(stored));
}

tabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabs.forEach((button) => button.classList.remove('active'));
    authPanels.forEach((panel) => panel.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.remove('hidden');
  });
});

loginForms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleRoleLogin(form);
  });

  form.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleRoleLogin(form);
    }
  });
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = signupName.value.trim();
  const roleKey = signupRole.value;
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();

  if (!name || !email || !password) {
    signupMessage.textContent = 'Please complete all signup fields.';
    return;
  }

  saveUserAccount(roleKey, name, email, password);
  // also add to users state for backup and role-based lookup
  const state = ensureState();
  state.users[email] = { name, role: roleKey, email };
  saveState(state);
  signupMessage.textContent = 'Account created. Use the Login tab to sign in.';
  signupName.value = '';
  signupEmail.value = '';
  signupPassword.value = '';
  tabs[0].click();
});

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener('click', (event) => {
    event.preventDefault();
    tabs.forEach((button) => button.classList.remove('active'));
    authPanels.forEach((panel) => panel.classList.add('hidden'));
    document.querySelector('[data-target="resetPanel"]').classList.add('active');
    resetPanel.classList.remove('hidden');
  });
}

resetForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const roleKey = resetRole.value;
  const email = resetEmail.value.trim();
  const stored = JSON.parse(localStorage.getItem('su-users') || '{}');
  const account = stored[roleKey] || appData.credentials[roleKey];

  if (account.email === email) {
    resetMessage.textContent = `Password hint: ${account.password.slice(0, 2)}***`; 
  } else {
    resetMessage.textContent = 'No account found for that email and role.';
  }
});

logoutBtn.addEventListener('click', () => {
  userPanel.classList.add('hidden');
  dashboardSection.classList.add('hidden');
  document.getElementById('auth').classList.remove('hidden');
  window.location.hash = '#auth';
});

ensureDefaultAccounts();

if (courseSearch && tableRows.length) {
  courseSearch.addEventListener('input', (event) => {
    const filter = event.target.value.toLowerCase();
    tableRows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(filter) ? '' : 'none';
    });
  });
}

if (gpaForm) {
  gpaForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = [
      Number(document.getElementById('gpaProgramming').value || 0),
      Number(document.getElementById('gpaMath').value || 0),
      Number(document.getElementById('gpaEnglish').value || 0),
    ];
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const gpa = (average / 100) * 4;
    gpaResult.textContent = `Estimated GPA: ${gpa.toFixed(2)} (${average.toFixed(0)}% average)`;
  });
}

if (feedbackForm) {
  feedbackForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const subject = document.getElementById('feedbackSubject').value.trim();
    const message = document.getElementById('feedbackMessageText').value.trim();
    if (!subject || !message) {
      feedbackStatus.textContent = 'Please add both a subject and a message.';
      feedbackStatus.style.color = 'var(--secondary)';
      return;
    }
    feedbackStatus.textContent = `Feedback received for “${subject}”. Thank you!`;
    feedbackStatus.style.color = 'var(--success)';
    feedbackForm.reset();
  });
}

const mobileNavToggle = document.getElementById('mobileNavToggle');
const mainNav = document.querySelector('.main-nav');
const addCourseButton = document.getElementById('addCourseButton');
const newCourseName = document.getElementById('newCourseName');
const newCourseInstructor = document.getElementById('newCourseInstructor');
const newCourseSemester = document.getElementById('newCourseSemester');
const newCourseStatus = document.getElementById('newCourseStatus');
const courseTableBody = document.querySelector('.data-table tbody');
const teacherUpload = document.getElementById('teacherUpload');
const uploadAssignmentBtn = document.getElementById('uploadAssignmentBtn');
const uploadStatus = document.getElementById('uploadStatus');
const studentSubmit = document.getElementById('studentSubmit');
const submitAssignmentBtn = document.getElementById('submitAssignmentBtn');
const submitStatus = document.getElementById('submitStatus');
const chatInput = document.querySelector('#chat .chat-input input');
const chatSendBtn = document.querySelector('#chat .chat-input button');
const chatWindow = document.querySelector('#chat .chat-window');
const attendanceTable = document.getElementById('attendanceTable');
const updateMarksBtn = document.getElementById('updateMarksBtn');
const marksTable = document.getElementById('marksTable');
const teacherCourseForm = document.getElementById('teacherCourseForm');
const teacherCourseName = document.getElementById('teacherCourseName');
const teacherCourseSection = document.getElementById('teacherCourseSection');
const teacherCourseList = document.getElementById('teacherCourseList');
const teacherQuizForm = document.getElementById('teacherQuizForm');
const quizTitleInput = document.getElementById('quizTitleInput');
const quizDateInput = document.getElementById('quizDateInput');
const teacherQuizList = document.getElementById('teacherQuizList');
const studyMaterialForm = document.getElementById('studyMaterialForm');
const studyMaterialTitle = document.getElementById('studyMaterialTitle');
const studyMaterialList = document.getElementById('studyMaterialList');
const announcementForm = document.getElementById('announcementForm');
const announcementText = document.getElementById('announcementText');
const announcementList = document.getElementById('announcementList');
const classScheduleForm = document.getElementById('classScheduleForm');
const classScheduleTitle = document.getElementById('classScheduleTitle');
const classScheduleTime = document.getElementById('classScheduleTime');
const classScheduleList = document.getElementById('classScheduleList');
const adminStudentForm = document.getElementById('adminStudentForm');
const adminStudentName = document.getElementById('adminStudentName');
const adminStudentEmail = document.getElementById('adminStudentEmail');
const adminStudentList = document.getElementById('adminStudentList');
const adminTeacherForm = document.getElementById('adminTeacherForm');
const adminTeacherName = document.getElementById('adminTeacherName');
const adminTeacherEmail = document.getElementById('adminTeacherEmail');
const adminTeacherList = document.getElementById('adminTeacherList');
const adminDepartmentForm = document.getElementById('adminDepartmentForm');
const adminDepartmentName = document.getElementById('adminDepartmentName');
const adminDepartmentList = document.getElementById('adminDepartmentList');
const adminSemesterForm = document.getElementById('adminSemesterForm');
const adminSemesterName = document.getElementById('adminSemesterName');
const adminSemesterList = document.getElementById('adminSemesterList');
const adminFinanceForm = document.getElementById('adminFinanceForm');
const adminFinanceTitle = document.getElementById('adminFinanceTitle');
const adminFinanceAmount = document.getElementById('adminFinanceAmount');
const adminFinanceList = document.getElementById('adminFinanceList');
const exportBackupBtn = document.getElementById('exportBackupBtn');
const importBackupFile = document.getElementById('importBackupFile');
const backupMessage = document.getElementById('backupMessage');

if (mobileNavToggle && mainNav) {
  mobileNavToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    mobileNavToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.main-nav a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      mobileNavToggle.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) {
      mainNav.classList.remove('open');
      mobileNavToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

if (addCourseButton) {
  addCourseButton.addEventListener('click', () => {
  const name = newCourseName.value.trim();
  const instructor = newCourseInstructor.value.trim();
  const semester = newCourseSemester.value.trim();
  const status = newCourseStatus.value;

  if (!name || !instructor || !semester) {
    alert('Please fill in course name, instructor, and semester.');
    return;
  }

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${name}</td>
    <td>${instructor}</td>
    <td>${semester}</td>
    <td>${status}</td>
    <td><button class="btn btn-secondary course-action-btn">Register</button></td>
  `;
  courseTableBody.appendChild(row);

    newCourseName.value = '';
    newCourseInstructor.value = '';
    newCourseSemester.value = '';
    newCourseStatus.value = 'Open';
  });
}

if (courseTableBody) {
  courseTableBody.addEventListener('click', (event) => {
    const button = event.target.closest('.course-action-btn');
    if (!button) return;
    const row = button.closest('tr');
    const courseName = row?.children[0]?.textContent?.trim();
    if (!courseName) return;
    const state = ensureState();
    state.registrations = state.registrations || {};
    state.registrations.student = state.registrations.student || [];
    if (!state.registrations.student.includes(courseName)) {
      state.registrations.student.push(courseName);
      saveState(state);
      populatePortalData();
    }
    button.textContent = 'Registered';
    button.disabled = true;
  });
}

uploadAssignmentBtn.addEventListener('click', () => {
  if (!teacherUpload.files.length) {
    uploadStatus.textContent = 'Please select a file to upload.';
    uploadStatus.style.color = 'var(--secondary)';
    return;
  }
  uploadStatus.textContent = `Uploaded: ${teacherUpload.files[0].name}`;
  uploadStatus.style.color = 'var(--success)';
});

submitAssignmentBtn.addEventListener('click', () => {
  if (!studentSubmit.files.length) {
    submitStatus.textContent = 'Please select your assignment file.';
    submitStatus.style.color = 'var(--secondary)';
    return;
  }
  submitStatus.textContent = `Submitted: ${studentSubmit.files[0].name}`;
  submitStatus.style.color = 'var(--success)';
});

if (chatSendBtn && chatInput && chatWindow) {
  chatSendBtn.addEventListener('click', () => {
    const messageText = chatInput.value.trim();
    if (!messageText) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'message sent';
    messageElement.innerHTML = `<p><strong>You:</strong> ${messageText}</p>`;
    chatWindow.appendChild(messageElement);
    chatInput.value = '';
    chatWindow.scrollTop = chatWindow.scrollHeight;
  });
}

const adminPortal = document.getElementById('adminPortal');
const adminActions = document.querySelectorAll('[data-admin-action]');

adminActions.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.adminAction;

    if (action === 'showStudent') {
      document.getElementById('studentPortal').classList.remove('hidden');
      document.getElementById('teacherPortal').classList.add('hidden');
    }

    if (action === 'showTeacher') {
      document.getElementById('studentPortal').classList.add('hidden');
      document.getElementById('teacherPortal').classList.remove('hidden');
    }
  });
});

if (attendanceTable) {
  attendanceTable.addEventListener('click', (event) => {
    if (!event.target.matches('.toggle-attendance')) return;
    const row = event.target.closest('tr');
    const statusCell = row.querySelector('.attendance-status');
    if (!statusCell) return;
    const current = statusCell.textContent.trim();
    const next = current === 'Present' ? 'Absent' : 'Present';
    statusCell.textContent = next;
    statusCell.style.color = next === 'Present' ? 'var(--success)' : 'var(--secondary)';
  });
}

function gradeLabel(value) {
  const score = Number(value);
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

function updateGradeOutputs() {
  if (!marksTable) return;
  marksTable.querySelectorAll('tbody tr').forEach((row) => {
    const input = row.querySelector('.grade-input');
    const output = row.querySelector('.grade-output');
    if (input && output) {
      output.textContent = gradeLabel(input.value);
    }
  });
}

function renderList(container, items, emptyText) {
  if (!container) return;
  if (!items.length) {
    container.innerHTML = `<p class="small-text">${emptyText}</p>`;
    return;
  }
  container.innerHTML = items.map((item) => `<div class="info-pill">${item}</div>`).join('');
}

function populatePortalData() {
  const state = ensureState();
  const studentProfile = state.studentProfile || {
    name: 'Ayesha Khan',
    id: 'STU-1024',
    major: 'Computer Science',
    phone: '+92 300 1234567',
    address: 'Islamabad',
  };
  document.getElementById('studentNameInput').value = studentProfile.name;
  document.getElementById('studentIdInput').value = studentProfile.id;
  document.getElementById('studentMajorInput').value = studentProfile.major;
  document.getElementById('studentPhoneInput').value = studentProfile.phone;
  document.getElementById('studentAddressInput').value = studentProfile.address;

  const profileSummary = [
    `Name: ${studentProfile.name}`,
    `Student ID: ${studentProfile.id}`,
    `Program: ${studentProfile.major}`,
    `Phone: ${studentProfile.phone}`,
    `Address: ${studentProfile.address}`,
  ];
  renderList(document.getElementById('studentProfileSummary'), profileSummary, 'No profile saved yet.');

  const courses = state.registrations?.student || ['Web Design & UX', 'Data Science Basics'];
  renderList(document.getElementById('registeredCoursesList'), courses, 'No registered courses yet.');

  const timetable = ['Mon: Web Design & UX', 'Tue: Data Science Basics', 'Wed: Cloud Computing'];
  renderList(document.getElementById('studentTimetable'), timetable, 'No timetable available.');

  const attendance = ['Present - Web Design & UX', 'Absent - Data Science Basics', 'Present - Cloud Computing'];
  renderList(document.getElementById('attendanceRecordList'), attendance, 'No attendance records.');

  const quizzes = state.quizzes || ['AI Quiz: 89%', 'Logic Quiz: 92%'];
  renderList(document.getElementById('studentQuizResults'), quizzes, 'No quiz records.');

  const fees = ['Fee Status: Paid', 'Scholarship: 25% pending'];
  renderList(document.getElementById('studentFeeStatus'), fees, 'Fee record not available.');

  const calendar = ['Jul 10: Midterm exams', 'Jul 25: Project submission'];
  renderList(document.getElementById('academicCalendarList'), calendar, 'No calendar entries.');

  const teacherCourses = state.teacherCourses || ['Web Design & UX - Section A', 'Data Science Basics - Section B'];
  renderList(teacherCourseList, teacherCourses, 'No courses added yet.');

  const teacherQuizzes = state.teacherQuizzes || ['Midterm Quiz - Jul 14'];
  renderList(teacherQuizList, teacherQuizzes, 'No quizzes published yet.');

  const materials = state.studyMaterials || ['Lecture Notes: UI Basics'];
  renderList(studyMaterialList, materials, 'No study materials uploaded yet.');

  const announcements = state.announcements || ['Class reminder: Bring laptops'];
  renderList(announcementList, announcements, 'No announcements yet.');

  const sections = state.classSchedules || ['Web Design & UX - 10:00 AM'];
  renderList(classScheduleList, sections, 'No schedule saved yet.');

  const students = state.adminStudents || ['Aisha Khan - aisha@uni.edu'];
  renderList(adminStudentList, students, 'No students added yet.');

  const teachers = state.adminTeachers || ['Dr. Sana Ali - sana@uni.edu'];
  renderList(adminTeacherList, teachers, 'No teachers added yet.');

  const departments = state.departments || ['Computer Science'];
  renderList(adminDepartmentList, departments, 'No departments added yet.');

  const semesters = state.semesters || ['Fall 2026'];
  renderList(adminSemesterList, semesters, 'No semesters added yet.');

  const finance = state.finance || ['Tuition Fee - 120000'];
  renderList(adminFinanceList, finance, 'No finance records yet.');

  document.getElementById('studentAttendancePercent').textContent = '94.7%';
  document.getElementById('studentSubmissionCount').textContent = '6 / 7';
  document.getElementById('studentCgpa').textContent = '3.78';
  document.getElementById('teacherReport').innerHTML = '<div class="info-pill">Average Attendance: 92%</div><div class="info-pill">Top Performer: Aisha Khan</div>';
}

function savePortalData() {
  const state = ensureState();
  state.studentProfile = {
    name: document.getElementById('studentNameInput').value.trim(),
    id: document.getElementById('studentIdInput').value.trim(),
    major: document.getElementById('studentMajorInput').value.trim(),
    phone: document.getElementById('studentPhoneInput').value.trim(),
    address: document.getElementById('studentAddressInput').value.trim(),
  };
  saveState(state);
}

if (updateMarksBtn) {
  updateMarksBtn.addEventListener('click', () => {
    updateGradeOutputs();
    alert('Marks updated successfully.');
  });
}

if (teacherCourseForm) {
  teacherCourseForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = ensureState();
    state.teacherCourses = state.teacherCourses || [];
    state.teacherCourses.push(`${teacherCourseName.value.trim()} - ${teacherCourseSection.value.trim()}`);
    saveState(state);
    populatePortalData();
    teacherCourseForm.reset();
  });
}

if (teacherQuizForm) {
  teacherQuizForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = ensureState();
    state.teacherQuizzes = state.teacherQuizzes || [];
    state.teacherQuizzes.push(`${quizTitleInput.value.trim()} - ${quizDateInput.value}`);
    saveState(state);
    populatePortalData();
    teacherQuizForm.reset();
  });
}

if (studyMaterialForm) {
  studyMaterialForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = ensureState();
    state.studyMaterials = state.studyMaterials || [];
    state.studyMaterials.push(studyMaterialTitle.value.trim());
    saveState(state);
    populatePortalData();
    studyMaterialForm.reset();
  });
}

if (announcementForm) {
  announcementForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = ensureState();
    state.announcements = state.announcements || [];
    state.announcements.push(announcementText.value.trim());
    saveState(state);
    populatePortalData();
    announcementForm.reset();
  });
}

if (classScheduleForm) {
  classScheduleForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = ensureState();
    state.classSchedules = state.classSchedules || [];
    state.classSchedules.push(`${classScheduleTitle.value.trim()} - ${classScheduleTime.value.trim()}`);
    saveState(state);
    populatePortalData();
    classScheduleForm.reset();
  });
}

if (adminStudentForm) {
  adminStudentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = ensureState();
    state.adminStudents = state.adminStudents || [];
    state.adminStudents.push(`${adminStudentName.value.trim()} - ${adminStudentEmail.value.trim()}`);
    saveState(state);
    populatePortalData();
    adminStudentForm.reset();
  });
}

if (adminTeacherForm) {
  adminTeacherForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = ensureState();
    state.adminTeachers = state.adminTeachers || [];
    state.adminTeachers.push(`${adminTeacherName.value.trim()} - ${adminTeacherEmail.value.trim()}`);
    saveState(state);
    populatePortalData();
    adminTeacherForm.reset();
  });
}

if (adminDepartmentForm) {
  adminDepartmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = ensureState();
    state.departments = state.departments || [];
    state.departments.push(adminDepartmentName.value.trim());
    saveState(state);
    populatePortalData();
    adminDepartmentForm.reset();
  });
}

if (adminSemesterForm) {
  adminSemesterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = ensureState();
    state.semesters = state.semesters || [];
    state.semesters.push(adminSemesterName.value.trim());
    saveState(state);
    populatePortalData();
    adminSemesterForm.reset();
  });
}

if (adminFinanceForm) {
  adminFinanceForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = ensureState();
    state.finance = state.finance || [];
    state.finance.push(`${adminFinanceTitle.value.trim()} - ${adminFinanceAmount.value.trim()}`);
    saveState(state);
    populatePortalData();
    adminFinanceForm.reset();
  });
}

if (studentProfileForm) {
  studentProfileForm.addEventListener('submit', (event) => {
    event.preventDefault();
    savePortalData();
    populatePortalData();
    alert('Profile updated successfully.');
  });
}

if (studentQuizForm) {
  studentQuizForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = ensureState();
    state.quizzes = state.quizzes || [];
    state.quizzes.push(`${quizTopicInput.value.trim()}: ${quizScoreInput.value.trim()}%`);
    saveState(state);
    populatePortalData();
    studentQuizForm.reset();
  });
}

if (exportBackupBtn) {
  exportBackupBtn.addEventListener('click', () => {
    const state = ensureState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'smart-university-backup.json';
    link.click();
    URL.revokeObjectURL(link.href);
    backupMessage.textContent = 'Backup exported successfully.';
  });
}

if (importBackupFile) {
  importBackupFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        saveState(imported);
        populatePortalData();
        backupMessage.textContent = 'Backup imported successfully.';
      } catch (error) {
        backupMessage.textContent = 'Invalid backup file.';
      }
    };
    reader.readAsText(file);
  });
}

updateGradeOutputs();
populatePortalData();

if (downloadPdfButton) {
  downloadPdfButton.addEventListener('click', () => {
    const pdfContent = '%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 123 >>\nstream\nBT /F1 24 Tf 72 700 Td (Smart University) Tj ET BT /F1 16 Tf 72 660 Td (Result Card) Tj ET BT /F1 12 Tf 72 620 Td (Student: Alex Ahmed) Tj ET BT /F1 12 Tf 72 590 Td (Course: Web Design & UX) Tj ET BT /F1 12 Tf 72 560 Td (Marks: 88%) Tj ET BT /F1 12 Tf 72 530 Td (GPA: 3.78) Tj ET BT /F1 12 Tf 72 500 Td (Status: Passed) Tj ET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000064 00000 n \n0000000119 00000 n \n0000000270 00000 n \n0000000443 00000 n \ntrailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n520\n%%EOF';
    const bytes = new Uint8Array(pdfContent.length);
    for (let i = 0; i < pdfContent.length; i++) {
      bytes[i] = pdfContent.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Smart-University-Result-Card.pdf';
    link.click();
    URL.revokeObjectURL(link.href);
  });
}

loadTheme();
