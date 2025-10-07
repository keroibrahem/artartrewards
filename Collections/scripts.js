// =================== State ===================
const state = {
    collections: [],
    selectedCollection: null,
    searchTerm: "",
    sortOption: "newest",
    currentPage: 1,
    totalPages: 1,
    selectedArtworks: new Set(),
};

// =================== API Configuration ===================
const API_BASE = "http://localhost:8000/api";

// =================== DOM Elements ===================
const elements = {
    gridView: document.getElementById("gridView"),
    detailView: document.getElementById("detailView"),
    collectionsGrid: document.getElementById("collectionsGrid"),
    pagination: document.getElementById("pagination"),
    emptyState: document.getElementById("emptyState"),
    searchInput: document.getElementById("searchInput"),
    sortSelect: document.getElementById("sortSelect"),
    createBtn: document.getElementById("createBtn"),
    emptyCreateBtn: document.getElementById("emptyCreateBtn"),
    collectionForm: document.getElementById("collectionForm"),
    collectionFormModal: new bootstrap.Modal(document.getElementById("collectionFormModal")),
    formTitle: document.getElementById("formTitle"),
    submitFormBtn: document.getElementById("submitFormBtn"),
    titleInput: document.getElementById("titleInput"),
    descriptionInput: document.getElementById("descriptionInput"),
    coverUpload: document.getElementById("coverUpload"),
    coverPreview: document.getElementById("coverPreview"),
    deleteModal: new bootstrap.Modal(document.getElementById("deleteModal")),
    confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
    artworkSelectionModal: new bootstrap.Modal(document.getElementById("artworkSelectionModal")),
    addArtworksBtn: document.getElementById("addArtworksBtn"),
    artworksGrid: document.getElementById("artworksGrid"),
    artworksPagination: document.getElementById("artworksPagination"),
    artworkDeleteModal: new bootstrap.Modal(document.getElementById("artworkDeleteModal")),
    confirmArtworkDeleteBtn: document.getElementById("confirmArtworkDeleteBtn"),
};

// =================== Helpers ===================
function showToast(message, type = "success") {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toastContainer";
        toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
        toastContainer.style.zIndex = "9999";
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.role = "alert";
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    toastContainer.appendChild(toast);
    
    // Initialize Bootstrap toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 4000);
}

