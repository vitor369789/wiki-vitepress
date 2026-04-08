<template>
  <div class="pages-editor">
    <div class="header">
      <h2>📝 Editor de Páginas</h2>
      <button @click="showNewPage = true" class="btn-primary">
        ➕ Nova Página
      </button>
    </div>

    <div class="editor-layout">
      <!-- Lista de páginas -->
      <div class="pages-list">
        <h3>Páginas Existentes</h3>
        
        <div v-if="loadingPages" class="loading-small">Carregando...</div>
        
        <div v-else class="pages-items">
          <div 
            v-for="page in pages" 
            :key="page.path"
            :class="['page-item', { active: selectedPage?.path === page.path }]"
            @click="loadPage(page)"
          >
            <span class="page-icon">📄</span>
            <div class="page-item-info">
              <p class="page-name">{{ page.name }}</p>
              <p class="page-path">{{ page.path }}</p>
            </div>
          </div>

          <div v-if="pages.length === 0" class="empty-small">
            Nenhuma página encontrada
          </div>
        </div>
      </div>

      <!-- Editor -->
      <div class="editor-panel">
        <div v-if="!selectedPage && !showNewPage" class="editor-empty">
          <p>Selecione uma página para editar ou crie uma nova</p>
        </div>

        <div v-else class="editor-content">
          <div class="editor-header">
            <div class="editor-title">
              <input 
                v-if="showNewPage"
                v-model="newPagePath"
                type="text"
                placeholder="caminho/da/pagina.md"
                class="path-input"
              />
              <span v-else class="current-path">{{ selectedPage.path }}</span>
            </div>
            <div class="editor-actions">
              <button @click="saveCurrentPage" class="btn-success" :disabled="saving">
                {{ saving ? '💾 Salvando...' : '💾 Salvar' }}
              </button>
              <button v-if="selectedPage" @click="confirmDeletePage" class="btn-danger">
                🗑️ Deletar
              </button>
              <button @click="cancelEdit" class="btn-secondary">
                ❌ Cancelar
              </button>
            </div>
          </div>

          <div class="editor-toolbar">
            <div class="toolbar-group">
              <button @click="insertMarkdown('# ')" class="toolbar-btn" title="Título 1">
                H1
              </button>
              <button @click="insertMarkdown('## ')" class="toolbar-btn" title="Título 2">
                H2
              </button>
              <button @click="insertMarkdown('### ')" class="toolbar-btn" title="Título 3">
                H3
              </button>
            </div>
            <div class="toolbar-group">
              <button @click="insertMarkdown('**', '**')" class="toolbar-btn" title="Negrito">
                <strong>B</strong>
              </button>
              <button @click="insertMarkdown('*', '*')" class="toolbar-btn" title="Itálico">
                <em>I</em>
              </button>
              <button @click="insertMarkdown('`', '`')" class="toolbar-btn" title="Código">
                &lt;/&gt;
              </button>
            </div>
            <div class="toolbar-group">
              <button @click="insertMarkdown('- ')" class="toolbar-btn" title="Lista">
                ≡
              </button>
              <button @click="insertMarkdown('[', '](url)')" class="toolbar-btn" title="Link">
                🔗
              </button>
              <button @click="showImagePicker = true" class="toolbar-btn toolbar-btn-primary" title="Inserir Imagem">
                🖼️ Imagem
              </button>
            </div>
            <div class="toolbar-group">
              <button 
                :class="['toolbar-btn', { active: viewMode === 'split' }]"
                @click="viewMode = 'split'"
                title="Visualização Dividida"
              >
                ⬌ Split
              </button>
              <button 
                :class="['toolbar-btn', { active: viewMode === 'edit' }]"
                @click="viewMode = 'edit'"
                title="Apenas Editor"
              >
                ✏️ Editar
              </button>
              <button 
                :class="['toolbar-btn', { active: viewMode === 'preview' }]"
                @click="viewMode = 'preview'"
                title="Apenas Preview"
              >
                👁️ Preview
              </button>
            </div>
          </div>

          <div class="editor-workspace" :class="`view-${viewMode}`">
            <div v-if="viewMode !== 'preview'" class="editor-pane">
              <textarea 
                ref="textareaRef"
                v-model="editorContent"
                class="editor-textarea"
                placeholder="# Título da Página

