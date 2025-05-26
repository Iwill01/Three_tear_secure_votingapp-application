// Configuration
        const API_BASE_URL = 'http://localhost:5000/api';
        
        // DOM Elements
        const views = {
            login: document.getElementById('login-view'),
            voting: document.getElementById('voting-view'),
            admin: document.getElementById('admin-view'),
            results: document.getElementById('results-view')
        };
        
        const tabs = {
            voter: document.getElementById('voter-tab'),
            admin: document.getElementById('admin-tab')
        };
        
        const forms = {
            voter: document.getElementById('voter-login-form'),
            admin: document.getElementById('admin-login-form')
        };
        
        // Timer
        let timerInterval;
        let timeRemaining = 10;
        
        // View Management
        function showView(view) {
            Object.values(views).forEach(v => v.style.display = 'none');
            view.style.display = 'block';
        }
        
        // Tab Switching
        tabs.voter.addEventListener('click', () => {
            tabs.voter.classList.add('active');
            tabs.admin.classList.remove('active');
            forms.voter.style.display = 'block';
            forms.admin.style.display = 'none';
        });
        
        tabs.admin.addEventListener('click', () => {
            tabs.admin.classList.add('active');
            tabs.voter.classList.remove('active');
            forms.admin.style.display = 'block';
            forms.voter.style.display = 'none';
        });

        const timeoutMessage = document.createElement('div');
        timeoutMessage.id = 'timeout-message';
        timeoutMessage.style.display = 'none';
        timeoutMessage.style.color = 'var(--danger)';
        timeoutMessage.style.textAlign = 'center';
        timeoutMessage.style.margin = '1rem 0';
        timeoutMessage.style.fontWeight = 'bold';
        document.getElementById('voting-view').appendChild(timeoutMessage);
        // Stats Updater
        async function updateStats() {
            try {
                const response = await fetch(`${API_BASE_URL}/stats`);
                const data = await response.json();
                
                // Update voter stats
                document.getElementById('votes-cast').textContent = data.votes_cast;
                document.getElementById('total-voters').textContent = data.total_voters;
                document.getElementById('participation-rate').textContent = `${data.participation}%`;
                document.getElementById('total-votes-cast').textContent = data.votes_cast;
                document.getElementById('final-participation').textContent = `${data.participation}%`;
                
                // Update admin stats
                document.getElementById('party-a-votes').textContent = data.party_a;
                document.getElementById('party-b-votes').textContent = data.party_b;
                
                const totalVotes = data.party_a + data.party_b;
                const partyAPercent = totalVotes > 0 ? Math.round((data.party_a / totalVotes) * 100) : 0;
                const partyBPercent = totalVotes > 0 ? Math.round((data.party_b / totalVotes) * 100) : 0;
                
                document.getElementById('party-a-progress').style.width = `${partyAPercent}%`;
                document.getElementById('party-b-progress').style.width = `${partyBPercent}%`;
                document.getElementById('party-a-percentage').textContent = `${partyAPercent}%`;
                document.getElementById('party-b-percentage').textContent = `${partyBPercent}%`;
                
                // Update winner display
                if (data.party_a > data.party_b) {
                    document.getElementById('winner-name').textContent = 'Party A';
                    document.getElementById('winner-votes').textContent = `${data.party_a} votes (${partyAPercent}%)`;
                } else if (data.party_b > data.party_a) {
                    document.getElementById('winner-name').textContent = 'Party B';
                    document.getElementById('winner-votes').textContent = `${data.party_b} votes (${partyBPercent}%)`;
                } else {
                    document.getElementById('winner-name').textContent = 'Tie';
                    document.getElementById('winner-votes').textContent = `${data.party_a} votes each`;
                }
            } catch (error) {
                console.error('Error updating stats:', error);
            }
        }
        
        // Timer Functions
        function startTimer() {
            clearInterval(timerInterval);
            timeRemaining = 10;
            document.getElementById('voting-timer').textContent = timeRemaining;
            document.getElementById('voting-timer').style.color = '#f59e0b';
            timeoutMessage.style.display = 'none';

            timerInterval = setInterval(() => {
                timeRemaining--;
                document.getElementById('voting-timer').textContent = timeRemaining;
                
                if (timeRemaining <= 3) {
                    document.getElementById('voting-timer').style.color = '#ef4444';
                }
                
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    timeoutMessage.textContent = 'Your time has expired! Please login again.';
                    timeoutMessage.style.display = 'block';
                    
                    // Automatically return to login after 3 seconds
                    setTimeout(() => {
                        showView(views.login);
                        timeoutMessage.style.display = 'none';
                    }, 3000);
                }
            }, 1000);
        }
        
        // Voting Functions
        async function submitVote(party) {
            const voterId = document.getElementById('voter-id').value;
            
            try {
                const response = await fetch(`${API_BASE_URL}/vote`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        voter_id: voterId,
                        party: party
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    await updateStats();
                    showView(views.results);
                } else {
                    alert(result.message || 'Voting failed');
                    showView(views.login);
                }
            } catch (error) {
                console.error('Voting error:', error);
                alert('Failed to submit vote');
                showView(views.login);
            }
        }
        
        // Event Listeners
        document.getElementById('voter-login-btn').addEventListener('click', async () => {
            const voterId = document.getElementById('voter-id').value;
            
            if (!voterId) {
                alert('Please enter your Voter ID');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/validate-voter`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ voter_id: voterId })
                });
                
                const data = await response.json();
                
                if (!data.valid) {
                    alert(data.message || 'Invalid Voter ID');
                    return;
                }
                
                if (data.used) {
                    alert('This Voter ID has already been used');
                    return;
                }
                
                showView(views.voting);
                startTimer();
            } catch (error) {
                console.error('Validation error:', error);
                alert('Error validating voter');
            }
        });
        
        document.getElementById('admin-login-btn').addEventListener('click', async () => {
            const adminCode = document.getElementById('admin-code').value;
            
            try {
                const response = await fetch(`${API_BASE_URL}/admin/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code: adminCode })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    document.body.classList.add('admin-view');
                    document.body.classList.remove('voter-view');
                    showView(views.admin);
                    updateStats();
                } else {
                    alert(data.message || 'Invalid admin code');
                }
            } catch (error) {
                console.error('Admin login error:', error);
                alert('Error during admin login');
            }
        });
        
        document.getElementById('party-a-option').addEventListener('click', () => submitVote('A'));
        document.getElementById('party-b-option').addEventListener('click', () => submitVote('B'));
        document.getElementById('cancel-vote-btn').addEventListener('click', () => {
            clearInterval(timerInterval);
            timeoutMessage.style.display = 'none';
            showView(views.login);
        });
        document.getElementById('show-result-btn').addEventListener('click', () => {
            document.getElementById('winner-display').style.display = 'block';
        });
        document.getElementById('admin-logout-btn').addEventListener('click', () => {
            document.body.classList.add('voter-view');
            document.body.classList.remove('admin-view');
            showView(views.login);
        });
        document.getElementById('back-to-login-btn').addEventListener('click', () => {
            showView(views.login);
        });
        // Add candidate button and create election button and event listeners
        document.getElementById('add-candidate-btn').addEventListener('click', () => {
            const container = document.getElementById('candidates-container');
            const newEntry = document.createElement('div');
            newEntry.className = 'candidate-entry';
            newEntry.style.marginBottom = '1rem';
            newEntry.innerHTML = `
                <input type="text" class="candidate-name" placeholder="Candidate Name" style="width: 48%; margin-right: 2%;">
                <input type="text" class="party-name" placeholder="Party Name" style="width: 48%; margin-left: 2%;">
            `;
            container.appendChild(newEntry);
        });

        document.getElementById('create-election-btn').addEventListener('click', async () => {
            const title = document.getElementById('election-title').value;
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            const adminCode = document.getElementById('admin-code-election').value;
            
            if (!title || !startDate || !endDate || !adminCode) {
                alert('Please fill all required fields');
                return;
            }
            
            // Collect candidates
            const candidates = [];
            const candidateEntries = document.querySelectorAll('.candidate-entry');
            candidateEntries.forEach(entry => {
                const name = entry.querySelector('.candidate-name').value;
                const party = entry.querySelector('.party-name').value;
                if (name && party) {
                    candidates.push({ name, party });
                }
            });
            
            if (candidates.length < 2) {
                alert('Please add at least 2 candidates');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/elections/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title,
                        start_date: startDate,
                        end_date: endDate,
                        admin_code: adminCode,
                        candidates
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Election created successfully');
                    loadCurrentElection();
                } else {
                    alert(data.message || 'Failed to create election');
                }
            } catch (error) {
                console.error('Error creating election:', error);
                alert('Failed to create election');
            }
        });

        document.getElementById('end-election-btn').addEventListener('click', async () => {
            const adminCode = prompt('Enter admin code to end election:');
            if (!adminCode) return;
            
            try {
                const response = await fetch(`${API_BASE_URL}/elections/end`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ admin_code: adminCode })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Election ended successfully');
                    loadCurrentElection();
                } else {
                    alert(data.message || 'Failed to end election');
                }
            } catch (error) {
                console.error('Error ending election:', error);
                alert('Failed to end election');
            }
        });

        async function loadCurrentElection() {
            try {
                const response = await fetch(`${API_BASE_URL}/elections/current`);
                const data = await response.json();
                
                if (data.success) {
                    const election = data.election;
                    const electionDetails = document.getElementById('election-details');
                    
                    if (election) {
                        document.getElementById('create-election-form').style.display = 'none';
                        document.getElementById('current-election-info').style.display = 'block';
                        
                        electionDetails.innerHTML = `
                            <p><strong>Title:</strong> ${election.title}</p>
                            <p><strong>Start Date:</strong> ${new Date(election.start_date).toLocaleString()}</p>
                            <p><strong>End Date:</strong> ${new Date(election.end_date).toLocaleString()}</p>
                            <p><strong>Candidates:</strong></p>
                            <ul>
                                ${election.candidates.map(c => `<li>${c.name} (${c.party})</li>`).join('')}
                            </ul>
                        `;
                    } else {
                        document.getElementById('create-election-form').style.display = 'block';
                        document.getElementById('current-election-info').style.display = 'none';
                    }
                }
            } catch (error) {
                console.error('Error loading current election:', error);
            }
        }

        // Call this when admin logs in
        document.getElementById('admin-login-btn').addEventListener('click', async () => {
            // ... existing code ...
            if (data.success) {
                document.body.classList.add('admin-view');
                document.body.classList.remove('voter-view');
                showView(views.admin);
                updateStats();
                loadCurrentElection(); // Add this line
            }
        });
        
        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            updateStats();
            setInterval(updateStats, 3000); // Update stats every 3 seconds
        });