function renderPagination(totalPages) {
    if (totalPages <= 1) {
        elements.pagination.innerHTML = '';
        return;
    }

    state.totalPages = totalPages;
    let html = '';
    
    // Previous button
    html += `
        <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(${state.currentPage - 1})" ${state.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        </li>
    `;
    
    // Page numbers - show only relevant pages
    const startPage = Math.max(1, state.currentPage - 2);
    const endPage = Math.min(totalPages, state.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === state.currentPage ? "active" : ""}">
                <button class="page-link" onclick="changePage(${i})">${i}</button>
            </li>
        `;
    }
    
    // Next button
    html += `
        <li class="page-item ${state.currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(${state.currentPage + 1})" ${state.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        </li>
    `;
    
    elements.pagination.innerHTML = `
        <nav aria-label="Collections pagination">
            <ul class="pagination justify-content-center mb-0">${html}</ul>
        </nav>
    `;
}

function changePage(page) {
    if (page < 1 || page > state.totalPages) return;
    state.currentPage = page;
    renderCollections();
}

// =================== New Collection Function ===================
function createNewCollection() {
    console.log('createNewCollection called'); // Debug log
    
    // Reset form
    elements.collectionForm.reset();
    elements.formTitle.textContent = "Create New Collection";
    elements.submitFormBtn.textContent = "Create Collection";
    elements.submitFormBtn.onclick = createCollection;
    
    // Reset cover preview
    elements.coverPreview.innerHTML = `
        <i class="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
        <p class="mb-1 text-muted"><span class="fw-semibold">Click to upload</span> or drag and drop</p>
        <p class="small text-muted">PNG, JPG, WEBP (MAX. 5MB)</p>
    `;
    
    // Reset validation
    elements.titleInput.classList.remove('is-invalid');
    elements.descriptionInput.classList.remove('is-invalid');
    elements.coverUpload.classList.remove('is-invalid');
    
    // Show modal
    elements.collectionFormModal.show();
}

// =================== View Live Collection Function ===================
function viewLiveCollection(collection) {
    showToast(`Opening live view for: ${collection.title}`, 'info');
    // window.location.href = `/collections/${collection.id}/live`;
}

// =================== Collections ===================
async function renderCollections() {
    try {
        console.log('Fetching collections...'); // Debug log
        
        const res = await fetch(`${API_BASE}/collections?page=${state.currentPage}&search=${state.searchTerm}&sort=${state.sortOption}`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('API Response:', data); // Debug log
        
        if (!data.success) {
            throw new Error(data.message || 'API request failed');
        }

        const collections = data.data.collections || [];
        const pagination = data.data.pagination;

        console.log('Collections found:', collections.length); // Debug log
        console.log('Pagination:', pagination); // Debug log

        // Show/hide create button based on collections
        if (elements.createBtn) {
            if (collections.length === 0 && state.searchTerm === "") {
                elements.createBtn.classList.add('d-none');
            } else {
                elements.createBtn.classList.remove('d-none');
            }
        }

        if (collections.length === 0) {
            elements.emptyState.classList.remove("d-none");
            elements.collectionsGrid.innerHTML = "";
            elements.pagination.innerHTML = "";
            
            if (state.searchTerm) {
                document.getElementById("emptyStateTitle").textContent = "No collections found";
                document.getElementById("emptyStateMessage").textContent = "Try adjusting your search term";
            } else {
                document.getElementById("emptyStateTitle").textContent = "No collections yet";
                document.getElementById("emptyStateMessage").textContent = "Get started by creating your first collection";
            }
            return;
        }

        elements.emptyState.classList.add("d-none");
        
        elements.collectionsGrid.innerHTML = collections.map(collection => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="collection-card card h-100 shadow-sm border-0">
                    <div class="cover-image-container position-relative">
                        <img src="${API_BASE.replace('/api', '')}/storage/${collection.cover_image}" 
                             alt="${collection.title}" 
                             class="cover-image card-img-top"
                             style="height: 200px; object-fit: cover; cursor: pointer;"
                             onclick="showDetailView(${collection.id})">
                        <div class="position-absolute top-0 end-0 m-2">
                            <span class="badge bg-dark bg-opacity-75">${collection.artworks_count || 0} artworks</span>
                        </div>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title mb-2" style="cursor: pointer;" onclick="showDetailView(${collection.id})">
                            ${collection.title}
                        </h5>
                        <p class="card-text text-muted flex-grow-1 small">${collection.description}</p>
                        
                        <div class="mt-auto pt-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <button class="btn btn-dark btn-sm" 
                                        onclick="viewLiveCollection(${JSON.stringify(collection).replace(/"/g, '&quot;')})">
                                    <i class="fas fa-eye me-1"></i>View Live
                                </button>
                                <div class="btn-group">
                                    <button class="btn btn-outline-primary btn-sm" 
                                            onclick="event.stopPropagation(); editCollection(${collection.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" 
                                            onclick="event.stopPropagation(); openDeleteModal(${collection.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join("");

        // Render pagination only if there are multiple pages
        renderPagination(pagination.last_page);

    } catch (err) {
        console.error('Error in renderCollections:', err);
        showToast("Error loading collections", "danger");
    }
}

async function showDetailView(id) {
    try {
        const res = await fetch(`${API_BASE}/collections/${id}`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data.success) {
            throw new Error(data.message || 'API request failed');
        }

        const collection = data.data;
        state.selectedCollection = collection;

        elements.gridView.classList.add("d-none");
        elements.detailView.classList.remove("d-none");
        
        elements.detailView.innerHTML = `
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <!-- Header -->
                    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                        <h2 class="h3 fw-bold text-dark mb-3 mb-md-0">${collection.title}</h2>
                        <div class="d-flex flex-wrap gap-2">
                            <button class="btn btn-dark btn-sm d-flex align-items-center" 
                                    onclick="viewLiveCollection(${JSON.stringify(collection).replace(/"/g, '&quot;')})">
                                <i class="fas fa-eye me-2"></i>View Live
                            </button>
                            <button class="btn btn-outline-primary btn-sm d-flex align-items-center" 
                                    onclick="editCollection(${collection.id})">
                                <i class="fas fa-edit me-2"></i>Edit
                            </button>
                            <button class="btn btn-outline-danger btn-sm d-flex align-items-center" 
                                    onclick="openDeleteModal(${collection.id})">
                                <i class="fas fa-trash me-2"></i>Delete
                            </button>
                            <button class="btn btn-outline-secondary btn-sm d-flex align-items-center" 
                                    onclick="backToGrid()">
                                <i class="fas fa-arrow-left me-2"></i>Back
                            </button>
                        </div>
                    </div>

                    <!-- Collection Info -->
                    <div class="row align-items-center mb-4">
                        <div class="col-md-4 text-center">
                            <img src="${API_BASE.replace('/api', '')}/storage/${collection.cover_image}" 
                                 alt="${collection.title}" 
                                 class="img-fluid rounded shadow"
                                 style="max-height: 250px; object-fit: cover;">
                        </div>
                        <div class="col-md-8">
                            <p class="text-muted mb-3">${collection.description}</p>
                            <button class="btn btn-dark d-inline-flex align-items-center" 
                                    onclick="showArtworkSelection(${collection.id})">
                                <i class="fas fa-plus me-2"></i>Add Artwork
                            </button>
                        </div>
                    </div>

                    <!-- Artworks Section -->
                    <div class="mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h3 class="h4 fw-semibold text-dark mb-0">
                                Artworks in this Collection 
                                <span class="badge bg-secondary ms-2">${collection.artworks ? collection.artworks.length : 0}</span>
                            </h3>
                        </div>
                        
                        ${!collection.artworks || collection.artworks.length === 0 ? `
                            <div class="text-center py-5 border rounded">
                                <i class="fas fa-image fa-3x text-muted mb-3"></i>
                                <h4 class="text-muted">No artworks yet</h4>
                                <p class="text-muted mb-3">Start by adding artworks to this collection</p>
                                <button class="btn btn-dark" onclick="showArtworkSelection(${collection.id})">
                                    <i class="fas fa-plus me-2"></i>Add Artworks
                                </button>
                            </div>
                        ` : `
                            <div class="row g-3">
                                ${collection.artworks.map(artwork => `
                                    <div class="col-sm-6 col-md-4 col-lg-3">
                                        <div class="card h-100 border-0 shadow-sm">
                                            <div class="position-relative">
                                                <img src="${API_BASE.replace('/api', '')}/storage/${artwork.image}" 
                                                     alt="${artwork.title}" 
                                                     class="card-img-top"
                                                     style="height: 200px; object-fit: cover; cursor: pointer;"
                                                     onclick="openArtworkDetails(${artwork.id})">
                                                <div class="position-absolute top-0 end-0 m-2">
                                                    <button class="btn btn-danger btn-sm" 
                                                            onclick="event.stopPropagation(); removeArtwork(${collection.id}, ${artwork.id})">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="card-body">
                                                <h6 class="card-title mb-1">${artwork.title}</h6>
                                                <p class="card-text text-muted small mb-1">${artwork.artist_name}</p>
                                                <p class="card-text text-primary fw-bold mb-0">$${artwork.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error('Error in showDetailView:', err);
        showToast("Error loading collection details", "danger");
    }
}

