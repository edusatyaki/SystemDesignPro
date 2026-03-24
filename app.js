$(document).ready(function() {
    
    // Mobile Hamburger Menu Logic
    $('#mobile-menu-btn').on('click', function(e) {
        e.preventDefault();
        $('#detail-nav-links').toggleClass('mobile-open');
    });

    $('#detail-nav-links a').on('click', function() {
        if ($(window).width() <= 768) {
            $('#detail-nav-links').removeClass('mobile-open');
        }
    });

    // Hash change observer for SPA routing
    $(window).on('hashchange', function() {
        const hash = location.hash;
        if (hash && hash !== '#') {
            const topicId = hash.replace('#', '');
            if (systemDesigns[topicId]) {
                const data = systemDesigns[topicId];
                
                if (data.isExternal) {
                    // For massive custom pages, redirect them completely to avoid SPA CSS conflicts
                    window.location.href = data.fileName;
                } else {
                    // Render the generic document template
                    renderDetailView(data);
                }
                return;
            }
        }
        renderHomeGallery();
    });

    // Handle home link clicking
    $('#home-link').on('click', function(e) {
        e.preventDefault();
        window.location.hash = ''; 
    });

    // Initial load check
    if (location.hash && location.hash !== '#') {
        $(window).trigger('hashchange');
    } else {
        renderHomeGallery();
    }

    // Render the 50 case study cards
    function renderHomeGallery() {
        $('#detail-view').hide();
        $('#detail-nav-links').hide();
        $('#nav-back-btn').hide();
        $('#detail-nav-links').removeClass('mobile-open');
        $('#gallery-view').fadeIn(300);
        $('body').removeClass('detail-active');
        
        const $grid = $('#card-container');
        $grid.empty();
        
        $.each(systemDesigns, function(id, data) {
            
            const tagsHtml = data.techStack.slice(0, 3).map(t => `<span class="topic-tag">${t}</span>`).join('');
            
            // Determine lang class based on first tech
            const firstTech = data.techStack[0] ? data.techStack[0].toLowerCase() : '';
            let langClass = 'lang-default';
            if (firstTech.includes('go')) langClass = 'lang-go';
            else if (firstTech.includes('java') && !firstTech.includes('script')) langClass = 'lang-java';
            else if (firstTech.includes('scala')) langClass = 'lang-scala';
            else if (firstTech.includes('script') || firstTech.includes('node') || firstTech.includes('react')) langClass = 'lang-javascript';
            else if (firstTech.includes('python')) langClass = 'lang-python-sd';
            else if (firstTech.includes('c++')) langClass = 'lang-cpp';
            
            const cardHtml = `
                <a href="#${id}" class="repo-card" data-title="${data.title.toLowerCase()}" data-category="${data.category || 'system'}">
                    <div class="repo-card-body">
                        <div class="repo-header">
                            <div class="repo-title-group">
                                <svg class="icon" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path></svg>
                                <span class="repo-title">${data.title}</span>
                            </div>
                            <span class="repo-badge">Public</span>
                        </div>
                        <p class="repo-desc">${data.overview}</p>
                        <div class="repo-tags">${tagsHtml}</div>
                        <div class="repo-footer">
                            <span><span class="lang-color ${langClass}"></span> ${data.techStack[0] || 'Unknown'}</span>
                        </div>
                    </div>
                </a>
            `;
            $grid.append(cardHtml);
        });
        
        // Re-init lucide icons for newly appended DOM
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function renderDetailView(data) {
        $('#gallery-view').hide();
        
        let details = data.detail;
        
        // Populate DOM elements defined in index.html
        $('#doc-title').text(data.title);
        $('#doc-overview').text(data.overview);
        $('#doc-architecture-text').text(data.architecture);
        $('#doc-db-text').text(data.database_desc || data.database);
        $('#doc-security-text').text(data.security);
        $('#doc-monitoring-text').text(data.monitoring);
        
        // Tags
        const tagsHtml = data.techStack.map(t => `<span class="card-tag tech-badge" style="background: rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; font-size: 0.8rem; padding: 0.2rem 0.6rem; border-radius: 4px;">${t}</span>`).join('');
        $('#doc-tags').html(tagsHtml);
        
        // 1. Requirements
        if (details && details.reqs) {
            const reqsHtml = details.reqs.map(r => `
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="color: var(--accent);"><i data-lucide="${r.icon}"></i></div>
                    <div>
                        <h4 style="color: #fff; font-family: var(--font-heading); margin-bottom: 0.5rem; font-size: 1.1rem;">${r.title}</h4>
                        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">${r.desc}</p>
                    </div>
                </div>
            `).join('');
            $('#doc-req-features').html(reqsHtml);
        }

        // 2. Architecture Accordion
        if (details && details.arch_layers) {
            const layersHtml = details.arch_layers.map((l, idx) => `
                <button class="arch-layer-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}" style="background: ${idx === 0 ? 'rgba(56,189,248,0.1)' : 'var(--card-bg)'}; border: 1px solid ${idx === 0 ? 'var(--accent)' : 'var(--card-border)'}; border-radius: 8px; padding: 1rem 1.5rem; text-align: left; display: flex; align-items: center; justify-content: space-between; color: #fff; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="color: ${idx === 0 ? 'var(--accent)' : 'var(--text-secondary)'};"><i data-lucide="${l.icon}"></i></span>
                        <span style="font-size: 1rem;">${l.title}</span>
                    </div>
                    <i data-lucide="chevron-right" style="color: var(--text-secondary); width: 16px;"></i>
                </button>
            `).join('');
            $('#doc-arch-accordion').html(layersHtml);
            
            // Setup clicks
            $('.arch-layer-btn').on('click', function() {
                $('.arch-layer-btn').css({'background': 'var(--card-bg)', 'border-color': 'var(--card-border)'}).find('i').first().css('color', 'var(--text-secondary)');
                $(this).css({'background': 'rgba(56,189,248,0.1)', 'border-color': 'var(--accent)'}).find('i').first().css('color', 'var(--accent)');
                const l = details.arch_layers[$(this).attr('data-idx')];
                $('#doc-arch-info').html(`
                    <h3 style="color: #fff; font-family: var(--font-heading); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; font-size: 1.5rem;"><span style="color: var(--accent);"><i data-lucide="${l.icon}" style="width: 28px; height: 28px;"></i></span> ${l.title}</h3>
                    <p style="color: var(--text-secondary); line-height: 1.7; font-size: 1rem; margin-bottom: 2rem;">${l.desc}</p>
                    <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600; margin-bottom: 0.75rem; letter-spacing: 0.05em;">Key Technologies</div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${l.tech.map(t => `<span style="background: rgba(56,189,248,0.05); border: 1px solid rgba(56,189,248,0.2); padding: 0.35rem 0.85rem; border-radius: 6px; color: var(--accent); font-size: 0.85rem; font-weight: 500;">${t}</span>`).join('')}
                    </div>
                `);
                lucide.createIcons();
            });
            // Click first
            $('.arch-layer-btn').first().trigger('click');
        }

        // 3. Microservices Tabs
        if (details && details.microservices) {
            const tabsHtml = details.microservices.map((ms, idx) => `
                <button class="svc-tab-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}" style="background: transparent; border: 1px solid transparent; border-left: 3px solid ${idx === 0 ? 'var(--accent)' : 'var(--card-border)'}; padding: 1.25rem 1rem; text-align: left; display: flex; align-items: center; gap: 0.75rem; color: ${idx === 0 ? 'var(--accent)' : 'var(--text-secondary)'}; cursor: pointer; transition: all 0.2s; font-weight: 500; font-size: 1rem;">
                    <i data-lucide="${ms.icon}" style="width: 20px;"></i> <span>${ms.title}</span>
                </button>
            `).join('');
            $('#doc-ms-tabs').html(tabsHtml);
            
            $('.svc-tab-btn').on('click', function() {
                $('.svc-tab-btn').css({'border-left-color': 'var(--card-border)', 'color': 'var(--text-secondary)'});
                $(this).css({'border-left-color': 'var(--accent)', 'color': 'var(--accent)'});
                const ms = details.microservices[$(this).attr('data-idx')];
                $('#doc-ms-detail').html(`
                    <div style="display: flex; align-items: flex-start; gap: 1.25rem; padding-bottom: 2rem; border-bottom: 1px solid var(--card-border); margin-bottom: 2rem;">
                        <span style="color: var(--accent); background: rgba(56,189,248,0.1); padding: 1rem; border-radius: 12px;"><i data-lucide="${ms.icon}" style="width: 32px; height: 32px;"></i></span>
                        <div>
                            <h3 style="color: #fff; font-family: var(--font-heading); margin-bottom: 0.5rem; font-size: 1.5rem;">${ms.title}</h3>
                            <p style="color: var(--text-secondary); font-size: 1rem;">${ms.details}</p>
                        </div>
                    </div>
                    
                    <div class="svc-grid-inner" style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 2.5rem;">
                        <div>
                            <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600; margin-bottom: 1.25rem; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="check-circle" style="width: 14px;"></i> Responsibilities</div>
                            <ul style="list-style: none; color: #fff; font-size: 0.95rem; display: flex; flex-direction: column; gap: 0.75rem;">
                                ${ms.responsibilities.map(r => `<li style="display: flex; gap: 0.75rem; line-height: 1.4;"><div style="color: var(--accent); margin-top: 0.2rem;"><i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i></div> <span>${r}</span></li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600; margin-bottom: 1.25rem; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="zap" style="width: 14px;"></i> API Endpoints</div>
                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                ${ms.endpoints.map(e => `
                                    <div style="background: rgba(0,0,0,0.4); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); font-family: var(--font-mono); font-size: 0.85rem; display: flex; gap: 1rem; align-items: center;">
                                        <span style="color: ${e.method === 'GET' ? '#4ade80' : e.method === 'POST' ? '#38bdf8' : e.method === 'WS' ? '#f472b6' : '#fbbf24'}; font-weight: 700; width: 45px;">${e.method}</span>
                                        <span style="color: #e2e8f0;">${e.path}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.02);">
                        <div>
                            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600; margin-bottom: 0.75rem; letter-spacing: 0.05em;">Data Store</div>
                            <div style="color: #fff; font-size: 1rem; display: flex; align-items: center; gap: 0.75rem;"><span style="color: #94a3b8;"><i data-lucide="database"></i></span> ${ms.db}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600; margin-bottom: 0.75rem; letter-spacing: 0.05em;">Caching Strategy</div>
                            <div style="color: #fff; font-size: 1rem; display: flex; align-items: center; gap: 0.75rem;"><span style="color: #facc15;"><i data-lucide="bolt"></i></span> ${ms.cache}</div>
                        </div>
                    </div>
                `);
                lucide.createIcons();
            });
            $('.svc-tab-btn').first().trigger('click');
        }

        // 4. Database Schema
        if (details && details.db_schema) {
            const dbTabsHtml = details.db_schema.map((db, idx) => `
                <button class="db-tab-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}" style="background: ${idx === 0 ? 'rgba(255,255,255,0.05)' : 'transparent'}; border: 1px solid ${idx === 0 ? 'rgba(255,255,255,0.1)' : 'transparent'}; border-radius: 8px; padding: 1rem; text-align: left; display: flex; justify-content: space-between; align-items: center; color: #fff; cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: var(--text-secondary);"><i data-lucide="table" style="width: 16px;"></i></span>
                        <span style="font-family: var(--font-mono); font-size: 0.95rem;">${db.title}</span>
                    </div>
                    <span style="background: rgba(0,0,0,0.4); font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 6px; color: var(--text-secondary);">${db.cols}</span>
                </button>
            `).join('');
            $('#doc-db-tabs').html(dbTabsHtml);
            
            $('.db-tab-btn').on('click', function() {
                $('.db-tab-btn').css({'background': 'transparent', 'border-color': 'transparent'});
                $(this).css({'background': 'rgba(255,255,255,0.05)', 'border-color': 'rgba(255,255,255,0.1)'});
                const db = details.db_schema[$(this).attr('data-idx')];
                $('#doc-db-detail').html(`
                    <div style="background: rgba(0,0,0,0.4); padding: 1.5rem 2rem; border-bottom: 1px solid var(--card-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <h3 style="font-family: var(--font-mono); color: var(--accent); margin: 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="table"></i> ${db.title}</h3>
                        ${db.index ? `<span style="background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.3); color: var(--accent); padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.8rem; font-family: var(--font-mono);"><i data-lucide="key" style="width: 12px; margin-right: 4px;"></i> ${db.index}</span>` : ''}
                    </div>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 500px;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--card-border); background: rgba(255,255,255,0.02);">
                                    <th style="padding: 1.25rem 2rem; color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Column</th>
                                    <th style="padding: 1.25rem 2rem; color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Type</th>
                                    <th style="padding: 1.25rem 2rem; color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${db.columns.map(c => `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.02); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                                        <td style="padding: 1.25rem 2rem; font-family: var(--font-mono); font-size: 0.95rem; color: #fff; font-weight: 500;">${c.name}</td>
                                        <td style="padding: 1.25rem 2rem; font-family: var(--font-mono); font-size: 0.9rem; color: var(--accent);">${c.type}</td>
                                        <td style="padding: 1.25rem 2rem; font-size: 0.9rem; color: var(--text-secondary); font-style: italic;">${c.notes}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `);
                lucide.createIcons();
            });
            $('.db-tab-btn').first().trigger('click');
        }
        // 5. Implementation
        let implData = data.detail.implementation;
        
        $('.impl-tab-btn').off('click').on('click', function(e) {
            $('.impl-tab-btn').addClass('active');
            let target = $(this).attr('data-target');
            $('#code-lang-selector').val(''); // Or leave it alone.
            renderImplCode(target);
        });

        $('#code-lang-selector').off('change').on('change', function(e) {
            $('.impl-tab-btn').removeClass('active');
            let target = $(this).val();
            if (target) renderImplCode(target);
        });
        
        function renderImplCode(target) {
            
            let contentHtml = '';
            let rawCode = '';
            if (target === 'diagram') {
                contentHtml = `<div class="mermaid">${implData.class_diagram.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
            } else {
                if (target === 'cpp') rawCode = implData.code.cpp;
                if (target === 'java') rawCode = implData.code.java;
                if (target === 'python') rawCode = implData.code.python;
                
                contentHtml = `
                <div style="position: relative;" class="code-container">
                        <button class="copy-code-btn" style="position: absolute; top: 0.5rem; right: 0.5rem; background: var(--gh-btn-bg, #21262d); border: 1px solid var(--gh-border, #30363d); color: var(--gh-text-main, #c9d1d9); padding: 0.35rem 0.6rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 500; display: flex; align-items: center; gap: 4px; z-index: 10; transition: all 0.2s;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy
                        </button>
                        <pre style="margin: 0; padding-top: 2.5rem !important;"><code class="language-${target}">${rawCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                    </div>`;
                }
                
                $('#doc-impl-detail').html(contentHtml);
                
                if (target === 'diagram' && window.mermaid) {
                    $('#doc-impl-detail').css('background', '#161b22').css('color', '#c9d1d9').css('padding', '2rem');
                    mermaid.initialize({
                        startOnLoad: false,
                        theme: 'base',
                        themeVariables: {
                            background: '#161b22',
                            primaryColor: '#1f6feb',
                            primaryTextColor: '#ffffff',
                            primaryBorderColor: '#58a6ff',
                            lineColor: '#8b949e',
                            secondaryColor: '#238636',
                            tertiaryColor: '#a371f7',
                            clusterBkg: '#21262d',
                            classText: '#ffffff'
                        }
                    });
                    mermaid.init(undefined, $('.mermaid'));
                } else {
                    $('#doc-impl-detail').css('background', 'var(--card-bg)').css('color', 'inherit').css('padding', '0');
                    if (window.Prism) {
                        Prism.highlightAllUnder(document.getElementById('doc-impl-detail'));
                    }
                    
                    $('.copy-code-btn').on('click', function() {
                        const btn = $(this);
                        navigator.clipboard.writeText(rawCode).then(() => {
                            const originalHtml = btn.html();
                            btn.html('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!');
                            btn.css({'background': '#238636', 'color': '#ffffff', 'border-color': '#2ea043'});
                            setTimeout(() => {
                                btn.html(originalHtml);
                                btn.css({'background': 'var(--gh-btn-bg, #21262d)', 'color': 'var(--gh-text-main, #c9d1d9)', 'border-color': 'var(--gh-border, #30363d)'});
                            }, 2000);
                        }).catch(err => {
                            console.error('Failed to copy: ', err);
                        });
                    });
                }
        } // End renderImplCode
        
        $('#section-implementation').show();
        $('.nav-impl-link').show();
        $('.impl-tab-btn').first().trigger('click');

        // Update top nav
        $('#detail-nav-links').show();
        $('#nav-back-btn').css('display', 'flex');

        // Show View
        $('#detail-view').fadeIn(300);
        $('body').addClass('detail-active');
        
        // Re-init icons
        if (window.lucide) {
            lucide.createIcons();
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    // --- Filter functionality ---
    $('.filter-btn').on('click', function() {
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
        applyFilters();
    });

    // --- Search functionality filter ---
    $('#repo-search').on('keyup', function() {
        applyFilters();
    });

    function applyFilters() {
        const query = $('#repo-search').val().toLowerCase();
        const filter = $('.filter-btn.active').attr('data-filter');
        
        let visibleCount = 0;
        $('.repo-card').each(function() {
            const title = $(this).attr('data-title');
            const category = $(this).attr('data-category');
            
            let searchMatch = title.includes(query);
            let filterMatch = false;
            
            if (filter === 'all') {
                filterMatch = true;
            } else if (filter === 'infrastructure' && ['infrastructure', 'system'].includes(category)) {
                filterMatch = true;
            } else if (filter === 'educational' && ['educational'].includes(category)) {
                filterMatch = true;
            } else if (filter === 'ecommerce' && ['ecommerce'].includes(category)) {
                filterMatch = true;
            } else if (filter === 'social' && ['social', 'messaging'].includes(category)) {
                filterMatch = true;
            } else if (filter === category) {
                filterMatch = true;
            }
            
            if (filterMatch && searchMatch) {
                $(this).show();
                visibleCount++;
            } else {
                $(this).hide();
            }
        });
        
        $('#repo-count-badge').text(visibleCount);
        if (visibleCount === 0) {
            $('#no-results-msg').show();
        } else {
            $('#no-results-msg').hide();
        }
    }

    // Smooth scrolling for sticky nav inside Detail View
    $('#detail-nav-links a').on('click', function(e) {
        e.preventDefault();
        const target = $($(this).attr('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80 // offset for sticky header
            }, 500);
        }
    });
});
