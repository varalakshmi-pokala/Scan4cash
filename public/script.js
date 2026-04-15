// ================== DOM READY ==================
document.addEventListener("DOMContentLoaded", () => {
 // Show market button after 5 seconds with fade-in
    setTimeout(() => {
        const marketBtn = document.getElementById('marketBtn');
        if (marketBtn) {
            marketBtn.classList.add('visible');
        }
    }, 2000); // 5 seconds delay
    // ================== CAROUSEL ==================
    let currentImageIndex = 0;
    const images = document.querySelectorAll('.carousel-image');
    const animations = ['fade', 'slide-left', 'slide-right', 'zoom-fade'];

    function nextImage() {
        if (images.length === 0) return;

        images[currentImageIndex].classList.remove('active');

        currentImageIndex = (currentImageIndex + 1) % images.length;

        const nextImg = images[currentImageIndex];

        nextImg.classList.add('active');

        nextImg.className = nextImg.className.replace(
            /\b(fade|slide-left|slide-right|zoom-fade)\b/g, ''
        );

        nextImg.classList.add(animations[currentImageIndex % animations.length]);
    }

    setInterval(nextImage, 4000);

    // ================== IMAGE PREVIEW ==================
    const fileInput = document.getElementById('wastePhoto');
    const cameraInput = document.getElementById('cameraPhoto');
    const preview = document.getElementById('imagePreview');

    function showPreview(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            showPreview(e.target.files[0]);
        });
    }

    if (cameraInput) {
        cameraInput.addEventListener('change', (e) => {
            showPreview(e.target.files[0]);
        });
    }

    // ================== DATE LIMIT ==================
    const today = new Date().toISOString().split('T')[0];
    const pickupDate = document.getElementById('pickupDate');
    if (pickupDate) {
        pickupDate.setAttribute('min', today);
    }
});


// ================== SCROLL ==================
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ================== NAVBAR EFFECT ==================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(40,167,69,0.95)';
    } else {
        navbar.style.background = 'linear-gradient(135deg,#28a745,#20c997)';
    }
});


// ================== BACK TO TOP ==================
window.addEventListener('scroll', () => {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    if (window.scrollY > 300) {
        btn.classList.add('show');
    } else {
        btn.classList.remove('show');
    }
});


// ================== MODALS ==================
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    document.body.style.overflow = 'auto';
}

window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        closeAllModals();
    }
};


// ================== REGISTRATION ==================
function submitRegistration(event) {
    event.preventDefault();

    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;
    const email = document.getElementById('userEmail').value;

    if (!name || !phone || !email) {
        alert("Please fill all fields");
        return;
    }

    sessionStorage.setItem('userData', JSON.stringify({ name, phone, email }));

    closeAllModals();
    setTimeout(() => openModal('uploadModal'), 300);
}


// ================== FINAL SUBMIT ==================
async function submitUpload(event) {
    event.preventDefault();

    const fileInput = document.getElementById('wastePhoto');
const cameraInput = document.getElementById('cameraPhoto');

const imageFile = fileInput.files[0] || cameraInput.files[0];

    if (!imageFile) {
        alert("Please upload an image");
        return;
    }

    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("phone", userData.phone);
    formData.append("email", userData.email);
    formData.append("description", document.getElementById('wasteDesc').value);
    formData.append("date", document.getElementById('pickupDate').value);
    formData.append("location", document.getElementById('pickupLocation').value);
    formData.append("image", imageFile);

    try {
        const response = await fetch("/add-request", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Server error");
        }

        closeAllModals();

        setTimeout(() => {
            document.getElementById('referenceId').textContent =
                "S2C-" + Date.now().toString().slice(-6);
            openModal('confirmationModal');
        }, 300);

    } catch (error) {
        alert("❌ Error: " + error.message);
        console.error(error);
    }
}


// ================== CONTACT FORM ==================
async function submitContact(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById("contactName").value,
        email: document.getElementById("contactEmail").value,
        phone: document.getElementById("contactPhone").value,
        message: document.getElementById("contactMessage").value
    };

    try {
        await fetch("/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        alert("Message sent successfully ✅");

    } catch (err) {
        alert("Failed to send message ❌");
        console.error(err);
    }
}


// ================== LOCATION ==================
function detectCurrentLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );
            const data = await res.json();
            document.getElementById('pickupLocation').value = data.display_name;
        } catch {
            alert("Unable to fetch location");
        }
    }, () => {
        alert("Permission denied");
    });
}


// ================== REMOVE IMAGE ==================
function removeImage() {
    const preview = document.getElementById('imagePreview');
    preview.src = "";
    preview.style.display = "none";
    document.getElementById('wastePhoto').value = "";
}


// ================== BACK ==================
function goBackToRegistration() {
    closeAllModals();
    setTimeout(() => openModal('registrationModal'), 200);
}
// ================== HAMBURGER MENU ==================
document.addEventListener("DOMContentLoaded", () => {
    // ... your existing code ...

    // Hamburger menu toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        });
    }

    // Close mobile menu when clicking on a link
    const navLinkItems = document.querySelectorAll('.nav-links li a');
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // ... rest of your existing code ...
});

document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll('.faq-question').forEach(question => {

        question.addEventListener('click', () => {

            const answer = question.nextElementSibling;
            const icon = question.querySelector('i');

            // Close all other answers (optional)
            document.querySelectorAll('.faq-answer').forEach(a => {
                if (a !== answer) {
                    a.classList.remove('active');
                }
            });

            // Toggle current
            answer.classList.toggle('active');

            // Rotate icon
            if (icon) {
                icon.style.transform = answer.classList.contains('active')
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)';
            }
        });

    });

});