Escreva seu conteúdo em Markdown aqui...

## Seção 1

Conteúdo da seção...

![Imagem](url-da-imagem.jpg)"
                @scroll="syncScroll"
              ></textarea>
            </div>

            <div v-if="viewMode !== 'edit'" class="preview-pane" ref="previewRef">
              <div class="preview-content" v-html="previewHtml"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nova Página -->
    <div v-if="showNewPage && !selectedPage" class="modal-overlay" @click="cancelNewPage">
      <div class="modal-content" @click.stop>
        <h3>➕ Nova Página</h3>
        
        <div class="form-group">
          <label>Caminho da Página *</label>
          <input 
            v-model="newPagePath"
            type="text"
            placeholder="exemplo: minha-pagina.md ou pasta/pagina.md"
            class="form-input"
          />
          <small>Use apenas letras, números, hífens e barras. Deve terminar com .md</small>
        </div>

        <div class="modal-actions">
          <button @click="cancelNewPage" class="btn-secondary">
            Cancelar
          </button>
          <button @click="createNewPage" class="btn-primary" :disabled="!isValidPath">
            Criar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Seletor de Imagens -->
    <div v-if="showImagePicker" class="modal-overlay" @click="showImagePicker = false">
      <div class="modal-content modal-large" @click.stop>
        <h3>🖼️ Inserir Imagem</h3>
        
        <div class="image-picker-tabs">
          <button 
            :class="['tab', { active: imagePickerTab === 'upload' }]"
            @click="imagePickerTab = 'upload'"
          >
            ⬆️ Upload Nova
          </button>
          <button 
            :class="['tab', { active: imagePickerTab === 'library' }]"
            @click="imagePickerTab = 'library'"
          >
            📁 Biblioteca
          </button>
        </div>

        <div v-if="imagePickerTab === 'upload'" class="upload-section">
          <!-- Indicador de pasta de destino -->
          <div class="upload-destination">
            <span class="destination-label">📁 Upload para:</span>
            <span class="destination-path">{{ currentLibraryPath || 'pages-images' }}</span>
            <button 
              v-if="currentLibraryPath" 
              @click="currentLibraryPath = ''"
              class="btn-change-folder"
              title="Mudar para pasta padrão"
            >
              🔄
            </button>
          </div>

          <div 
            class="upload-area"
            :class="{ 'upload-dragging': isDraggingImage }"
            @drop="handleImageDrop"
            @dragover="handleImageDragOver"
            @dragenter="handleImageDragEnter"
            @dragleave="handleImageDragLeave"
          >
            <label class="upload-label">
              <input type="file" @change="handleImageUpload" accept="image/*" hidden ref="imageInputRef" />
              <div class="upload-placeholder">
                <span class="upload-icon">{{ isDraggingImage ? '📥' : '📤' }}</span>
                <p v-if="isDraggingImage">Solte a imagem aqui</p>
                <p v-else>Clique para selecionar ou arraste uma imagem</p>
                <small>JPG, PNG, GIF, SVG, WebP - Máx 10MB</small>
              </div>
            </label>
          </div>
        </div>

        <div v-else class="library-section">
          <!-- Breadcrumb da biblioteca -->
          <div class="library-breadcrumb">
            <button @click="navigateLibrary('')" class="breadcrumb-item">
              🏠 Raiz
            </button>
            <span v-for="(folder, index) in currentLibraryPath.split('/').filter(f => f)" :key="index">
              <span class="breadcrumb-separator">/</span>
              <button 
                @click="navigateLibrary(currentLibraryPath.split('/').slice(0, index + 1).join('/'))"
                class="breadcrumb-item"
              >
                {{ folder }}
              </button>
            </span>
          </div>

          <div v-if="loadingImages" class="loading-small">Carregando...</div>
          
          <div v-else class="library-grid">
            <!-- Pastas -->
            <div 
              v-for="item in currentLibraryItems.filter(i => i.type === 'folder')" 
              :key="item.path"
              class="library-folder"
              @click="() => { console.log('🖱️ Clicou na pasta:', item.name, 'path:', item.path); navigateLibrary(item.path); }"
            >
              <div class="folder-icon-large">📁</div>
              <p class="item-name">{{ item.name }}</p>
              <p class="item-count">{{ item.children.length }} itens</p>
            </div>

            <!-- Imagens -->
            <div 
              v-for="item in currentLibraryItems.filter(i => i.type === 'file' && isImageFile(i.filename))" 
              :key="item.path"
              class="image-item"
              @click="insertImage(item.url)"
            >
              <img :src="getSecureImageUrl(item.url)" :alt="item.filename" />
              <p class="image-name">{{ item.filename }}</p>
            </div>

            <div v-if="currentLibraryItems.length === 0" class="empty-small">
              Pasta vazia
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="showImagePicker = false" class="btn-secondary">
            Fechar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Delete -->
    <div v-if="deletingPage" class="modal-overlay" @click="deletingPage = null">
      <div class="modal-content modal-small" @click.stop>
        <h3>⚠️ Confirmar Exclusão</h3>
        <p>Tem certeza que deseja deletar a página <strong>{{ deletingPage.path }}</strong>?</p>
        <p class="warning-text">Esta ação não pode ser desfeita!</p>
        
        <div class="modal-actions">
          <button @click="deletingPage = null" class="btn-secondary">
            Cancelar
          </button>
          <button @click="deletePage" class="btn-danger" :disabled="deleting">
            {{ deleting ? 'Deletando...' : 'Deletar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { marked } from 'marked';
import { fetchApi, getApiUrl } from '../utils/api.js';

const pages = ref([]);
const loadingPages = ref(true);
const selectedPage = ref(null);
const editorContent = ref('');
const viewMode = ref('split'); // 'split', 'edit', 'preview'
const saving = ref(false);
const showNewPage = ref(false);
const newPagePath = ref('');
const deletingPage = ref(null);
const deleting = ref(false);
const showImagePicker = ref(false);
const imagePickerTab = ref('library');
const availableImages = ref([]);
const allItems = ref([]);
const currentLibraryPath = ref('');
const loadingImages = ref(false);
const isDraggingImage = ref(false);
const imageInputRef = ref(null);
const textareaRef = ref(null);
const previewRef = ref(null);
let imageDragCounter = 0;

const isValidPath = computed(() => {
  return newPagePath.value && /^[a-zA-Z0-9\-_\/]+\.md$/.test(newPagePath.value);
});

const previewHtml = computed(() => {
  try {
    return marked.parse(editorContent.value || '');
  } catch (e) {
    return '<p>Erro ao renderizar Markdown</p>';
  }
});

const currentLibraryItems = computed(() => {
  if (!currentLibraryPath.value) {
    return allItems.value;
  }
  
  // Navegar para a pasta atual
  const parts = currentLibraryPath.value.split('/').filter(p => p);
  let items = allItems.value;
  
  for (const part of parts) {
    const folder = items.find(i => i.type === 'folder' && i.name === part);
    if (folder && folder.children) {
      items = folder.children;
    }
  }
  
  return items;
});

function insertMarkdown(before, after = '') {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = editorContent.value.substring(start, end);
  const newText = before + selectedText + after;

  editorContent.value = 
    editorContent.value.substring(0, start) +
    newText +
    editorContent.value.substring(end);

  // Reposicionar cursor
  setTimeout(() => {
    textarea.focus();
    const newPos = start + before.length + selectedText.length;
    textarea.setSelectionRange(newPos, newPos);
  }, 0);
}

function insertImage(url) {
  const markdown = `![Imagem](${url})`;
  const textarea = textareaRef.value;
  
  if (textarea) {
    const start = textarea.selectionStart;
    editorContent.value = 
      editorContent.value.substring(0, start) +
      '\n' + markdown + '\n' +
      editorContent.value.substring(start);
  } else {
    editorContent.value += '\n' + markdown + '\n';
  }

  showImagePicker.value = false;
}

async function uploadImageFile(file) {
  console.log('🚀 uploadImageFile chamada com arquivo:', file?.name);
  
  if (!file) {
    console.log('❌ Nenhum arquivo fornecido');
    return;
  }

  console.log('📄 Arquivo:', file.name, 'Tamanho:', file.size, 'Tipo:', file.type);

  // Validar tipo de arquivo
  if (!/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file.name)) {
    console.log('❌ Tipo de arquivo inválido:', file.name);
    alert('Tipo de arquivo não suportado. Use JPG, PNG, GIF, SVG ou WebP.');
    return;
  }

  // Validar tamanho (10MB)
  if (file.size > 10 * 1024 * 1024) {
    console.log('❌ Arquivo muito grande:', file.size);
    alert('Arquivo muito grande. Máximo 10MB.');
    return;
  }

  console.log('✅ Validações passaram');

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Usar a pasta atual da biblioteca, ou pages-images como padrão
    const uploadFolder = currentLibraryPath.value || 'pages-images';
    console.log('📁 Pasta atual da biblioteca:', currentLibraryPath.value);
    console.log('📤 Upload para pasta:', uploadFolder);
    formData.append('folder', uploadFolder);

    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: formData
    });

    const data = await response.json();
    console.log('✅ Resposta do upload:', data);

    if (response.ok) {
      insertImage(data.file.url);
      await loadImages();
      imagePickerTab.value = 'library'; // Mudar para biblioteca após upload
    } else {
      alert(data.error || 'Erro ao fazer upload');
    }
  } catch (err) {
    alert('Erro de conexão');
    console.error(err);
  }
}

