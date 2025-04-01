let isPageLoaded = false;

document.addEventListener('DOMContentLoaded', () => {
    if (isPageLoaded) return;
    isPageLoaded = true;

    const isLoginPage = window.location.pathname.includes('login.html');
    const isYourCoursesPage = window.location.pathname.includes('your-courses.html');
    const isCandidateDetailsPage = window.location.pathname.includes('candidate-details.html');

    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn && !isLoginPage) {
        window.location.href = 'login.html';
        return;
    }

    updateAuthLink();
    updateProfileLink();

    if (sessionStorage.getItem('justLoggedIn') === 'true') {
        showNotification('Login successful!');
        sessionStorage.removeItem('justLoggedIn');
    }

    if (isYourCoursesPage && isLoggedIn) {
        displayEnrolledCourses();
    }

    if (isCandidateDetailsPage && isLoggedIn) {
        displayCandidateDetails();
    }

    const profile = document.querySelector('.profile');
    const dropdown = document.querySelector('.profile-dropdown');
    let timeoutId;

    if (profile && dropdown) {
        profile.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
            dropdown.style.display = 'block';
        });

        profile.addEventListener('mouseleave', () => {
            timeoutId = setTimeout(() => {
                if (!dropdown.matches(':hover')) {
                    dropdown.style.display = 'none';
                }
            }, 500);
        });

        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
            dropdown.style.display = 'block';
        });

        dropdown.addEventListener('mouseleave', () => {
            timeoutId = setTimeout(() => {
                if (!profile.matches(':hover')) {
                    dropdown.style.display = 'none';
                }
            }, 500);
        });

        dropdown.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                dropdown.style.display = 'none';
                if (e.target.getAttribute('href') === 'javascript:void(0)') {
                    const onclick = e.target.getAttribute('onclick');
                    if (onclick) {
                        eval(onclick);
                    }
                } else {
                    setTimeout(() => {
                        window.location.href = href;
                    }, 100);
                }
            }
        });
    }
});

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('justLoggedIn', 'true');
            document.getElementById('login-message').textContent = 'Login successful!';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            document.getElementById('login-message').textContent = 'Please fill all fields.';
        }
    });
}

function updateAuthLink() {
    const authLink = document.getElementById('auth-link');
    if (!authLink) return;

    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        authLink.style.display = 'none';
    } else {
        authLink.innerHTML = `<a href="login.html">Login</a>`;
        authLink.style.display = 'block';
    }
}

function updateProfileLink() {
    const profileLink = document.getElementById('profile-link');
    if (!profileLink) return;

    const usernameSpan = profileLink.querySelector('.username');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        const username = sessionStorage.getItem('username') || 'User';
        usernameSpan.innerHTML = `<span class="profile-icon">👤</span> Hi, ${username}`;
        profileLink.style.display = 'block';
    } else {
        profileLink.style.display = 'none';
    }
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('justLoggedIn');
    sessionStorage.removeItem('enrolledCourses');
    
    updateAuthLink();
    updateProfileLink();
    
    window.location.href = 'login.html';
}
function checkLogin() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        const button = event.target;
        const courseCard = button.closest('.course-card');
        const courseTitle = courseCard.querySelector('h3').textContent;
        const courseImage = courseCard.querySelector('.course-img').src;
        const courseDescription = courseCard.querySelector('p').textContent;

        let enrolledCourses = sessionStorage.getItem('enrolledCourses');
        enrolledCourses = enrolledCourses ? JSON.parse(enrolledCourses) : [];

        const isAlreadyEnrolled = enrolledCourses.some(course => course.title === courseTitle);
        if (isAlreadyEnrolled) {
            showNotification('You are already enrolled in this course!', true);
            return;
        }

        enrolledCourses.push({
            title: courseTitle,
            image: courseImage,
            description: courseDescription
        });

        sessionStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));

        showNotification(`Enrolled in ${courseTitle} successfully!`);
        // Removed redirect to your-courses.html
    } else {
        showNotification('Please log in to enroll.', true);
        setTimeout(() => window.location.href = 'login.html', 2000);
    }
}
function displayEnrolledCourses() {
    const enrolledCoursesSection = document.getElementById('enrolled-courses');
    if (!enrolledCoursesSection) return;

    let enrolledCourses = sessionStorage.getItem('enrolledCourses');
    enrolledCourses = enrolledCourses ? JSON.parse(enrolledCourses) : [];

    enrolledCoursesSection.innerHTML = '';

    if (enrolledCourses.length === 0) {
        enrolledCoursesSection.innerHTML = '<p class="no-courses">You have not enrolled in any courses yet.</p>';
        return;
    }

    enrolledCourses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <img src="${course.image}" alt="${course.title}" class="course-img">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <button class="btn-watch" onclick="watchCourse('${course.title}')">Watch</button>
            <button class="btn-unenroll" onclick="unenrollCourse('${course.title}')">Unenroll</button>
        `;
        enrolledCoursesSection.appendChild(courseCard);
    });
}

function watchCourse(courseTitle) {
    showNotification(`Watching ${courseTitle}...`);
    // Add logic here, e.g., redirect to a course video page
}

function displayCourses() {
    const courses = [
        { title: 'JavaScript Basics', image: 'js_logo.png', description: 'Learn the fundamentals of JavaScript.' },
        { title: 'HTML Essentials', image: 'html_logo.png', description: 'Master HTML for web development.' },
        { title: 'CSS Styling', image: 'css_logo.png', description: 'Style your websites with CSS.' }
    ];

    const courseGrid = document.getElementById('course-grid');
    if (!courseGrid) return;

    let enrolledCourses = sessionStorage.getItem('enrolledCourses');
    enrolledCourses = enrolledCourses ? JSON.parse(enrolledCourses) : [];

    courseGrid.innerHTML = '';
    courses.forEach(course => {
        const isEnrolled = enrolledCourses.some(enrolled => enrolled.title === course.title);
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <img src="${course.image}" alt="${course.title}" class="course-img">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            ${isEnrolled 
                ? `<button class="btn-watch" onclick="watchCourse('${course.title}')">Watch</button>` 
                : `<button class="btn" onclick="checkLogin()">Enroll Now</button>`}
        `;
        courseGrid.appendChild(courseCard);
    });
}

