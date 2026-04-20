document.addEventListener('DOMContentLoaded', async () => {

    // --- Dynamic Decap CMS Engine Asynchronous API Map ---
    let projectsData = window.portfolioProjects || []; // Fallback to raw data.js defaults initially
    
    try {
        const response = await fetch('data.json');
        if (response.ok) {
            const data = await response.json();
            // Integrate CMS payload seamlessly overriding static array mappings
            if (data.portfolioProjects && data.portfolioProjects.length > 0) {
                projectsData = data.portfolioProjects;
                window.portfolioProjects = projectsData; // Hardcode global update enforcing routing template parsing correctly natively
            }
        }
    } catch (e) {
        console.warn("CMS JSON payload mapping offline. Relying strictly on raw data.js schema securely.");
    }

    const indexContainer = document.querySelector('.projects-list');
    const masonryContainer = document.querySelector('.masonry-grid');
    
    // Auto-Injector: Render all items on the Home Page context
    if (indexContainer && projectsData.length > 0) {
        indexContainer.innerHTML = projectsData.map(p => `
            <a href="project.html?id=${p.id}" style="text-decoration:none;" class="project-card interactive-card">
                <div class="project-thumb">
                    <img src="${p.caseStudy.heroImage}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">
                </div>
                <div class="project-text">
                    <h3 class="project-title">${p.title}</h3>
                    <p class="project-desc">${p.desc}</p>
                </div>
                <span class="project-tag">${p.tag}</span>
            </a>
        `).join('');
    }

    // Auto-Injector: Render all globally spanning items on the All-Work Masonry Page, listening to route filters
    if (masonryContainer && projectsData.length > 0) {
        const params = new URLSearchParams(window.location.search);
        const filterType = params.get('filter');
        
        let filteredProjects = projectsData;
        
        if (filterType === 'motion') {
            filteredProjects = projectsData.filter(p => p.tag === 'Motion Design');
        } else if (filterType === 'brand') {
            filteredProjects = projectsData.filter(p => p.tag === 'Brand Design');
        }

        masonryContainer.innerHTML = filteredProjects.map(p => `
            <a href="project.html?id=${p.id}" style="text-decoration:none;" class="masonry-card interactive-card">
                <div class="masonry-thumb">
                    <img src="${p.caseStudy.heroImage}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">
                </div>
                <div class="masonry-text">
                    <h3 class="masonry-title">${p.title}</h3>
                    <p class="masonry-desc">${p.desc}</p>
                    <span class="masonry-tag">${p.tag}</span>
                </div>
            </a>
        `).join('');
    }

    // --- Dynamic Case Study Deep Routing logic ---
    const caseContent = document.getElementById('case-study-content');
    if (caseContent && window.portfolioProjects) {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        const project = window.portfolioProjects.find(p => p.id === projectId);
        
        if (project) {
            document.title = `${project.title} - Case Study`;
            caseContent.innerHTML = `
                <img src="${project.caseStudy.heroImage}" alt="${project.title}" class="case-study-hero stagger-in" style="animation-delay: 0.1s">
                
                <div class="case-meta stagger-in" style="animation-delay: 0.2s">
                    <div class="meta-item"><span class="meta-label">Client</span><span class="meta-value">${project.caseStudy.client}</span></div>
                    <div class="meta-item"><span class="meta-label">Role</span><span class="meta-value">${project.caseStudy.role}</span></div>
                    <div class="meta-item"><span class="meta-label">Year</span><span class="meta-value">${project.caseStudy.year}</span></div>
                    <div class="meta-item"><span class="meta-label">Discipline</span><span class="meta-value">${project.tag}</span></div>
                </div>

                <div class="case-section stagger-in" style="animation-delay: 0.3s">
                    <h3>The Challenge</h3>
                    <p>${project.caseStudy.challenge}</p>
                </div>
                
                <div class="case-section stagger-in" style="animation-delay: 0.4s">
                    <h3>The Solution</h3>
                    <p>${project.caseStudy.solution}</p>
                </div>

                <div class="case-gallery stagger-in" style="animation-delay: 0.5s">
                    ${project.caseStudy.galleryImages.map(img => `<img src="${img}" alt="Gallery Architecture" class="stagger-in" style="animation-delay: 0.6s">`).join('')}
                </div>
            `;
        } else {
            caseContent.innerHTML = `
                <div class="case-section">
                    <h3>Project not found.</h3>
                    <p>We couldn't locate the requested case study architecture.</p>
                </div>
            `;
        }
    }

    // 1. Stagger animate the newly injected DOM nodes
    const cards = document.querySelectorAll('.project-card, .masonry-card');
    
    cards.forEach((card, index) => {
        // Delay each card's entry animation slightly
        card.style.animationDelay = `${(index * 0.1) + 0.2}s`;
        card.classList.add('stagger-in');
    });

    // 2. Mouse Glow Effect on Interactive Cards
    // Tracks the mouse position over a card and updates custom CSS variables
    const interactiveCards = document.querySelectorAll('.interactive-card');
    
    interactiveCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            // Calculate cursor position relative to the element
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set properties for the CSS radial-gradient to follow
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 3. Optional: Subtle parallax effect on avatar when moving mouse within the profile card
    const profileCard = document.querySelector('.profile-card');
    const avatar = document.querySelector('.avatar');

    if (profileCard && avatar) {
        profileCard.addEventListener('mousemove', (e) => {
            const rect = profileCard.getBoundingClientRect();
            // Normalize values between -1 and 1
            const xAxis = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const yAxis = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            
            avatar.style.transform = `translate(${xAxis * 5}px, ${yAxis * 5}px) scale(1.05)`;
        });
        
        profileCard.addEventListener('mouseleave', () => {
            avatar.style.transform = `translate(0px, 0px) scale(1)`;
        });
    }
});