async function handleImageUpload(event) {
  console.log('📤 handleImageUpload chamado');
  const file = event.target.files[0];
  console.log('📁 Arquivo selecionado:', file?.name);
  await uploadImageFile(file);
  event.target.value = '';
}

function handleImageDragEnter(e) {
  e.preventDefault();
  imageDragCounter++;
  isDraggingImage.value = true;
}

function handleImageDragOver(e) {
  e.preventDefault();
}

function handleImageDragLeave(e) {
  e.preventDefault();
  imageDragCounter--;
  if (imageDragCounter === 0) {
    isDraggingImage.value = false;
  }
}

async function handleImageDrop(e) {
  console.log('🎯 handleImageDrop chamado');
  e.preventDefault();
  isDraggingImage.value = false;
  imageDragCounter = 0;

  const files = Array.from(e.dataTransfer.files);
  console.log('📦 Arquivos soltos:', files.length);
  
  if (files.length === 0) {
    console.log('❌ Nenhum arquivo');
    return;
  }

  // Upload apenas a primeira imagem
  const imageFile = files.find(f => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f.name));
  console.log('🖼️ Imagem encontrada:', imageFile?.name);
  
  if (imageFile) {
    await uploadImageFile(imageFile);
  } else {
    console.log('❌ Nenhuma imagem válida');
    alert('Nenhuma imagem válida encontrada. Use JPG, PNG, GIF, SVG ou WebP.');
  }
}