// Display candidate details
function displayCandidateDetails() {
    const candidateDetailsSection = document.getElementById('candidate-details');
    if (!candidateDetailsSection) return;

    // Personal Info
    const name = sessionStorage.getItem('candidateName') || 'Not Provided';
    const email = sessionStorage.getItem('candidateEmail') || 'Not Provided';
    const phone = sessionStorage.getItem('candidatePhone') || 'Not Provided';
    const username = sessionStorage.getItem('username') || 'User';

    document.getElementById('candidate-name').textContent = name;
    document.getElementById('candidate-email').textContent = email;
    document.getElementById('candidate-phone').textContent = phone;
    document.getElementById('candidate-username').textContent = username;

    document.getElementById('edit-name').value = name;
    document.getElementById('edit-email').value = email;
    document.getElementById('edit-phone').value = phone;
    document.getElementById('edit-username').value = username;

    // Education Info
    const educationList = document.getElementById('education-list');
    let education = sessionStorage.getItem('candidateEducation');
    education = education ? JSON.parse(education) : [];

    educationList.innerHTML = '';
    if (education.length === 0) {
        educationList.innerHTML = '<p class="no-education">No education details provided yet.</p>';
    } else {
        education.forEach(edu => {
            const eduItem = document.createElement('div');
            eduItem.className = 'education-item';
            eduItem.innerHTML = `
                <p><strong>Degree:</strong> ${edu.degree}</p>
                <p><strong>Institution:</strong> ${edu.institution}</p>
                <p><strong>Year:</strong> ${edu.year}</p>
            `;
            educationList.appendChild(eduItem);
        });
    }

    // Certificates
    const certificateList = document.getElementById('certificate-list');
    let certificates = sessionStorage.getItem('candidateCertificates');
    certificates = certificates ? JSON.parse(certificates) : [];

    certificateList.innerHTML = '';
    if (certificates.length === 0) {
        certificateList.innerHTML = '<p class="no-certificates">No certificates earned yet.</p>';
    } else {
        certificates.forEach(cert => {
            const certCard = document.createElement('div');
            certCard.className = 'course-card';
            certCard.innerHTML = `
                <img src="${cert.image || 'default-cert.png'}" alt="${cert.title}" class="course-img">
                <h3>${cert.title} Certificate</h3>
                <p>${cert.description}</p>
            `;
            certificateList.appendChild(certCard);
        });
    }

    // Resume
    const resumeContainer = document.getElementById('resume-container');
    let resumeFile = sessionStorage.getItem('candidateResume');
    if (resumeFile) {
        resumeContainer.innerHTML = `
            <p><strong>Resume:</strong> <a href="${resumeFile}" target="_blank">View Resume</a></p>
        `;
        document.getElementById('current-resume').innerHTML = `
            <strong>Current Resume:</strong> <a href="${resumeFile}" target="_blank">View Resume</a>
        `;
    } else {
        resumeContainer.innerHTML = '<p id="no-resume">No resume uploaded yet.</p>';
        document.getElementById('current-resume').textContent = 'No resume uploaded yet.';
    }

    // Update profile visibility
    updateProfileVisibility();
}

