<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Collections</title>
  <script>window.API_BASE = "http://127.0.0.1:8000/api";</script>
  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap" rel="stylesheet">
  <!-- Custom CSS -->
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-light">

  <!-- Toast container -->
  <div class="position-fixed top-0 end-0 p-3" style="z-index: 2000">
    <div id="toastContainer"></div>
  </div>

  <div class="container-fluid py-3">
    <div class="container-lg">

      <!-- ============== Collections Grid View ============== -->
      <div id="gridView">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h2 fw-bold text-dark">My Collections</h1>
          <button id="createBtn" class="btn btn-dark rounded-pill d-flex align-items-center">
            <i class="fas fa-plus me-2"></i> Create new collection
          </button>
        </div>

        <!-- Search & Sort -->
        <div class="d-flex flex-column flex-lg-row gap-3 mb-4">
          <div class="flex-grow-1">
            <div class="search-container position-relative">
              <i class="fas fa-search position-absolute top-50 start-3 translate-middle-y text-muted"></i>
              <input type="text" id="searchInput" placeholder="Search collections..." class="form-control ps-5 rounded-pill border-0 shadow-sm">
            </div>
          </div>
          <div class="sort-container" style="min-width: 200px;">
            <select id="sortSelect" class="form-select rounded-pill border-0 shadow-sm">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="most-artworks">Most Artworks</option>
              <option value="least-artworks">Least Artworks</option>
            </select>
          </div>
        </div>

        <!-- Collections Grid -->
        <div id="collectionsGrid" class="row g-3"></div>

        <!-- Pagination -->
        <div id="pagination" class="d-flex justify-content-center mt-4"></div>

        <!-- Empty State -->
        <div id="emptyState" class="card text-center d-none">
          <div class="card-body py-5">
            <i class="fas fa-folder-open fa-4x text-muted mb-3"></i>
            <h3 class="h5 fw-bold text-dark mb-2">No collections</h3>
            <p class="text-muted mb-4">Get started by creating a new collection.</p>
            <button id="emptyCreateBtn" class="btn btn-dark btn-lg">
              <i class="fas fa-plus me-2"></i> Create new collection
            </button>
          </div>
        </div>
      </div>

      <!-- ============== Collection Detail View ============== -->
      <div id="detailView" class="d-none"></div>
    </div>
  </div>

  <!-- ============== Create/Edit Collection Modal ============== -->
  <div class="modal fade" id="collectionFormModal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="formTitle">Create New Collection</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form id="collectionForm">
            <input type="hidden" id="collectionId">
            <div class="mb-3">
              <label for="titleInput" class="form-label">Title *</label>
              <input type="text" id="titleInput" class="form-control">
            </div>
            <div class="mb-3">
              <label for="descriptionInput" class="form-label">Description *</label>
              <textarea id="descriptionInput" rows="3" class="form-control"></textarea>
              <div class="d-flex justify-content-between align-items-center mt-2">
                <div class="text-muted small"><span id="charCount">0</span> / 200</div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Cover Image *</label>
              <input id="coverUpload" type="file" accept=".jpeg,.jpg,.png,.webp" class="form-control">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" id="submitFormBtn" class="btn btn-dark">Save</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ============== Artwork Selection Modal ============== -->
  <div class="modal fade" id="artworkSelectionModal" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Select Artworks to Add</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div id="artworksGrid" class="row g-3"></div>
          <div id="artworksPagination" class="d-flex justify-content-center mt-4"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" id="addArtworksBtn" class="btn btn-dark">Add Selected</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap + JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="scripts.js"></script>
</body>
</html>
