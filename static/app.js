document.addEventListener('DOMContentLoaded', () => {
    // State management
    let releaseUpdates = [];
    let currentFilter = 'all';
    let searchQuery = '';

    // DOM Elements
    const btnRefresh = document.getElementById('btn-refresh');
    const refreshIcon = btnRefresh.querySelector('.icon-sync');
    const btnExport = document.getElementById('btn-export');
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    const iconSun = btnThemeToggle.querySelector('.icon-sun');
    const iconMoon = btnThemeToggle.querySelector('.icon-moon');
    const searchInput = document.getElementById('search-input');
    const filterTagsContainer = document.getElementById('filter-tags');
    const notesContainer = document.getElementById('notes-container');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    const btnRetry = document.getElementById('btn-retry');
    const emptyState = document.getElementById('empty-state');
    
    // Stats elements
    const statsOverview = document.getElementById('stats-overview');
    const statTotal = document.getElementById('stat-total');
    const statFeatures = document.getElementById('stat-features');
    const statAnnouncements = document.getElementById('stat-announcements');
    const statIssues = document.getElementById('stat-issues');

    // Modal elements
    const tweetModal = document.getElementById('tweet-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelTweet = document.getElementById('btn-cancel-tweet');
    const btnPostTweet = document.getElementById('btn-post-tweet');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCount = document.getElementById('char-count');
    const charCounterContainer = document.getElementById('char-counter');
    const lengthWarning = document.getElementById('length-warning');
    const modalBadge = document.getElementById('modal-badge');
    const modalDate = document.getElementById('modal-date');
    const modalSourceText = document.getElementById('modal-source-text');

    // Fetch releases from backend
    async function fetchReleases() {
        showState('loading');
        btnRefresh.disabled = true;
        refreshIcon.classList.add('spinning');

        try {
            const response = await fetch('/api/releases');
            const data = await response.json();

            if (data.status === 'success') {
                releaseUpdates = data.updates;
                updateStats();
                filterAndRender();
                showState('content');
            } else {
                throw new Error(data.message || 'Failed to fetch release notes.');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            errorMessage.textContent = error.message || 'An error occurred while connecting to the server.';
            showState('error');
        } finally {
            btnRefresh.disabled = false;
            // Delay removing spin class slightly for smooth animation
            setTimeout(() => {
                refreshIcon.classList.remove('spinning');
            }, 500);
        }
    }

    // Helper to toggle views
    function showState(state) {
        loadingState.style.display = state === 'loading' ? 'flex' : 'none';
        errorState.style.display = state === 'error' ? 'flex' : 'none';
        emptyState.style.display = state === 'empty' ? 'flex' : 'none';
        notesContainer.style.display = state === 'content' ? 'grid' : 'none';
        
        if (state === 'content' && releaseUpdates.length > 0) {
            statsOverview.style.display = 'grid';
        } else if (state === 'loading' || state === 'error') {
            statsOverview.style.display = 'none';
        }
    }

    // Update stats cards
    function updateStats() {
        statTotal.textContent = releaseUpdates.length;
        
        const features = releaseUpdates.filter(u => u.type.toLowerCase() === 'feature').length;
        const announcements = releaseUpdates.filter(u => u.type.toLowerCase() === 'announcement').length;
        const issuesAndFixes = releaseUpdates.filter(u => {
            const type = u.type.toLowerCase();
            return type === 'issue' || type === 'deprecated' || type === 'fixed';
        }).length;

        statFeatures.textContent = features;
        statAnnouncements.textContent = announcements;
        statIssues.textContent = issuesAndFixes;
    }

    // Render release cards to DOM
    function renderNotes(notes) {
        notesContainer.innerHTML = '';
        
        if (notes.length === 0) {
            showState('empty');
            return;
        }

        notes.forEach(note => {
            const card = document.createElement('article');
            card.className = 'note-card';
            card.id = note.id;
            
            // Map type badge class
            let badgeClass = 'badge-default';
            const typeLower = note.type.toLowerCase();
            if (typeLower === 'feature') badgeClass = 'badge-feature';
            else if (typeLower === 'announcement') badgeClass = 'badge-announcement';
            else if (typeLower === 'issue') badgeClass = 'badge-issue';
            else if (typeLower === 'deprecated') badgeClass = 'badge-deprecated';
            else if (typeLower === 'fixed') badgeClass = 'badge-fixed';

            // HTML content construction
            card.innerHTML = `
                <div class="note-card-header">
                    <div class="note-meta">
                        <span class="badge ${badgeClass}">${note.type}</span>
                        <span class="note-date">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${note.date}
                        </span>
                    </div>
                    ${note.link ? `
                        <a href="${note.link}" target="_blank" rel="noopener noreferrer" class="note-link-external" title="View official release notes">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    ` : ''}
                </div>
                <div class="note-card-body">
                    ${note.content}
                </div>
                <div class="note-card-footer">
                    <button class="btn btn-secondary btn-copy-trigger" data-id="${note.id}" title="Copy to clipboard">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span>Copy</span>
                    </button>
                    <button class="btn btn-secondary btn-tweet-trigger" data-id="${note.id}">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px;">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span>Tweet Update</span>
                    </button>
                </div>
            `;
            notesContainer.appendChild(card);
        });

        // Add event listeners to Tweet buttons
        document.querySelectorAll('.btn-tweet-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const noteId = e.currentTarget.getAttribute('data-id');
                const selectedNote = releaseUpdates.find(u => u.id === noteId);
                if (selectedNote) {
                    openTweetModal(selectedNote);
                }
            });
        });

        // Add event listeners to Copy buttons
        document.querySelectorAll('.btn-copy-trigger').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const triggerBtn = e.currentTarget;
                const noteId = triggerBtn.getAttribute('data-id');
                const selectedNote = releaseUpdates.find(u => u.id === noteId);
                if (selectedNote) {
                    const textToCopy = `BigQuery Update [${selectedNote.date}] - ${selectedNote.type}:\n\n${selectedNote.text_content}\n\nRead more: ${selectedNote.link}`;
                    try {
                        await navigator.clipboard.writeText(textToCopy);
                        // Visual feedback
                        const btnText = triggerBtn.querySelector('span');
                        const originalText = btnText.textContent;
                        btnText.textContent = 'Copied!';
                        triggerBtn.style.borderColor = 'var(--color-feature)';
                        
                        setTimeout(() => {
                            btnText.textContent = originalText;
                            triggerBtn.style.borderColor = '';
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy to clipboard: ', err);
                    }
                }
            });
        });
    }

    // Filter and Search mechanism
    function filterAndRender() {
        let filtered = releaseUpdates;

        // Apply Tag Filter
        if (currentFilter !== 'all') {
            filtered = filtered.filter(u => u.type.toLowerCase() === currentFilter.toLowerCase());
        }

        // Apply Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(u => 
                u.content.toLowerCase().includes(query) || 
                u.type.toLowerCase().includes(query) ||
                u.date.toLowerCase().includes(query)
            );
        }

        renderNotes(filtered);
        
        if (filtered.length === 0 && releaseUpdates.length > 0) {
            showState('empty');
        } else if (releaseUpdates.length > 0) {
            showState('content');
        }
    }

    // Tweet Modal Handlers
    function openTweetModal(note) {
        // Set up preview
        modalBadge.className = `preview-badge badge-${note.type.toLowerCase()}`;
        modalBadge.textContent = note.type;
        modalDate.textContent = note.date;
        modalSourceText.textContent = note.text_content;

        // Pre-compose the draft tweet nicely within limits:
        // "BigQuery Update [Feature]: <Truncated Title> <Link>"
        const typeStr = note.type ? `[${note.type}] ` : '';
        const dateStr = note.date ? `(${note.date}): ` : '';
        const baseIntro = `BigQuery ${typeStr}${dateStr}`;
        const link = note.link ? ` ${note.link}` : '';
        
        // 280 - baseIntro.length - link.length - ellipsis (3) - padding
        const maxTextLen = 280 - baseIntro.length - link.length - 6;
        let tweetContent = note.text_content;
        
        if (tweetContent.length > maxTextLen) {
            tweetContent = tweetContent.substring(0, maxTextLen) + '...';
        }

        tweetTextarea.value = `${baseIntro}"${tweetContent}"${link}`;
        updateCharCount();

        // Display modal
        tweetModal.style.display = 'flex';
        // Allow rendering flow then transition opacity
        setTimeout(() => {
            tweetModal.classList.add('active');
        }, 10);
    }

    function closeTweetModal() {
        tweetModal.classList.remove('active');
        setTimeout(() => {
            tweetModal.style.display = 'none';
        }, 300);
    }

    function updateCharCount() {
        const textLength = tweetTextarea.value.length;
        charCount.textContent = textLength;

        // Visual warnings based on character length
        if (textLength > 280) {
            charCounterContainer.className = 'char-counter error';
            lengthWarning.style.display = 'flex';
            btnPostTweet.disabled = true;
        } else if (textLength > 250) {
            charCounterContainer.className = 'char-counter warning';
            lengthWarning.style.display = 'none';
            btnPostTweet.disabled = false;
        } else {
            charCounterContainer.className = 'char-counter';
            lengthWarning.style.display = 'none';
            btnPostTweet.disabled = false;
        }
    }

    // Launch Twitter Web Intent
    function launchTweet() {
        const text = tweetTextarea.value;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank', 'noopener,noreferrer');
        closeTweetModal();
    }

    // Export to CSV helper
    function exportToCSV(notes) {
        const headers = ['Date', 'Category', 'Update Link', 'Content Summary'];
        const csvRows = [headers.join(',')];
        
        notes.forEach(note => {
            const cleanContent = note.text_content.replace(/"/g, '""');
            const row = [
                `"${note.date.replace(/"/g, '""')}"`,
                `"${note.type.replace(/"/g, '""')}"`,
                `"${(note.link || '').replace(/"/g, '""')}"`,
                `"${cleanContent}"`
            ];
            csvRows.push(row.join(','));
        });
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        
        const timestamp = new Date().toISOString().slice(0, 10);
        link.setAttribute("download", `BigQuery_Releases_${currentFilter}_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    // Event Listeners
    btnRefresh.addEventListener('click', fetchReleases);
    btnRetry.addEventListener('click', fetchReleases);
    
    // Export CSV listener
    btnExport.addEventListener('click', () => {
        let filtered = releaseUpdates;
        if (currentFilter !== 'all') {
            filtered = filtered.filter(u => u.type.toLowerCase() === currentFilter.toLowerCase());
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(u => 
                u.content.toLowerCase().includes(query) || 
                u.type.toLowerCase().includes(query) ||
                u.date.toLowerCase().includes(query)
            );
        }
        
        if (filtered.length === 0) {
            alert("No release notes available to export.");
            return;
        }
        
        exportToCSV(filtered);
    });
    
    // Search filter input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        filterAndRender();
    });

    // Tag filter click
    filterTagsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-tag')) {
            // Update active state
            document.querySelectorAll('.filter-tag').forEach(tag => tag.classList.remove('active'));
            e.target.classList.add('active');

            // Apply filter
            currentFilter = e.target.getAttribute('data-type');
            filterAndRender();
        }
    });

    // Theme Toggle functions
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            iconSun.style.display = 'none';
            iconMoon.style.display = 'block';
        } else {
            document.body.classList.remove('light-theme');
            iconSun.style.display = 'block';
            iconMoon.style.display = 'none';
        }
    }

    function toggleTheme() {
        if (document.body.classList.contains('light-theme')) {
            document.body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
            iconSun.style.display = 'block';
            iconMoon.style.display = 'none';
        } else {
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            iconSun.style.display = 'none';
            iconMoon.style.display = 'block';
        }
    }

    // Modal listeners
    btnCloseModal.addEventListener('click', closeTweetModal);
    btnCancelTweet.addEventListener('click', closeTweetModal);
    tweetTextarea.addEventListener('input', updateCharCount);
    btnPostTweet.addEventListener('click', launchTweet);

    // Close modal if user clicks outside of modal card
    tweetModal.addEventListener('click', (e) => {
        if (e.target === tweetModal) {
            closeTweetModal();
        }
    });

    // Theme listener
    btnThemeToggle.addEventListener('click', toggleTheme);

    // Initialize state on load
    initializeTheme();
    fetchReleases();
});
