
// State
let currentTab = 'search';

// Utils
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Navigation
function switchTab(tab) {
    currentTab = tab;
    document.getElementById('viewSearch').classList.add('hidden');
    document.getElementById('viewTransfers').classList.add('hidden');
    document.getElementById('tabSearch').className = 'tab-inactive py-5 px-2 transition-all';
    document.getElementById('tabTransfers').className = 'tab-inactive py-5 px-2 transition-all';

    if (tab === 'search') {
        document.getElementById('viewSearch').classList.remove('hidden');
        document.getElementById('tabSearch').className = 'tab-active py-5 px-2 transition-all';
    } else {
        document.getElementById('viewTransfers').classList.remove('hidden');
        document.getElementById('tabTransfers').className = 'tab-active py-5 px-2 transition-all';
        fetchStatus(); // Instant update
    }
}

// Search Logic
async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (query.length < 2) return alert("Search term too short");

    const loader = document.getElementById('searchLoader');
    const resultsContainer = document.getElementById('searchResults');
    const tbody = document.getElementById('resultsTableBody');

    // UI Reset
    loader.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    tbody.innerHTML = '';

    try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        loader.classList.add('hidden');
        
        if (data.results.length === 0) {
            alert("No results found.");
            return;
        }

        resultsContainer.classList.remove('hidden');

        data.results.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-700/50 transition-colors";
            tr.innerHTML = `
                <td class="p-4 font-medium text-white truncate max-w-xs" title="${item.name}">${item.name}</td>
                <td class="p-4 text-gray-400">${formatBytes(item.size)}</td>
                <td class="p-4 text-green-400 font-mono">${item.seeders}</td>
                <td class="p-4 text-red-400 font-mono">${item.leechers}</td>
                <td class="p-4 text-center">
                    <button onclick="downloadMagnet('${item.magnet}')" 
                        class="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-blue-600/30">
                        <i class="fa-solid fa-download mr-1"></i> Drive
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (e) {
        console.error(e);
        loader.classList.add('hidden');
        alert("Search failed. See console.");
    }
}

// Download Logic
async function downloadMagnet(magnet) {
    if(!magnet) magnet = document.getElementById('manualMagnet').value.trim();
    if(!magnet) return;

    try {
        const res = await fetch('/api/download', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ magnet: magnet })
        });
        
        if (res.ok) {
            // Auto switch to transfers
            switchTab('transfers');
            document.getElementById('manualMagnet').value = '';
            // Show toast/notification ideally
        } else {
            alert("Download failed to start");
        }
    } catch (e) {
        alert("Connection error");
    }
}

window.addManualMagnet = () => downloadMagnet(null);

// Status Polling
async function fetchStatus() {
    if (currentTab !== 'transfers') return;

    try {
        const res = await fetch('/api/status');
        const torrents = await res.json();
        renderTransfers(torrents);
    } catch (e) {
        console.log("Polling paused");
    }
}

function renderTransfers(torrents) {
    const list = document.getElementById('transferList');
    const stats = document.getElementById('globalStats');
    
    if (torrents.length === 0) {
        list.innerHTML = `
            <div class="py-12 text-center border border-dashed border-gray-800 rounded-xl">
                <p class="text-gray-500">No active transfers.</p>
            </div>
        `;
        stats.innerHTML = '';
        return;
    }

    let totalDL = 0;

    list.innerHTML = torrents.map(t => {
        totalDL += t.download_speed;
        const isDownloading = t.state === 'Downloading';
        const progressColor = isDownloading ? 'bg-blue-500' : 'bg-gray-600';
        
        return `
            <div class="glass rounded-xl p-5 border-l-4 ${isDownloading ? 'border-blue-500' : 'border-gray-600'}">
                <div class="flex justify-between items-start mb-3">
                    <div class="overflow-hidden pr-4">
                        <h4 class="font-bold text-gray-100 truncate text-lg">${t.name}</h4>
                        <div class="flex gap-3 text-xs text-gray-400 mt-1 font-mono uppercase">
                            <span>${t.state}</span>
                            <span class="text-gray-600">|</span>
                            <span>${formatBytes(t.total_size)}</span>
                            <span class="text-gray-600">|</span>
                            <span class="text-green-400">${t.num_seeds} Seeds</span>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <div class="text-2xl font-bold text-white">${t.progress}%</div>
                        <div class="text-xs text-gray-500 font-mono">ETA: ${t.eta}</div>
                    </div>
                </div>
                
                <div class="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-3">
                    <div class="h-full ${progressColor} transition-all duration-500" style="width: ${t.progress}%"></div>
                </div>

                <div class="flex justify-between items-center">
                    <div class="flex gap-4 text-xs font-bold font-mono">
                        <span class="text-blue-400"><i class="fa-solid fa-arrow-down"></i> ${formatBytes(t.download_speed)}/s</span>
                        <span class="text-purple-400"><i class="fa-solid fa-arrow-up"></i> ${formatBytes(t.upload_speed)}/s</span>
                    </div>
                    <button onclick="deleteTorrent('${t.id}')" class="text-red-500 hover:text-red-400 text-xs uppercase font-bold tracking-widest hover:underline">
                        Cancel
                    </button>
                </div>
            </div>
        `;
    }).join('');

    stats.innerHTML = `<span class="text-blue-500 font-mono font-bold text-sm"><i class="fa-solid fa-bolt"></i> ${formatBytes(totalDL)}/s</span>`;
}

window.deleteTorrent = async (id) => {
    if(!confirm("Remove this download?")) return;
    await fetch(`/api/torrent/${id}`, { method: 'DELETE' });
    fetchStatus();
}

// Start polling
setInterval(fetchStatus, 1500);
