document.addEventListener('DOMContentLoaded', async () => {

    // --- Dynamic Media Resolution Helper ---
    const renderMediaNode = (src, alt, baseStyles = '', className = '') => {
        if (!src) return '';
        if (src.toLowerCase().match(/\.(mp4|webm|mov)$/)) {
            return `<video src="${src}" class="${className}" style="${baseStyles}" autoplay loop muted playsinline></video>`;
        }
        return `<img src="${src}" alt="${alt}" class="${className}" style="${baseStyles}">`;
    };

    // --- Dynamic Decap CMS Engine Asynchronous API Map ---
    let projectsData = [];
    let globalData = {};

    try {
        const response = await fetch('data.json');
        if (response.ok) {
            const data = await response.json();
            projectsData = data.portfolioProjects || [];
            globalData = data;
            window.portfolioProjects = projectsData; // Maintain global reference for routing
        }
    } catch (e) {
        console.warn("CMS JSON payload mapping offline.");
    }

    // --- 1. Global / Sidebar Sync ---
    const siteSettings = globalData.siteSettings;
    if (siteSettings) {
        const nameEl = document.getElementById('cms-userName');
        const roleEl = document.getElementById('cms-userRole');
        const avatarEl = document.querySelector('.avatar');
        const statusEl = document.getElementById('cms-statusText');
        const mainHeadingEl = document.getElementById('cms-mainHeading');
        const footerHeadingEl = document.getElementById('cms-footerHeading');

        if (nameEl) nameEl.textContent = siteSettings.userName;
        if (roleEl) roleEl.textContent = siteSettings.userRole;
        if (avatarEl && siteSettings.userAvatar) avatarEl.src = siteSettings.userAvatar;
        if (statusEl) statusEl.textContent = siteSettings.statusText;
        if (mainHeadingEl) mainHeadingEl.innerHTML = siteSettings.mainHeading.replace(/\n/g, '<br>');
        if (footerHeadingEl) footerHeadingEl.textContent = siteSettings.mainHeading; // Reusing or custom field
    }

    // --- 2. Portfolio Projects (Home & All Work) ---
    const indexContainer = document.querySelector('.projects-list');
    const masonryContainer = document.querySelector('.masonry-grid');
    
    if (indexContainer && projectsData.length > 0) {
        indexContainer.innerHTML = projectsData.map(p => `
            <a href="project.html?id=${p.id}" style="text-decoration:none;" class="project-card interactive-card">
                <div class="project-thumb">
                    ${renderMediaNode(p.caseStudy?.heroImage || '', p.title, 'width:100%; height:100%; object-fit:cover; border-radius:inherit;')}
                </div>
                <div class="project-text">
                    <h3 class="project-title">${p.title}</h3>
                    <p class="project-desc">${p.desc}</p>
                </div>
                <span class="project-tag">${p.tag}</span>
            </a>
        `).join('');
    }

    if (masonryContainer && projectsData.length > 0) {
        const params = new URLSearchParams(window.location.search);
        const filterType = params.get('filter');
        let filteredProjects = projectsData;
        if (filterType === 'motion') filteredProjects = projectsData.filter(p => p.tag === 'Motion Design');
        else if (filterType === 'brand') filteredProjects = projectsData.filter(p => p.tag === 'Brand Design');

        masonryContainer.innerHTML = filteredProjects.map(p => `
            <a href="project.html?id=${p.id}" style="text-decoration:none;" class="masonry-card interactive-card">
                <div class="masonry-thumb">
                    ${renderMediaNode(p.caseStudy?.heroImage || '', p.title, 'width:100%; height:100%; object-fit:cover; border-radius:inherit;')}
                </div>
                <div class="masonry-text">
                    <h3 class="masonry-title">${p.title}</h3>
                    <p class="masonry-desc">${p.desc}</p>
                    <span class="masonry-tag">${p.tag}</span>
                </div>
            </a>
        `).join('');
    }

    // --- 3. About Page Sync ---
    const aboutPage = globalData.aboutPage;
    if (aboutPage) {
        const heroEl = document.getElementById('cms-aboutHero');
        const copyEl = document.getElementById('cms-aboutCopy');
        const statsEl = document.getElementById('cms-aboutStats');

        if (heroEl) heroEl.src = aboutPage.aboutHero;
        if (copyEl) {
            const bioHtml = aboutPage.bio.map(b => `<p>${b.text}</p><br>`).join('');
            copyEl.innerHTML = bioHtml;
        }
        if (statsEl) {
            statsEl.innerHTML = aboutPage.stats.map(s => `
                <div class="stat-block"><h4>${s.value}</h4><p>${s.label}</p></div>
            `).join('');
        }
    }

    // --- 4. Contact Page Sync ---
    const contactPage = globalData.contactPage;
    if (contactPage) {
        const headingEl = document.getElementById('cms-contactHeading');
        const descEl = document.getElementById('cms-contactDescription');
        const footerLinks = document.querySelectorAll('.footer-col');

        if (headingEl) headingEl.textContent = contactPage.heading;
        if (descEl) descEl.textContent = contactPage.description;
        
        // Update social links in footer globally
        if (contactPage.socials) {
            footerLinks.forEach(col => {
                if (col.querySelector('h5')?.textContent === 'Socials') {
                    col.innerHTML = `<h5>Socials</h5>` + contactPage.socials.map(s => `
                        <a href="${s.url}" target="_blank">${s.platform}</a>
                    `).join('');
                }
            });
        }
    }

    // --- 5. Playground Sync ---
    const pgGrid = document.getElementById('cms-playgroundGrid');
    if (pgGrid && globalData.playgroundItems) {
        pgGrid.innerHTML = globalData.playgroundItems.map((item, index) => `
            <div class="playground-img-wrapper interactive-card stagger-in" style="animation-delay: ${index * 0.1}s">
                ${renderMediaNode(item.media, 'Playground Media', 'width:100%; height:100%; object-fit:cover;')}
            </div>
        `).join('');
    }

    // --- 6. Case Study Routing ---
    const caseContent = document.getElementById('case-study-content');
    if (caseContent && projectsData.length > 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        const project = projectsData.find(p => p.id === projectId);
        
        if (project) {
            const safeGallery = Array.isArray(project.caseStudy?.gallery) ? project.caseStudy.gallery : (project.caseStudy?.galleryImages || []);
            const galleryParsed = safeGallery.map(imgData => typeof imgData === 'string' ? imgData : imgData.image);

            caseContent.innerHTML = `
                ${renderMediaNode(project.caseStudy?.heroImage || '', project.title, 'animation-delay: 0.1s', 'case-study-hero stagger-in')}
                <div class="case-meta stagger-in" style="animation-delay: 0.2s">
                    <div class="meta-item"><span class="meta-label">Client</span><span class="meta-value">${project.caseStudy?.client || ''}</span></div>
                    <div class="meta-item"><span class="meta-label">Role</span><span class="meta-value">${project.caseStudy?.role || ''}</span></div>
                    <div class="meta-item"><span class="meta-label">Year</span><span class="meta-value">${project.caseStudy?.year || ''}</span></div>
                    <div class="meta-item"><span class="meta-label">Discipline</span><span class="meta-value">${project.tag || ''}</span></div>
                </div>
                <div class="case-section stagger-in" style="animation-delay: 0.3s">
                    <h3>The Challenge</h3>
                    <p>${project.caseStudy?.challenge || project.caseStudy?.clientChallenge || ''}</p>
                </div>
                <div class="case-section stagger-in" style="animation-delay: 0.4s">
                    <h3>The Solution</h3>
                    <p>${project.caseStudy?.solution || project.caseStudy?.solutionStrategy || ''}</p>
                </div>
                <div class="case-gallery stagger-in" style="animation-delay: 0.5s">
                    ${galleryParsed.map(src => renderMediaNode(src, 'Gallery Media', 'animation-delay: 0.6s; width: 100%; border-radius: var(--radius-lg);', 'stagger-in')).join('')}
                </div>
            `;
        }
    }

    // --- Interactive Effects Stagger & Mouse ---
    const cards = document.querySelectorAll('.project-card, .masonry-card, .stagger-in');
    cards.forEach((card, index) => {
        if (!card.style.animationDelay) card.style.animationDelay = `${(index * 0.05) + 0.1}s`;
        card.classList.add('stagger-in');
    });

    const interactiveCards = document.querySelectorAll('.interactive-card');
    interactiveCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    const profileCard = document.querySelector('.profile-card');
    const avatar = document.querySelector('.avatar');
    if (profileCard && avatar) {
        profileCard.addEventListener('mousemove', (e) => {
            const rect = profileCard.getBoundingClientRect();
            const xAxis = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const yAxis = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            avatar.style.transform = `translate(${xAxis * 5}px, ${yAxis * 5}px) scale(1.05)`;
        });
        profileCard.addEventListener('mouseleave', () => {
            avatar.style.transform = `translate(0px, 0px) scale(1)`;
        });
    }
});