async function loadImages() {
  loadingImages.value = true;

  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:3000/api/files', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      allItems.value = data.items || [];
    }
  } catch (err) {
    console.error(err);
  } finally {
    loadingImages.value = false;
  }
}

function getSecureImageUrl(url) {
  const token = localStorage.getItem('auth_token');
  return `http://localhost:3000${url}?token=${token}`;
}

function navigateLibrary(path) {
  console.log('🧭 Navegando para:', path);
  currentLibraryPath.value = path;
  console.log('📍 Pasta atual agora é:', currentLibraryPath.value);
}

function isImageFile(filename) {
  return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(filename);
}

function syncScroll() {
  // Sincronizar scroll entre editor e preview
  if (viewMode.value === 'split' && textareaRef.value && previewRef.value) {
    const scrollPercentage = textareaRef.value.scrollTop / 
      (textareaRef.value.scrollHeight - textareaRef.value.clientHeight);
    previewRef.value.scrollTop = scrollPercentage * 
      (previewRef.value.scrollHeight - previewRef.value.clientHeight);
  }
}

async function loadPages() {
  loadingPages.value = true;

  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:3000/api/pages', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      pages.value = data.pages.sort((a, b) => a.path.localeCompare(b.path));
    }
  } catch (err) {
    console.error(err);
  } finally {
    loadingPages.value = false;
  }
}