// Toggle edit mode
function toggleEdit(section) {
    const viewSection = document.getElementById(`${section}-details-view`);
    const editSection = document.getElementById(`${section}-details-edit`);
    if (viewSection.style.display === 'none') {
        viewSection.style.display = 'block';
        editSection.style.display = 'none';
    } else {
        viewSection.style.display = 'none';
        editSection.style.display = 'block';
        if (section === 'education') populateEducationEdit();
        if (section === 'certificate') populateCertificateEdit();
    }
}

// Populate education edit fields
function populateEducationEdit() {
    const editList = document.getElementById('education-edit-list');
    let education = sessionStorage.getItem('candidateEducation');
    education = education ? JSON.parse(education) : [];

    editList.innerHTML = '';
    if (education.length === 0) {
        addEducationField();
    } else {
        education.forEach((edu, index) => {
            addEducationField(edu.degree, edu.institution, edu.year, index);
        });
    }
}

// Add education field
function addEducationField(degree = '', institution = '', year = '', index = Date.now()) {
    const editList = document.getElementById('education-edit-list');
    const eduDiv = document.createElement('div');
    eduDiv.className = 'education-edit-item';
    eduDiv.dataset.index = index;
    eduDiv.innerHTML = `
        <div class="input-group">
            <label>Degree:</label>
            <input type="text" class="edit-degree" value="${degree}">
        </div>
        <div class="input-group">
            <label>Institution:</label>
            <input type="text" class="edit-institution" value="${institution}">
        </div>
        <div class="input-group">
            <label>Year:</label>
            <input type="text" class="edit-year" value="${year}">
        </div>
        <button class="btn btn-unenroll" onclick="removeEducationField(${index})">Remove</button>
    `;
    editList.appendChild(eduDiv);
}

// Remove education field
function removeEducationField(index) {
    const item = document.querySelector(`.education-edit-item[data-index="${index}"]`);
    if (item) item.remove();
}

// Populate certificate edit fields
function populateCertificateEdit() {
    const editList = document.getElementById('certificate-edit-list');
    let certificates = sessionStorage.getItem('candidateCertificates');
    certificates = certificates ? JSON.parse(certificates) : [];

    editList.innerHTML = '';
    certificates.forEach((cert, index) => {
        addCertificateField(cert.title, cert.description, cert.image, index);
    });
}

// Add certificate field
function addCertificateField(title = '', description = '', image = '', index = Date.now()) {
    const editList = document.getElementById('certificate-edit-list');
    const certDiv = document.createElement('div');
    certDiv.className = 'certificate-edit-item';
    certDiv.dataset.index = index;
    certDiv.innerHTML = `
        <div class="input-group">
            <label>Title:</label>
            <input type="text" class="edit-cert-title" value="${title}">
        </div>
        <div class="input-group">
            <label>Description:</label>
            <input type="text" class="edit-cert-desc" value="${description}">
        </div>
        <div class="input-group">
            <label>Image URL:</label>
            <input type="text" class="edit-cert-image" value="${image}" placeholder="e.g., certificate.png">
        </div>
        <button class="btn btn-unenroll" onclick="removeCertificate(${index})">Remove</button>
    `;
    editList.appendChild(certDiv);
}

// Remove certificate
function removeCertificate(index) {
    const item = document.querySelector(`.certificate-edit-item[data-index="${index}"]`);
    if (item) item.remove();
}

