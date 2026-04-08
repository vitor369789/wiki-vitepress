<template>
  <div v-if="loading" class="auth-loading">
    <div class="spinner"></div>
    <p>Verificando permissões...</p>
  </div>
  
  <div v-else-if="!canAccess" class="auth-denied">
    <div class="auth-denied-content">
      <h1>🔒 Acesso Restrito</h1>
      <p v-if="!user">Você precisa fazer login para acessar esta página.</p>
      <p v-else>Você não tem permissão para acessar esta página.</p>
      
      <div class="auth-info">
        <p><strong>Seu nível de acesso:</strong> {{ userRole }}</p>
        <p><strong>Página solicitada:</strong> {{ currentPage }}</p>
      </div>

      <div class="auth-actions">
        <button v-if="!user" @click="showLogin = true" class="btn-primary">
          Fazer Login
        </button>
        <button @click="goHome" class="btn-secondary">
          Voltar para Home
        </button>
      </div>
    </div>
  </div>

  <slot v-else></slot>

  <LoginModal v-if="showLogin" @close="showLogin = false" @login-success="checkAccess" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vitepress';
import { fetchApi } from '../utils/api.js';
import LoginModal from './LoginModal.vue';

const route = useRoute();
const loading = ref(true);
const canAccess = ref(false);
const user = ref(null);
const userRole = ref('guest');
const currentPage = ref('');
const showLogin = ref(false);

async function checkAccess() {
  loading.value = true;
  currentPage.value = route.path;

  try {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    // Verificar se tem token no localStorage
    if (token && storedUser) {
      user.value = JSON.parse(storedUser);
      userRole.value = user.value.role;
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const userResponse = await fetchApi('/api/auth/me');

    if (userResponse.ok) {
      const data = await userResponse.json();
      user.value = data.user;
      userRole.value = data.user.role;
      localStorage.setItem('user', JSON.stringify(data.user));
    } else {
      user.value = null;
      userRole.value = 'guest';
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }

    const accessResponse = await fetchApi('/api/auth/check-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ page: route.path })
    });

    if (accessResponse.ok) {
      const data = await accessResponse.json();
      canAccess.value = data.canAccess;
    } else {
      canAccess.value = false;
    }
  } catch (error) {
    console.error('Error checking access:', error);
    canAccess.value = route.path === '/' || route.path === '/faq';
  } finally {
    loading.value = false;
  }
}

function goHome() {
  window.location.href = '/';
}

onMounted(() => {
  checkAccess();
});

watch(() => route.path, () => {
  checkAccess();
});
</script>

<style scoped>
.auth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.auth-denied {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.auth-denied-content {
  text-align: center;
  max-width: 600px;
  padding: 3rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 2px solid var(--vp-c-divider);
}

.auth-denied-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
}

.auth-denied-content p {
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
}

.auth-info {
  background: var(--vp-c-bg);
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
  text-align: left;
}

.auth-info p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.auth-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--vp-c-brand-1);
  color: white;
}

.btn-primary:hover {
  background: var(--vp-c-brand-2);
}

.btn-secondary {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.btn-secondary:hover {
  background: var(--vp-c-bg-soft);
}
</style>