async function loadPage(page) {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:3000/api/pages/${page.path}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      selectedPage.value = page;
      editorContent.value = data.content;
      showNewPage.value = false;
    }
  } catch (err) {
    alert('Erro ao carregar página');
    console.error(err);
  }
}

function createNewPage() {
  if (!isValidPath.value) return;
  
  selectedPage.value = { path: newPagePath.value, name: newPagePath.value };
  editorContent.value = `# ${newPagePath.value.replace('.md', '').replace(/\//g, ' / ')}\n\nConteúdo da página...`;
  showNewPage.value = true;
}

// Carregar imagens quando abrir o picker
watch(showImagePicker, (newVal) => {
  if (newVal) {
    console.log('🖼️ Modal de imagem aberto');
    loadImages();
  }
});

watch(imagePickerTab, (newVal) => {
  console.log('📑 Aba mudou para:', newVal);
  if (newVal === 'library' && showImagePicker.value) {
    loadImages();
  }
});

// Monitorar mudanças na pasta atual
watch(currentLibraryPath, (newVal, oldVal) => {
  console.log('🔄 Pasta mudou de:', oldVal, '→', newVal);
});

function cancelNewPage() {
  showNewPage.value = false;
  newPagePath.value = '';
}

function cancelEdit() {
  selectedPage.value = null;
  editorContent.value = '';
  showNewPage.value = false;
  newPagePath.value = '';
}

async function saveCurrentPage() {
  if (!selectedPage.value) return;

  saving.value = true;

  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:3000/api/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        path: selectedPage.value.path,
        content: editorContent.value
      })
    });

    if (response.ok) {
      alert('Página salva com sucesso!');
      await loadPages();
      if (showNewPage.value) {
        showNewPage.value = false;
        newPagePath.value = '';
      }
    } else {
      const data = await response.json();
      alert(data.error || 'Erro ao salvar página');
    }
  } catch (err) {
    alert('Erro de conexão');
    console.error(err);
  } finally {
    saving.value = false;
  }
}

function confirmDeletePage() {
  deletingPage.value = selectedPage.value;
}

async function deletePage() {
  deleting.value = true;

  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:3000/api/pages/${deletingPage.value.path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (response.ok) {
      deletingPage.value = null;
      selectedPage.value = null;
      editorContent.value = '';
      await loadPages();
    } else {
      const data = await response.json();
      alert(data.error || 'Erro ao deletar página');
    }
  } catch (err) {
    alert('Erro de conexão');
    console.error(err);
  } finally {
    deleting.value = false;
  }
}

onMounted(() => {
  console.log('✅ PagesEditor montado');
  loadPages();
});
</script>

<style scoped>
.pages-editor {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--vp-c-text-1);
}

.editor-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  min-height: 600px;
}

.pages-list {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 1rem;
  overflow-y: auto;
  max-height: 600px;
}

.pages-list h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
}

.pages-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-item:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}

.page-item.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.page-item.active .page-name,
.page-item.active .page-path {
  color: white;
}

.page-icon {
  font-size: 1.5rem;
}

.page-item-info {
  flex: 1;
  min-width: 0;
}

.page-name {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-path {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.editor-panel {
  background: var(--vp-c-bg);
  border-radius: 8px;
  overflow: hidden;
}

.editor-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--vp-c-text-2);
  font-size: 1.1rem;
}

