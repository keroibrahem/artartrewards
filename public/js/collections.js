// =================== Configuration ===================
// إذا بتشغل الملفات خارج لارفيل (مثلاً serve static files) حط هنا عنوان الـ API:
// <script>window.API_BASE = "http://127.0.0.1:8000/api"</script> قبل تحميل هذا الملف.
const API_BASE = (window.API_BASE && window.API_BASE.replace(/\/+$/, '')) || (location.origin + '/api');

// =================== State ===================
const state = {
    searchTerm: "",
    sortOption: "newest",
    currentPage: 1,
    totalPages: 1,
    selectedCollectionId: null,
    selectedArtworks: new Set()
};

// =================== Helpers ===================
function debugLog(...args) { console.debug('[app]', ...args); }

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return console.log(message);
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Fetch wrapper that checks content-type and returns parsed JSON or throws informative error
async function fetchJson(pathOrUrl, options = {}) {
    const url = /^(https?:)?\/\//.test(pathOrUrl) ? pathOrUrl : API_BASE + (pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl);

    debugLog('fetch', options.method || 'GET', url);
    const res = await fetch(url, options);

    const text = await res.text(); // get raw text for diagnosis
    const contentType = res.headers.get('content-type') || '';

    if (!res.ok) {
        // print HTML or JSON body for debugging
        console.error('Fetch error', res.status, res.statusText, url, text);
        // If HTML returned (starts with <), include a short snippet in the toast
        const snippet = text.trim().slice(0, 400).replace(/\s+/g, ' ');
        showToast(`Request failed: ${res.status} ${res.statusText}`, 'danger');
        throw new Error(`Request failed: ${res.status} ${res.statusText}\nResponse: ${snippet}`);
    }

    if (contentType.includes('application/json') || contentType.includes('text/json')) {
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Invalid JSON response', url, text);
            throw e;
        }
    } else {
        // Server returned HTML (likely a 404 page or error view) — helpful for debugging
        console.error('Expected JSON but got:', contentType || 'no content-type', url);
        console.error('Response body (first 1000 chars):', text.slice(0, 1000));
        throw new Error('Expected JSON response but got HTML. Check URL and server. See console for response body.');
    }
}

// Utility to safely unwrap your controller structure:
// controllers returned: { success: true, data: { collections: [...], pagination: {...} } }
function unwrapCollectionsResponse(json) {
    if (!json) return { items: [], pagination: null };
    if (json.success && json.data) {
        const d = json.data;
        return {
            items: Array.isArray(d.collections) ? d.collections : (Array.isArray(d) ? d : []),
            pagination: d.pagination || null
        };
    }
    // fallback: if json is array
    if (Array.isArray(json)) return { items: json, pagination: null };
    // unknown
    return { items: [], pagination: null };
}