// Save details
function saveDetails(section) {
    if (section === 'personal') {
        const name = document.getElementById('edit-name').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        const phone = document.getElementById('edit-phone').value.trim();

        if (!name || !email || !phone) {
            showNotification('Please fill in all required fields.', true);
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            showNotification('Please enter a valid email address.', true);
            return;
        }

        sessionStorage.setItem('candidateName', name);
        sessionStorage.setItem('candidateEmail', email);
        sessionStorage.setItem('candidatePhone', phone);

        document.getElementById('candidate-name').textContent = name;
        document.getElementById('candidate-email').textContent = email;
        document.getElementById('candidate-phone').textContent = phone;

        toggleEdit('personal');
        showNotification('Personal details updated successfully!');
    } else if (section === 'education') {
        const editItems = document.querySelectorAll('.education-edit-item');
        const education = [];
        editItems.forEach(item => {
            const degree = item.querySelector('.edit-degree').value.trim();
            const institution = item.querySelector('.edit-institution').value.trim();
            const year = item.querySelector('.edit-year').value.trim();
            if (degree && institution && year) {
                education.push({ degree, institution, year });
            }
        });

        sessionStorage.setItem('candidateEducation', JSON.stringify(education));
        displayCandidateDetails();
        toggleEdit('education');
        showNotification('Education details updated successfully!');
    } else if (section === 'certificate') {
        const editItems = document.querySelectorAll('.certificate-edit-item');
        const certificates = [];
        editItems.forEach(item => {
            const title = item.querySelector('.edit-cert-title').value.trim();
            const description = item.querySelector('.edit-cert-desc').value.trim();
            const image = item.querySelector('.edit-cert-image').value.trim() || 'default-cert.png';
            if (title && description) {
                certificates.push({ title, description, image });
            }
        });

        sessionStorage.setItem('candidateCertificates', JSON.stringify(certificates));
        displayCertificateSection();
        toggleEdit('certificate');
        showNotification('Certificates updated successfully!');
    } else if (section === 'resume') {
        const resumeUpload = document.getElementById('resume-upload');
        if (resumeUpload.files[0]) {
            const file = resumeUpload.files[0];
            if (file.type === 'application/pdf') {
                const reader = new FileReader();
                reader.onload = function(e) {
                    sessionStorage.setItem('candidateResume', e.target.result);
                    displayCandidateDetails();
                    toggleEdit('resume');
                    showNotification('Resume updated successfully!');
                };
                reader.readAsDataURL(file);
            } else {
                showNotification('Please upload a PDF file.', true);
            }
        } else {
            toggleEdit('resume');
        }
    }
}

// Display certificate section separately for refresh
function displayCertificateSection() {
    const certificateList = document.getElementById('certificate-list');
    let certificates = sessionStorage.getItem('candidateCertificates');
    certificates = certificates ? JSON.parse(certificates) : [];

    certificateList.innerHTML = '';
    if (certificates.length === 0) {
        certificateList.innerHTML = '<p class="no-certificates">No certificates earned yet.</p>';
    } else {
        certificates.forEach(cert => {
            const certCard = document.createElement('div');
            certCard.className = 'course-card';
            certCard.innerHTML = `
                <img src="${cert.image || 'default-cert.png'}" alt="${cert.title}" class="course-img">
                <h3>${cert.title} Certificate</h3>
                <p>${cert.description}</p>
            `;
            certificateList.appendChild(certCard);
        });
    }
}

// Show notification
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = 'notification ' + (isError ? 'notification-error' : 'notification-success');
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Logout function
function logout() {
    sessionStorage.clear();
    showNotification('Logged out successfully!');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

// Update profile visibility
function updateProfileVisibility() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const authLink = document.getElementById('auth-link');
    const profileLink = document.getElementById('profile-link');

    if (isLoggedIn) {
        authLink.style.display = 'none';
        profileLink.style.display = 'block';
        const username = sessionStorage.getItem('username') || 'User';
        profileLink.querySelector('.username').innerHTML = `<span class="profile-icon">👤</span> ${username}`;
    } else {
        authLink.style.display = 'block';
        profileLink.style.display = 'none';
    }
}

// Call functions on page load
document.addEventListener('DOMContentLoaded', () => {
    displayCandidateDetails();
    updateProfileVisibility();

    const resumeUpload = document.getElementById('resume-upload');
    if (resumeUpload) {
        resumeUpload.addEventListener('change', function() {
            // Handled in saveDetails
        });
    }
});

function unenrollCourse(courseTitle) {
    let enrolledCourses = sessionStorage.getItem('enrolledCourses');
    enrolledCourses = enrolledCourses ? JSON.parse(enrolledCourses) : [];

    enrolledCourses = enrolledCourses.filter(course => course.title !== courseTitle);

    sessionStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));

    showNotification('Unenrolled successfully!');

    displayEnrolledCourses();
}

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.add(isError ? 'notification-error' : 'notification-success');
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}