function backToGrid() {
    elements.detailView.classList.add("d-none");
    elements.gridView.classList.remove("d-none");
    state.selectedCollection = null;
    renderCollections();
}

// =================== Collection Form ===================
function openCreateForm() {
    createNewCollection();
}

async function editCollection(id) {
    try {
        const res = await fetch(`${API_BASE}/collections/${id}`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data.success) {
            throw new Error(data.message || 'API request failed');
        }

        const collection = data.data;
        
        document.getElementById("collectionId").value = collection.id;
        elements.titleInput.value = collection.title;
        elements.descriptionInput.value = collection.description;
        elements.formTitle.textContent = "Edit Collection";
        elements.submitFormBtn.textContent = "Update Collection";
        elements.submitFormBtn.onclick = () => updateCollection(collection.id);
        
        elements.coverPreview.innerHTML = `
            <img src="${API_BASE.replace('/api', '')}/storage/${collection.cover_image}" 
                 alt="Cover preview" 
                 class="img-fluid rounded"
                 style="max-height: 200px; object-fit: cover;">
        `;
        
        elements.collectionFormModal.show();
    } catch (err) {
        console.error('Error in editCollection:', err);
        showToast("Error loading collection for edit", "danger");
    }
}

async function createCollection() {
    const formData = new FormData();
    formData.append('artist_id', 1);
    formData.append('title', elements.titleInput.value);
    formData.append('description', elements.descriptionInput.value);
    
    if (elements.coverUpload.files[0]) {
        formData.append('cover_image', elements.coverUpload.files[0]);
    }
    
    try {
        const res = await fetch(`${API_BASE}/collections`, {
            method: "POST",
            body: formData
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data.success) {
            throw new Error(data.message || 'API request failed');
        }
        
        showToast("Collection created successfully!");
        elements.collectionFormModal.hide();
        renderCollections();
    } catch (err) {
        console.error('Error in createCollection:', err);
        showToast("Error creating collection", "danger");
    }
}

async function updateCollection(id) {
    const formData = new FormData();
    formData.append('artist_id', 1);
    formData.append('title', elements.titleInput.value);
    formData.append('description', elements.descriptionInput.value);
    formData.append('_method', 'PUT');
    
    if (elements.coverUpload.files[0]) {
        formData.append('cover_image', elements.coverUpload.files[0]);
    }
    
    try {
        const res = await fetch(`${API_BASE}/collections/${id}`, {
            method: "POST",
            body: formData
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data.success) {
            throw new Error(data.message || 'API request failed');
        }
        
        showToast("Collection updated successfully!");
        elements.collectionFormModal.hide();
        
        if (state.selectedCollection && state.selectedCollection.id === id) {
            showDetailView(id);
        } else {
            renderCollections();
        }
    } catch (err) {
        console.error('Error in updateCollection:', err);
        showToast("Error updating collection", "danger");
    }
}

function openDeleteModal(id) {
    state.selectedCollection = id;
    elements.confirmDeleteBtn.onclick = () => deleteCollection(id);
    elements.deleteModal.show();
}

async function deleteCollection(id) {
    try {
        const res = await fetch(`${API_BASE}/collections/${id}`, { 
            method: "DELETE" 
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data.success) {
            throw new Error(data.message || 'API request failed');
        }
        
        showToast("Collection deleted successfully!");
        elements.deleteModal.hide();
        
        if (state.selectedCollection && state.selectedCollection.id === id) {
            backToGrid();
        } else {
            renderCollections();
        }
    } catch (err) {
        console.error('Error in deleteCollection:', err);
        showToast("Error deleting collection", "danger");
    }
}

// =================== Artworks ===================
async function showArtworkSelection(collectionId) {
    state.selectedCollection = collectionId;
    state.selectedArtworks.clear();
    await renderArtworkSelection();
    elements.artworkSelectionModal.show();
}

async function renderArtworkSelection() {
    try {
        const res = await fetch(`${API_BASE}/artworks/available?collection_id=${state.selectedCollection}`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data.success) {
            throw new Error(data.message || 'API request failed');
        }

        const artworks = data.data.artworks || [];

        elements.artworksGrid.innerHTML = artworks.map(artwork => `
            <div class="col-md-6 col-lg-4 col-xl-3 mb-3">
                <div class="card h-100 border-0 shadow-sm artwork-selection-card ${state.selectedArtworks.has(artwork.id) ? 'border-primary border-2' : ''}"
                     onclick="event.currentTarget.querySelector('.form-check-input').click()">
                    <img src="${API_BASE.replace('/api', '')}/storage/${artwork.image}" 
                         class="card-img-top" 
                         alt="${artwork.title}"
                         style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h6 class="card-title">${artwork.title}</h6>
                        <p class="card-text text-muted small">${artwork.artist_name}</p>
                        <p class="card-text text-primary fw-bold">$${artwork.price}</p>
                        <div class="form-check">
                            <input class="form-check-input" 
                                   type="checkbox" 
                                   ${state.selectedArtworks.has(artwork.id) ? 'checked' : ''}
                                   onchange="toggleArtworkSelection(${artwork.id})"
                                   onclick="event.stopPropagation()">
                            <label class="form-check-label small">Select artwork</label>
                        </div>
                    </div>
                </div>
            </div>
        `).join("");

        elements.addArtworksBtn.innerHTML = `Add Selected Artworks (${state.selectedArtworks.size})`;
    } catch (err) {
        console.error('Error in renderArtworkSelection:', err);
        showToast("Error loading artworks", "danger");
    }
}

function toggleArtworkSelection(id) {
    if (state.selectedArtworks.has(id)) {
        state.selectedArtworks.delete(id);
    } else {
        state.selectedArtworks.add(id);
    }
    elements.addArtworksBtn.innerHTML = `Add Selected Artworks (${state.selectedArtworks.size})`;
    renderArtworkSelection(); // Re-render to update borders
}

async function addSelectedArtworks() {
    if (state.selectedArtworks.size === 0) {
        showToast("Please select at least one artwork", "warning");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/collections/${state.selectedCollection}/artworks`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ 
                artwork_ids: Array.from(state.selectedArtworks) 
            })
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data.success) {
            throw new Error(data.message || 'API request failed');
        }
        
        showToast("Artworks added successfully!");
        elements.artworkSelectionModal.hide();
        
        if (state.selectedCollection) {
            showDetailView(state.selectedCollection);
        }
    } catch (err) {
        console.error('Error in addSelectedArtworks:', err);
        showToast("Error adding artworks", "danger");
    }
}

async function removeArtwork(collectionId, artworkId) {
    if (!confirm('Are you sure you want to remove this artwork from the collection?')) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/collections/${collectionId}/artworks/${artworkId}`, { 
            method: "DELETE" 
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data.success) {
            throw new Error(data.message || 'API request failed');
        }
        
        showToast("Artwork removed successfully!");
        
        if (state.selectedCollection && state.selectedCollection.id === collectionId) {
            showDetailView(collectionId);
        }
    } catch (err) {
        console.error('Error in removeArtwork:', err);
        showToast("Error removing artwork", "danger");
    }
}

// =================== Additional Functions ===================
function openArtworkDetails(artworkId) {
    showToast(`Opening artwork details for ID: ${artworkId}`, 'info');
    // window.location.href = `/artworks/${artworkId}`;
}

// =================== Event Listeners ===================
function initializeEventListeners() {
    console.log('Initializing event listeners...'); // Debug log
    
    // Cover upload preview
    elements.coverUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                elements.coverPreview.innerHTML = `<img src="${e.target.result}" alt="Cover preview" class="img-fluid rounded" style="max-height: 200px; object-fit: cover;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Cover preview click to upload
    elements.coverPreview.addEventListener('click', function() {
        elements.coverUpload.click();
    });

    // Search input
    elements.searchInput.addEventListener('input', function(e) {
        state.searchTerm = e.target.value;
        state.currentPage = 1;
        renderCollections();
    });

    // Sort select
    elements.sortSelect.addEventListener('change', function(e) {
        state.sortOption = e.target.value;
        state.currentPage = 1;
        renderCollections();
    });

    // Create buttons - FIXED
    if (elements.createBtn) {
        console.log('Create button found, adding listener'); // Debug log
        elements.createBtn.addEventListener('click', createNewCollection);
    } else {
        console.log('Create button NOT found'); // Debug log
    }
    
    if (elements.emptyCreateBtn) {
        console.log('Empty create button found, adding listener'); // Debug log
        elements.emptyCreateBtn.addEventListener('click', createNewCollection);
    } else {
        console.log('Empty create button NOT found'); // Debug log
    }

    // Add artworks button
    elements.addArtworksBtn.addEventListener('click', addSelectedArtworks);
}

// =================== Initialize App ===================
document.addEventListener("DOMContentLoaded", function() {
    console.log('DOM loaded, initializing app...'); // Debug log
    initializeEventListeners();
    renderCollections();
});