// =================== DOM elements (cached) ===================
const elems = {
    gridView: document.getElementById('gridView'),
    detailView: document.getElementById('detailView'),
    collectionsGrid: document.getElementById('collectionsGrid'),
    pagination: document.getElementById('pagination'),
    emptyState: document.getElementById('emptyState'),
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    collectionFormModalEl: document.getElementById('collectionFormModal'),
    collectionForm: document.getElementById('collectionForm'),
    collectionIdInput: document.getElementById('collectionId'),
    titleInput: document.getElementById('titleInput'),
    descriptionInput: document.getElementById('descriptionInput'),
    coverUpload: document.getElementById('coverUpload'),
    coverPreview: document.getElementById('coverPreview'),
    submitFormBtn: document.getElementById('submitFormBtn'),
    emptyCreateBtn: document.getElementById('emptyCreateBtn'),
    createBtn: document.getElementById('createBtn'),
    deleteModalEl: document.getElementById('deleteModal'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    artworkSelectionModalEl: document.getElementById('artworkSelectionModal'),
    artworksGrid: document.getElementById('artworksGrid'),
    addArtworksBtn: document.getElementById('addArtworksBtn'),
    artworksPagination: document.getElementById('artworksPagination'),
    artworkDeleteModalEl: document.getElementById('artworkDeleteModal'),
    confirmArtworkDeleteBtn: document.getElementById('confirmArtworkDeleteBtn'),
    toastContainer: document.getElementById('toastContainer')
};

// bootstrap modal instances
const collectionFormModal = elems.collectionFormModalEl ? new bootstrap.Modal(elems.collectionFormModalEl) : null;
const deleteModal = elems.deleteModalEl ? new bootstrap.Modal(elems.deleteModalEl) : null;
const artworkSelectionModal = elems.artworkSelectionModalEl ? new bootstrap.Modal(elems.artworkSelectionModalEl) : null;
const artworkDeleteModal = elems.artworkDeleteModalEl ? new bootstrap.Modal(elems.artworkDeleteModalEl) : null;

// =================== Render / UI ===================

function renderCollectionsGrid(items, pagination) {
    elems.collectionsGrid.innerHTML = items.map(c => {
        const cover = c.cover_image ? `/storage/${c.cover_image}` : '/images/default-cover.jpg';
        const artworksCount = c.artworks_count ?? (c.artworks ? c.artworks.length : 0);
        return `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm">
                <img src="${cover}" class="card-img-top" style="height:200px;object-fit:cover;cursor:pointer" onclick="viewCollection(${c.id})">
                <div class="card-body d-flex flex-column">
                    <h5 style="cursor:pointer" onclick="viewCollection(${c.id})">${escapeHtml(c.title)}</h5>
                    <p class="text-muted flex-grow-1">${escapeHtml(truncate(c.description || '', 120))}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">${artworksCount} artworks</small>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditForm(event, ${c.id})">Edit</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal(event, ${c.id})">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // pagination render
    if (pagination && pagination.last_page) {
        elems.pagination.innerHTML = renderPaginationHtml(pagination.current_page, pagination.last_page);
    } else {
        elems.pagination.innerHTML = '';
    }
}

function renderPaginationHtml(current, last) {
    let html = `<ul class="pagination">`;
    for (let i = 1; i <= last; i++) {
        html += `<li class="page-item ${i === current ? 'active' : ''}">
            <button class="page-link" onclick="changePage(${i})">${i}</button>
        </li>`;
    }
    html += `</ul>`;
    return html;
}

function truncate(str, n) {
    return str.length > n ? str.slice(0, n-1) + '…' : str;
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[&<>"'`=\/]/g, function (s) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        }[s];
    });
}

// =================== Main actions (Collections) ===================
async function loadCollections() {
    try {
        const path = `/collections?page=${state.currentPage}&search=${encodeURIComponent(state.searchTerm)}&sort=${encodeURIComponent(state.sortOption)}`;
        const json = await fetchJson(path);
        const { items, pagination } = unwrapCollectionsResponse(json);
        if (!items || items.length === 0) {
            elems.emptyState.classList.remove('d-none');
            elems.collectionsGrid.innerHTML = '';
            elems.pagination.innerHTML = '';
            return;
        }
        elems.emptyState.classList.add('d-none');
        renderCollectionsGrid(items, pagination ?? json.data?.pagination ?? null);
    } catch (err) {
        console.error('loadCollections error:', err);
        showToast(String(err.message || 'Failed to load collections'), 'danger');
    }
}

window.changePage = function(page) {
    state.currentPage = page;
    loadCollections();
};