.editor-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.editor-title {
  flex: 1;
}

.current-path {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.path-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-family: monospace;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.editor-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 0.25rem;
  padding: 0 0.5rem;
  border-right: 1px solid var(--vp-c-divider);
}

.toolbar-group:last-child {
  border-right: none;
  margin-left: auto;
}

.toolbar-btn {
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--vp-c-text-1);
  transition: all 0.2s;
  min-width: 36px;
}

.toolbar-btn:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}

.toolbar-btn.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.toolbar-btn-primary {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.toolbar-btn-primary:hover {
  background: var(--vp-c-brand-2);
}

.editor-workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 500px;
}

.editor-workspace.view-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.editor-workspace.view-edit .editor-pane {
  width: 100%;
}

.editor-workspace.view-preview .preview-pane {
  width: 100%;
}

.editor-pane,
.preview-pane {
  overflow-y: auto;
  height: 100%;
}

.editor-pane {
  border-right: 1px solid var(--vp-c-divider);
}

.editor-textarea {
  width: 100%;
  height: 100%;
  padding: 1.5rem;
  border: none;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.8;
  resize: none;
}

.editor-textarea:focus {
  outline: none;
}

.preview-pane {
  background: var(--vp-c-bg-soft);
}

.preview-content {
  padding: 1.5rem;
  max-width: 800px;
}

.preview-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}

.btn-primary, .btn-secondary, .btn-success, .btn-danger {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--vp-c-brand-1);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.btn-secondary:hover {
  background: var(--vp-c-bg);
}

.btn-primary:disabled,
.btn-success:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: var(--vp-c-bg);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
}

.modal-large {
  max-width: 900px;
}

.image-picker-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--vp-c-divider);
}

.image-picker-tabs .tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
  margin-bottom: -2px;
}

.image-picker-tabs .tab:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

.image-picker-tabs .tab.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.upload-section,
.library-section {
  min-height: 300px;
}

.upload-destination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid var(--vp-c-divider);
}

.destination-label {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.destination-path {
  font-size: 0.875rem;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  font-family: monospace;
}

.btn-change-folder {
  padding: 0.25rem 0.5rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  margin-left: auto;
}

.btn-change-folder:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}

.library-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.library-breadcrumb .breadcrumb-item {
  padding: 0.25rem 0.5rem;
  background: none;
  border: none;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.library-breadcrumb .breadcrumb-item:hover {
  background: var(--vp-c-brand-soft);
}

.library-breadcrumb .breadcrumb-separator {
  color: var(--vp-c-text-2);
  margin: 0 0.25rem;
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

.library-folder {
  cursor: pointer;
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: all 0.2s;
  background: var(--vp-c-bg-soft);
}

.library-folder:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  transform: translateY(-2px);
}

.folder-icon-large {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.item-name {
  margin: 0.5rem 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-count {
  margin: 0;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.upload-area {
  padding: 2rem;
  position: relative;
}

.upload-area.upload-dragging {
  background: var(--vp-c-brand-soft);
  border-radius: 12px;
}

.upload-label {
  display: block;
  cursor: pointer;
}

.upload-placeholder {
  border: 2px dashed var(--vp-c-divider);
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  transition: all 0.2s;
}

.upload-placeholder:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.upload-dragging .upload-placeholder {
  border-color: var(--vp-c-brand-1);
  border-width: 3px;
  background: var(--vp-c-brand-soft);
}

.upload-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.upload-dragging .upload-icon {
  animation: bounce 0.6s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.upload-placeholder small {
  display: block;
  margin-top: 0.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

.image-item {
  cursor: pointer;
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.image-item:hover {
  border-color: var(--vp-c-brand-1);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.image-name {
  padding: 0.5rem;
  font-size: 0.75rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.modal-content h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-family: monospace;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.warning-text {
  color: #dc2626;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.loading-small,
.empty-small {
  padding: 1rem;
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}
</style>
