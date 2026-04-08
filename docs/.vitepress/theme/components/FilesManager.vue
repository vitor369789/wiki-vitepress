<template>
  <div class="files-manager">
    <div class="header">
      <h2>📁 Gerenciar Arquivos</h2>
      <div class="header-actions">
        <button @click="showNewFolder = true" class="btn-secondary">
          📁 Nova Pasta
        </button>
        <label class="btn-primary upload-btn">
          ⬆️ Upload Arquivo
          <input type="file" @change="handleFileSelect" hidden />
        </label>
      </div>
    </div>

    <!-- Navegação de pastas -->
    <div class="breadcrumb">
      <button @click="navigateToFolder('')" class="breadcrumb-item">
        🏠 Raiz
      </button>
      <span v-for="(folder, index) in currentFolderPath.split('/').filter(f => f)" :key="index">
        <span class="breadcrumb-separator">/</span>
        <button 
          @click="navigateToFolder(currentFolderPath.split('/').slice(0, index + 1).join('/'))"
          class="breadcrumb-item"
        >
          {{ folder }}
        </button>
      </span>
    </div>

    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <p>Fazendo upload...</p>
    </div>

    <div v-if="loading" class="loading">Carregando arquivos...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- Área de Drag & Drop -->
    <div 
      v-else
      class="drop-zone"
      :class="{ 'drop-zone-active': isDragging }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
    >
      <div v-if="isDragging" class="drop-overlay">
        <div class="drop-message">
          <span class="drop-icon">📁</span>
          <p>Solte os arquivos aqui</p>
          <p class="drop-hint">Upload para: {{ currentFolderPath || 'Raiz' }}</p>
        </div>
      </div>

      <div class="files-grid">
      <!-- Pastas -->
      <div 
        v-for="item in currentItems.filter(i => i.type === 'folder')" 
        :key="item.path" 
        class="file-card folder-card"
        @dblclick="navigateToFolder(item.path)"
      >
        <div class="file-icon folder-icon">
          <span class="folder-emoji">📁</span>
        </div>
        
        <div class="file-info">
          <p class="file-name" :title="item.name">{{ item.name }}</p>
          <p class="file-size">{{ item.children.length }} itens</p>
        </div>

        <div class="file-actions">
          <button @click="navigateToFolder(item.path)" class="btn-icon" title="Abrir">
            📂
          </button>
          <button @click="confirmDeleteFolder(item)" class="btn-icon btn-danger" title="Deletar">
            🗑️
          </button>
        </div>
      </div>

      <!-- Arquivos -->
      <div 
        v-for="item in currentItems.filter(i => i.type === 'file')" 
        :key="item.path" 
        class="file-card"
      >
        <div class="file-icon">
          <img v-if="isImage(item.filename)" :src="getSecureImageUrl(item.url)" :alt="item.filename" />
          <span v-else class="file-type">{{ getFileExtension(item.filename) }}</span>
        </div>
        
        <div class="file-info">
          <p class="file-name" :title="item.filename">{{ item.filename }}</p>
          <p class="file-size">{{ formatSize(item.size) }}</p>
          <p class="file-date">{{ formatDate(item.modified) }}</p>
        </div>

        <div class="file-actions">
          <button @click="copyUrl(item.url)" class="btn-icon" title="Copiar URL">
            📋
          </button>
          <a :href="getSecureImageUrl(item.url)" target="_blank" class="btn-icon" title="Abrir">
            👁️
          </a>
          <button @click="confirmDelete(item)" class="btn-icon btn-danger" title="Deletar">
            🗑️
          </button>
        </div>
      </div>

      <div v-if="currentItems.length === 0" class="empty-state">
        <p>Pasta vazia</p>
        <p>Faça upload de arquivos ou crie subpastas</p>
        <p class="drag-hint">💡 Arraste arquivos aqui para fazer upload</p>
      </div>
    </div>
    </div>

    <!-- Modal Nova Pasta -->
    <div v-if="showNewFolder" class="modal-overlay" @click="showNewFolder = false">
      <div class="modal-content" @click.stop>
        <h3>📁 Nova Pasta</h3>
        
        <div class="form-group">
          <label>Nome da Pasta *</label>
          <input 
            v-model="newFolderName"
            type="text"
            placeholder="minha-pasta"
            class="form-input"
            @keyup.enter="createFolder"
          />
          <small>Use apenas letras, números, hífens e underscores</small>
        </div>

        <div v-if="folderError" class="error-message">{{ folderError }}</div>

        <div class="modal-actions">
          <button @click="showNewFolder = false" class="btn-secondary">
            Cancelar
          </button>
          <button @click="createFolder" class="btn-primary" :disabled="!newFolderName || creating">
            {{ creating ? 'Criando...' : 'Criar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Delete Arquivo -->
    <div v-if="deletingFile" class="modal-overlay" @click="deletingFile = null">
      <div class="modal-content modal-small" @click.stop>
        <h3>⚠️ Confirmar Exclusão</h3>
        <p>Tem certeza que deseja deletar o arquivo <strong>{{ deletingFile.filename }}</strong>?</p>
        <p class="warning-text">Esta ação não pode ser desfeita!</p>
        
        <div class="modal-actions">
          <button @click="deletingFile = null" class="btn-secondary">
            Cancelar
          </button>
          <button @click="deleteFile" class="btn-danger" :disabled="deleting">
            {{ deleting ? 'Deletando...' : 'Deletar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Delete Pasta -->
    <div v-if="deletingFolder" class="modal-overlay" @click="deletingFolder = null">
      <div class="modal-content modal-small" @click.stop>
        <h3>⚠️ Confirmar Exclusão</h3>
        <p>Tem certeza que deseja deletar a pasta <strong>{{ deletingFolder.name }}</strong>?</p>
        <p class="warning-text">A pasta deve estar vazia!</p>
        
        <div class="modal-actions">
          <button @click="deletingFolder = null" class="btn-secondary">
            Cancelar
          </button>
          <button @click="deleteFolder" class="btn-danger" :disabled="deleting">
            {{ deleting ? 'Deletando...' : 'Deletar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchApi, getApiUrl } from '../utils/api.js';

const allItems = ref([]);
const currentFolderPath = ref('');
const loading = ref(true);
const error = ref('');
const uploading = ref(false);
const deletingFile = ref(null);
const deletingFolder = ref(null);
const deleting = ref(false);
const showNewFolder = ref(false);
const newFolderName = ref('');
const creating = ref(false);
const folderError = ref('');
const isDragging = ref(false);
let dragCounter = 0;

const currentItems = computed(() => {
  if (!currentFolderPath.value) {
    return allItems.value;
  }
  
  // Navegar para a pasta atual
  const parts = currentFolderPath.value.split('/');
  let items = allItems.value;
  
  for (const part of parts) {
    const folder = items.find(i => i.type === 'folder' && i.name === part);
    if (folder) {
      items = folder.children;
    }
  }
  
  return items;
});

function isImage(filename) {
  return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(filename);
}

function getFileExtension(filename) {
  const ext = filename.split('.').pop().toUpperCase();
  return ext.length > 4 ? 'FILE' : ext;
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getSecureImageUrl(url) {
  const token = localStorage.getItem('auth_token');
  return `${getApiUrl()}${url}?token=${token}`;
}

function navigateToFolder(path) {
  console.log('🧭 FilesManager navegando para:', path);
  currentFolderPath.value = path;
  console.log('📍 currentFolderPath agora é:', currentFolderPath.value);
}

async function loadFiles() {
  loading.value = true;
  error.value = '';

  try {
    const response = await fetchApi('/api/files');

    if (response.ok) {
      const data = await response.json();
      allItems.value = data.items || [];
    } else {
      error.value = 'Erro ao carregar arquivos';
    }
  } catch (err) {
    error.value = 'Erro de conexão';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function createFolder() {
  if (!newFolderName.value) return;
  
  creating.value = true;
  folderError.value = '';

  try {
    const response = await fetchApi('/api/folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newFolderName.value,
        parent: currentFolderPath.value
      })
    });

    const data = await response.json();

    if (response.ok) {
      showNewFolder.value = false;
      newFolderName.value = '';
      await loadFiles();
    } else {
      folderError.value = data.error || 'Erro ao criar pasta';
    }
  } catch (err) {
    folderError.value = 'Erro de conexão';
    console.error(err);
  } finally {
    creating.value = false;
  }
}

async function uploadFile(file) {
  console.log('🚀 FilesManager uploadFile chamado');
  console.log('📁 Pasta atual (currentFolderPath):', currentFolderPath.value);
  console.log('📄 Arquivo:', file?.name);
  
  uploading.value = true;

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('📤 Enviando upload para pasta:', currentFolderPath.value);
    
    // Enviar folder como query parameter
    const folderParam = currentFolderPath.value ? `?folder=${encodeURIComponent(currentFolderPath.value)}` : '';
    const apiUrl = getApiUrl();
    console.log('📤 URL com folder:', `${apiUrl}/api/upload${folderParam}`);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${apiUrl}/api/upload${folderParam}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: formData
    });

    const data = await response.json();
    console.log('✅ Resposta do servidor:', data);

    if (response.ok) {
      console.log('✅ Upload bem-sucedido, recarregando arquivos...');
      await loadFiles();
      return true;
    } else {
      console.log('❌ Erro no upload:', data.error);
      alert(data.error || 'Erro ao fazer upload');
      return false;
    }
  } catch (err) {
    console.error('❌ Erro de conexão:', err);
    alert('Erro de conexão');
    return false;
  } finally {
    uploading.value = false;
  }
}

async function handleFileSelect(event) {
  console.log('📤 handleFileSelect chamado no FilesManager');
  const file = event.target.files[0];
  console.log('📁 Arquivo selecionado:', file?.name);
  console.log('📍 Pasta atual antes do upload:', currentFolderPath.value);
  
  if (!file) {
    console.log('❌ Nenhum arquivo selecionado');
    return;
  }

  try {
    console.log('🔄 Chamando uploadFile...');
    await uploadFile(file);
    console.log('✅ uploadFile completou');
  } catch (err) {
    console.error('❌ Erro no handleFileSelect:', err);
    alert('Erro ao fazer upload: ' + err.message);
  }
  
  event.target.value = '';
}

function handleDragEnter(e) {
  e.preventDefault();
  dragCounter++;
  isDragging.value = true;
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDragLeave(e) {
  e.preventDefault();
  dragCounter--;
  if (dragCounter === 0) {
    isDragging.value = false;
  }
}

async function handleDrop(e) {
  console.log('🎯 handleDrop chamado no FilesManager');
  e.preventDefault();
  isDragging.value = false;
  dragCounter = 0;

  const files = Array.from(e.dataTransfer.files);
  console.log('📦 Arquivos soltos:', files.length);
  console.log('📍 Pasta atual antes do upload:', currentFolderPath.value);
  
  if (files.length === 0) {
    console.log('❌ Nenhum arquivo');
    return;
  }

  // Upload múltiplos arquivos
  for (const file of files) {
    console.log('⬆️ Fazendo upload de:', file.name);
    await uploadFile(file);
  }
}

function copyUrl(url) {
  const fullUrl = `${getApiUrl()}${url}`;
  navigator.clipboard.writeText(fullUrl).then(() => {
    alert('URL copiada! Use esta URL nas páginas (requer autenticação).');
  });
}

function confirmDelete(file) {
  deletingFile.value = file;
}

function confirmDeleteFolder(folder) {
  deletingFolder.value = folder;
}

async function deleteFile() {
  deleting.value = true;

  try {
    const response = await fetchApi(`/api/files/${deletingFile.value.path}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      deletingFile.value = null;
      await loadFiles();
    } else {
      const data = await response.json();
      alert(data.error || 'Erro ao deletar arquivo');
    }
  } catch (err) {
    alert('Erro de conexão');
    console.error(err);
  } finally {
    deleting.value = false;
  }
}

async function deleteFolder() {
  deleting.value = true;

  try {
    const response = await fetchApi(`/api/folders/${deletingFolder.value.path}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      deletingFolder.value = null;
      await loadFiles();
    } else {
      const data = await response.json();
      alert(data.error || 'Erro ao deletar pasta');
    }
  } catch (err) {
    alert('Erro de conexão');
    console.error(err);
  } finally {
    deleting.value = false;
  }
}

onMounted(() => {
  loadFiles();
});
</script>

<style scoped>
.files-manager {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header h2 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--vp-c-text-1);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg);
  border-radius: 6px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.breadcrumb-item {
  padding: 0.25rem 0.5rem;
  background: none;
  border: none;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.breadcrumb-item:hover {
  background: var(--vp-c-brand-soft);
}

.breadcrumb-separator {
  color: var(--vp-c-text-2);
  margin: 0 0.25rem;
}

.upload-btn {
  cursor: pointer;
}

.upload-progress {
  background: var(--vp-c-brand-soft);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--vp-c-bg);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  animation: progress 1.5s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 100%; }
  100% { width: 0%; }
}

.drop-zone {
  position: relative;
  min-height: 400px;
}

.drop-zone-active {
  outline: 3px dashed var(--vp-c-brand-1);
  outline-offset: -10px;
  background: var(--vp-c-brand-soft);
  border-radius: 12px;
}

.drop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(59, 130, 246, 0.1);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 12px;
  pointer-events: none;
}

.drop-message {
  text-align: center;
  padding: 2rem;
  background: var(--vp-c-bg);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.drop-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
  animation: bounce 0.6s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.drop-message p {
  margin: 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.drop-hint {
  font-size: 0.9rem !important;
  color: var(--vp-c-text-2) !important;
  font-weight: 400 !important;
}

.drag-hint {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--vp-c-brand-1);
  font-style: italic;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.file-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s;
}

.file-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.folder-card {
  cursor: pointer;
}

.folder-card:hover {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
}

.folder-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.folder-emoji {
  font-size: 3rem;
}

.file-icon {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  overflow: hidden;
}

.file-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-type {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.file-info {
  flex: 1;
}

.file-name {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size,
.file-date {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.file-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

.btn-icon {
  padding: 0.5rem;
  background: none;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  flex: 1;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover:not(:disabled) {
  background: var(--vp-c-bg-soft);
  transform: scale(1.05);
}

.btn-icon.btn-danger:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #dc2626;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 3rem;
  text-align: center;
  color: var(--vp-c-text-2);
}

.empty-state p {
  margin: 0.5rem 0;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--vp-c-brand-2);
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--vp-c-bg-soft);
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
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
  max-width: 400px;
  width: 100%;
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.warning-text {
  color: #dc2626;
  font-weight: 500;
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
  font-size: 1rem;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.dark .error-message {
  background: rgba(220, 38, 38, 0.1);
  color: #fca5a5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  color: var(--vp-c-text-2);
}

.error {
  color: #dc2626;
}
</style>