// View collection detail (show)
window.viewCollection = async function(id) {
    try {
        const json = await fetchJson(`/collections/${id}`);
        const collection = (json.success && json.data) ? json.data : json;
        state.selectedCollectionId = collection.id;

        // render detail view
        const cover = collection.cover_image ? `/storage/${collection.cover_image}` : '/images/default-cover.jpg';
        const artworksHtml = (collection.artworks || []).map(a => `
            <div class="col-md-4">
                <div class="card h-100">
                    <img src="/storage/${a.image}" class="card-img-top" style="height:180px;object-fit:cover">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h6>${escapeHtml(a.title)}</h6>
                            <small class="text-muted">${escapeHtml(a.artist_name || '')}</small>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-danger" onclick="openArtworkDeleteModal(event, ${collection.id}, ${a.id})">Remove</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('') || `<p class="text-muted">No artworks in this collection.</p>`;

        elems.gridView.classList.add('d-none');
        elems.detailView.classList.remove('d-none');
        elems.detailView.innerHTML = `
            <div class="mb-3 d-flex justify-content-between align-items-center">
                <h2>${escapeHtml(collection.title)}</h2>
                <div>
                    <button class="btn btn-outline-secondary me-2" onclick="backToGrid()">Back</button>
                    <button class="btn btn-dark" onclick="openArtworkSelection(${collection.id})">Add Artworks</button>
                </div>
            </div>
            <div class="card mb-4">
                <img src="${cover}" class="card-img-top" style="height:300px;object-fit:cover">
                <div class="card-body">
                    <p>${escapeHtml(collection.description || '')}</p>
                    <small class="text-muted">Artist: ${escapeHtml(collection.artist?.name || '')}</small>
                </div>
            </div>
            <h5>Artworks</h5>
            <div class="row g-3">${artworksHtml}</div>
        `;
    } catch (err) {
        console.error('viewCollection error', err);
        showToast('Failed to load collection', 'danger');
    }
};

function backToGrid() {
    elems.detailView.classList.add('d-none');
    elems.gridView.classList.remove('d-none');
    loadCollections();
}

// =================== Create / Update Collection ===================
function openCreateForm() {
    if (!elems.collectionForm) return;
    elems.collectionForm.reset();
    elems.collectionIdInput.value = '';
    elems.formTitle && (elems.formTitle.textContent = 'Create New Collection');
    elems.submitFormBtn.textContent = 'Create Collection';
    elems.submitFormBtn.onclick = submitCreateCollection;
    collectionFormModal && collectionFormModal.show();
}

window.openEditForm = function(ev, id) {
    ev.stopPropagation?.();
    // fetch the collection and fill the form
    fetchJson(`/collections/${id}`)
        .then(json => {
            const c = json.success && json.data ? json.data : json;
            elems.collectionIdInput.value = c.id || '';
            elems.titleInput.value = c.title || '';
            elems.descriptionInput.value = c.description || '';
            elems.formTitle && (elems.formTitle.textContent = 'Edit Collection');
            elems.submitFormBtn.textContent = 'Update Collection';
            elems.submitFormBtn.onclick = () => submitUpdateCollection(c.id);
            collectionFormModal && collectionFormModal.show();
        })
        .catch(err => {
            console.error(err);
            showToast('Cannot load collection for edit', 'danger');
        });
};

async function submitCreateCollection() {
    try {
        const form = elems.collectionForm;
        const fd = new FormData(form);
        // ensure artist_id exists — if your form doesn't include an artist selector, use 1 as default or change server/controller
        if (!fd.get('artist_id')) fd.append('artist_id', 1);

        const json = await fetchJson('/collections', { method: 'POST', body: fd });
        showToast(json.message || 'Collection created');
        collectionFormModal && collectionFormModal.hide();
        loadCollections();
    } catch (err) {
        console.error('submitCreateCollection', err);
        showToast('Failed to create collection', 'danger');
    }
}

async function submitUpdateCollection(id) {
    try {
        const form = elems.collectionForm;
        const fd = new FormData(form);
        // Laravel API expects PUT - we can send method override or use fetch with PUT and body FormData (both ok)
        // Here we'll call the api endpoint with method POST and _method=PUT (works with typical Laravel)
        fd.append('_method', 'PUT');

        const json = await fetchJson(`/collections/${id}`, { method: 'POST', body: fd });
        showToast(json.message || 'Collection updated');
        collectionFormModal && collectionFormModal.hide();
        loadCollections();
    } catch (err) {
        console.error('submitUpdateCollection', err);
        showToast('Failed to update collection', 'danger');
    }
}

// =================== Delete Collection ===================
window.openDeleteModal = function(ev, id) {
    ev.stopPropagation?.();
    state.selectedCollectionId = id;
    if (elems.confirmDeleteBtn) {
        elems.confirmDeleteBtn.onclick = () => confirmDeleteCollection(id);
    }
    deleteModal && deleteModal.show();
};

async function confirmDeleteCollection(id) {
    try {
        const json = await fetchJson(`/collections/${id}`, { method: 'DELETE' });
        showToast(json.message || 'Collection deleted');
        deleteModal && deleteModal.hide();
        loadCollections();
    } catch (err) {
        console.error('confirmDeleteCollection', err);
        showToast('Failed to delete collection', 'danger');
    }
}

// =================== Artworks selection & add/remove ===================
window.openArtworkSelection = async function(collectionId) {
    state.selectedCollectionId = collectionId;
    state.selectedArtworks = new Set();
    try {
        await renderArtworkSelection(collectionId);
        artworkSelectionModal && artworkSelectionModal.show();
        elems.addArtworksBtn && (elems.addArtworksBtn.textContent = `Add Selected Artworks (0)`);
    } catch (err) {
        console.error(err);
        showToast('Failed to load artworks', 'danger');
    }
};

async function renderArtworkSelection(collectionId) {
    const page = 1;
    const json = await fetchJson(`/artworks/available?collection_id=${collectionId}&page=${page}`);
    const payload = json.success && json.data ? json.data : json;
    const artworks = payload.artworks || [];
    elems.artworksGrid.innerHTML = artworks.map(a => `
        <div class="col-md-3">
            <div class="card h-100">
                <img src="/storage/${a.image}" class="card-img-top" style="height:120px;object-fit:cover;">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div><small>${escapeHtml(a.title)}</small></div>
                    <div><input type="checkbox" data-id="${a.id}" onchange="toggleArtworkSelection(event, ${a.id})"></div>
                </div>
            </div>
        </div>
    `).join('');
}

window.toggleArtworkSelection = function(ev, id) {
    ev.stopPropagation?.();
    const cb = ev.target;
    if (cb.checked) state.selectedArtworks.add(id);
    else state.selectedArtworks.delete(id);
    if (elems.addArtworksBtn) elems.addArtworksBtn.textContent = `Add Selected Artworks (${state.selectedArtworks.size})`;
};

if (elems.addArtworksBtn) {
    elems.addArtworksBtn.addEventListener('click', async () => {
        if (!state.selectedCollectionId) return showToast('No collection selected', 'danger');
        const ids = Array.from(state.selectedArtworks);
        if (ids.length === 0) return showToast('Select artworks first', 'warning');
        try {
            const json = await fetchJson(`/collections/${state.selectedCollectionId}/artworks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artwork_ids: ids })
            });
            showToast(json.message || 'Artworks added');
            artworkSelectionModal && artworkSelectionModal.hide();
            viewCollection(state.selectedCollectionId);
        } catch (err) {
            console.error('add artworks', err);
            showToast('Failed to add artworks', 'danger');
        }
    });
}

