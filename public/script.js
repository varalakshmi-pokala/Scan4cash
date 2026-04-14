// ================== DOM READY ==================
document.addEventListener("DOMContentLoaded", () => {

    // ================== CAROUSEL ==================
    let currentImageIndex = 0;
    const images = document.querySelectorAll('.carousel-image');
    const animations = ['fade', 'slide-left', 'slide-right', 'zoom-fade', 'fade'];

    function nextImage() {
        if (images.length === 0) return;

        images[currentImageIndex].classList.remove('active');

        currentImageIndex = (currentImageIndex + 1) % images.length;

        const nextImg = images[currentImageIndex];

        nextImg.classList.add('active');

        nextImg.className = nextImg.className.replace(
            /\b(fade|slide-left|slide-right|zoom-fade)\b/g, ''
        );

        nextImg.classList.add(animations[currentImageIndex]);
        nextImg.style.transform = 'scale(1)';
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

    // ================== DATE MIN ==================
    const today = new Date().toISOString().split('T')[0];
    const pickupDate = document.getElementById('pickupDate');
    if (pickupDate) {
        pickupDate.setAttribute('min', today);
    }

    // ================== FAQ ==================
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('i');

            answer.classList.toggle('active');
            icon.style.transform = answer.classList.contains('active')
                ? 'rotate(180deg)'
                : 'rotate(0deg)';
        });
    });

    // ================== SCROLL ANIMATION ==================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.about-card, .service-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });

});

// ================== SCROLL ==================
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

// ================== NAVBAR EFFECT ==================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(40, 167, 69, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        navbar.style.backdropFilter = 'none';
    }
});

// ================== MODALS ==================
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

// click outside modal
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        closeAllModals();
    }
};

// ================== FORMS ==================
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

async function submitUpload(event) {
    event.preventDefault();

    const imageFile = document.getElementById('wastePhoto').files[0];

    if (!imageFile) {
        alert("Please upload an image");
        return;
    }

    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("phone", userData.phone);
    formData.append("email", userData.email);
    formData.append("wasteType", document.getElementById('wasteType').value);
    formData.append("description", document.getElementById('wasteDesc').value);
    formData.append("pickupDate", document.getElementById('pickupDate').value);
    formData.append("pickupTime", document.getElementById('pickupTime').value);
    formData.append("location", document.getElementById('pickupLocation').value);
    formData.append("image", imageFile);

    try {
        const response = await fetch("https://scan2clean.onrender.com/add-request", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        closeAllModals();

        setTimeout(() => {
            document.getElementById('referenceId').textContent = data.referenceId;
            openModal('confirmationModal');
        }, 300);

    } catch (error) {
        alert("Error submitting request");
        console.error(error);
    }
}

    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

    const formData = {
        ...userData,
        wasteType: document.getElementById('wasteType').value,
        description: document.getElementById('wasteDesc').value,
        pickupDate: document.getElementById('pickupDate').value,
        pickupTime: document.getElementById('pickupTime').value,
        location: document.getElementById('pickupLocation').value,
        image: imageFile.name
    };

    if (!formData.wasteType || !formData.description || !formData.pickupDate || !formData.location) {
        alert("Please fill all required fields");
        return;
    }

    sessionStorage.setItem('requestData', JSON.stringify(formData));

    const refId = 'S4C-' + Date.now().toString().slice(-6);

    closeAllModals();

    setTimeout(() => {
        document.getElementById('referenceId').textContent = refId;
        openModal('confirmationModal');
    }, 300);


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
            alert("Unable to fetch address");
        }
    }, () => {
        alert("Permission denied");
    });
}

// ================== EXTRA ==================
function removeImage() {
    const preview = document.getElementById('imagePreview');
    preview.src = "";
    preview.style.display = "none";

    document.getElementById('wastePhoto').value = "";
}

function goBackToRegistration() {
    closeAllModals();
    setTimeout(() => openModal('registrationModal'), 200);
}

// OPTIONAL (remove if not needed)
// setTimeout(() => openModal('registrationModal'), 5000);