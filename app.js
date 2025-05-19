        // DOM Elements
        const themeToggle = document.querySelector('.theme-toggle');
        const textContent = document.getElementById('textContent');
        const filenameInput = document.getElementById('filename');
        const downloadBtn = document.getElementById('downloadBtn');
        const clearBtn = document.getElementById('clearBtn');
        const pasteBtn = document.getElementById('pasteBtn');
        const statusMessage = document.getElementById('statusMessage');
        const wordCount = document.getElementById('wordCount');

        // Initialize with system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.setAttribute('data-theme', 'dark');
            updateThemeIcon();
        }

        // Theme Toggle
        themeToggle.addEventListener('click', () => {
            document.body.setAttribute('data-theme', 
                document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
            updateThemeIcon();
            showStatus('Theme changed', 'success');
        });

        function updateThemeIcon() {
            const icon = themeToggle.querySelector('i');
            if (document.body.getAttribute('data-theme') === 'dark') {
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
            }
        }

        // Load saved content from local storage
        const loadSavedContent = () => {
            const savedText = localStorage.getItem('textContent');
            const savedFilename = localStorage.getItem('filename');

            if (savedText) {
                textContent.value = savedText;
                updateWordCount();
            }

            if (savedFilename) {
                filenameInput.value = savedFilename;
            }

            showStatus('Auto-saved content loaded', 'success');
        };

        // Save content to local storage with debounce
        const debounce = (func, delay) => {
            let timeoutId;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(context, args), delay);
            };
        };

        const saveToLocalStorage = () => {
            localStorage.setItem('textContent', textContent.value);
            localStorage.setItem('filename', filenameInput.value);
            updateWordCount();
            showStatus('Auto-saved to browser', 'success');
        };

        // Update word count
        const updateWordCount = () => {
            const text = textContent.value.trim();
            const count = text ? text.split(/\s+/).length : 0;
            wordCount.textContent = `${count} ${count === 1 ? 'word' : 'words'}`;
        };

        // Show status message
        const showStatus = (message, type = 'normal') => {
            statusMessage.textContent = message;
            statusMessage.className = 'status-message animate-fade';

            // Add type class if specified
            if (type !== 'normal') {
                statusMessage.classList.add(`status-${type}`);
            }

            setTimeout(() => {
                if (statusMessage.textContent === message) {
                    statusMessage.textContent = 'Ready';
                    statusMessage.className = 'status-message';
                }
            }, 3000);
        };

        // Download text as file
        const downloadTextFile = () => {
            const text = textContent.value.trim();
            if (!text) {
                showStatus('Please enter some text to download', 'error');
                return;
            }

            const filename = filenameInput.value.trim() || 'document';
            const fullFilename = filename.endsWith('.txt') ? filename : `${filename}.txt`;

            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fullFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Clear local storage after download if confirmed
            if (confirm('Clear editor after download?')) {
                textContent.value = '';
                filenameInput.value = '';
                localStorage.removeItem('textContent');
                localStorage.removeItem('filename');
                updateWordCount();
                showStatus('File downloaded and editor cleared', 'success');
            } else {
                showStatus('File downloaded', 'success');
            }
        };

        // Clear all content
        const clearAllContent = () => {
            if (textContent.value || filenameInput.value) {
                if (confirm('Are you sure you want to clear all content?')) {
                    textContent.value = '';
                    filenameInput.value = '';
                    localStorage.removeItem('textContent');
                    localStorage.removeItem('filename');
                    updateWordCount();
                    showStatus('All content cleared', 'success');
                }
            } else {
                showStatus('Nothing to clear', 'warning');
            }
        };

        // Paste from clipboard
        const pasteFromClipboard = async () => {
            try {
                const clipboardText = await navigator.clipboard.readText();
                if (clipboardText) {
                    textContent.value += clipboardText;
                    saveToLocalStorage();
                    showStatus('Content pasted from clipboard', 'success');
                } else {
                    showStatus('Clipboard is empty', 'warning');
                }
            } catch (err) {
                showStatus('Failed to access clipboard', 'error');
                console.error('Clipboard access error:', err);
            }
        };

        // Event listeners
        textContent.addEventListener('input', debounce(saveToLocalStorage, 500));
        filenameInput.addEventListener('input', debounce(saveToLocalStorage, 500));
        downloadBtn.addEventListener('click', downloadTextFile);
        clearBtn.addEventListener('click', clearAllContent);
        pasteBtn.addEventListener('click', pasteFromClipboard);

        // Initialize
        loadSavedContent();

        // Add animation when elements are clicked
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
            });
        });