window.openArtworkDeleteModal = function(ev, collectionId, artworkId) {
    ev.stopPropagation?.();
    state.pendingDelete = { collectionId, artworkId };
    if (elems.confirmArtworkDeleteBtn) {
        elems.confirmArtworkDeleteBtn.onclick = () => confirmRemoveArtwork(collectionId, artworkId);
    }
    artworkDeleteModal && artworkDeleteModal.show();
};

async function confirmRemoveArtwork(collectionId, artworkId) {
    try {
        const json = await fetchJson(`/collections/${collectionId}/artworks/${artworkId}`, { method: 'DELETE' });
        showToast(json.message || 'Artwork removed');
        artworkDeleteModal && artworkDeleteModal.hide();
        viewCollection(collectionId);
    } catch (err) {
        console.error('confirmRemoveArtwork', err);
        showToast('Failed to remove artwork', 'danger');
    }
}

// =================== Utilities ===================
function wireGlobalEvents() {
    if (elems.searchInput) {
        elems.searchInput.addEventListener('input', (e) => {
            state.searchTerm = e.target.value;
            state.currentPage = 1;
            loadCollections();
        });
    }
    if (elems.sortSelect) {
        elems.sortSelect.addEventListener('change', (e) => {
            state.sortOption = e.target.value;
            state.currentPage = 1;
            loadCollections();
        });
    }
    if (elems.emptyCreateBtn) {
        elems.emptyCreateBtn.addEventListener('click', openCreateForm);
    }
    if (elems.createBtn) {
        elems.createBtn.addEventListener('click', openCreateForm);
    }
    // cover preview (optional)
    if (elems.coverUpload && elems.coverPreview) {
        elems.coverUpload.addEventListener('change', (e) => {
            const f = e.target.files[0];
            if (!f) {
                elems.coverPreview.innerHTML = `<i class="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                    <p class="mb-1 text-muted"><span class="fw-semibold">Click to upload</span> or drag and drop</p>
                    <p class="small text-muted">PNG, JPG, WEBP (MAX. 5MB)</p>`;
                return;
            }
            const url = URL.createObjectURL(f);
            elems.coverPreview.innerHTML = `<img src="${url}" style="max-width:100%;max-height:200px;object-fit:contain">`;
        });
    }
}

// =================== Init ===================
document.addEventListener('DOMContentLoaded', () => {
    wireGlobalEvents();
    loadCollections().catch(err => {
        console.error('init loadCollections', err);
        showToast('Failed to load collections on startup. Check console.', 'danger');
    });
});
