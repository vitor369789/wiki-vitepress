<template>
  <div class="user-menu">
    <div v-if="user" class="user-info">
      <button @click="showMenu = !showMenu" class="user-button">
        <span class="user-avatar">{{ userInitial }}</span>
        <span class="user-name">{{ user.name }}</span>
        <span class="user-role">{{ roleLabel }}</span>
      </button>

      <div v-if="showMenu" class="user-dropdown">
        <div class="dropdown-header">
          <p class="dropdown-email">{{ user.email }}</p>
          <span class="dropdown-role-badge">{{ roleLabel }}</span>
        </div>
        <div class="dropdown-divider"></div>
        <button @click="handleLogout" class="dropdown-item logout">
          🚪 Sair
        </button>
      </div>
    </div>

    <button v-else @click="showLogin = true" class="login-button">
      🔐 Login
    </button>

    <LoginModal v-if="showLogin" @close="showLogin = false" @login-success="onLoginSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import LoginModal from './LoginModal.vue';
import { fetchApi } from '../utils/api.js';

const user = ref(null);
const showMenu = ref(false);
const showLogin = ref(false);

const userInitial = computed(() => {
  return user.value?.name?.charAt(0).toUpperCase() || '?';
});

const roleLabel = computed(() => {
  const roles = {
    'admin': 'Admin',
    'user': 'Usuário',
    'guest': 'Visitante'
  };
  return roles[user.value?.role] || 'Visitante';
});

async function checkAuth() {
  try {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      user.value = JSON.parse(storedUser);
    }

    if (token) {
      const response = await fetchApi('/api/auth/me');

      if (response.ok) {
        const data = await response.json();
        user.value = data.user;
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        user.value = null;
      }
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }
}

async function handleLogout() {
  try {
    await fetchApi('/api/auth/logout', {
      method: 'POST'
    });

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    user.value = null;
    showMenu.value = false;
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    user.value = null;
    window.location.href = '/';
  }
}

function onLoginSuccess(userData) {
  user.value = userData;
  showLogin.value = false;
}

onMounted(() => {
  checkAuth();

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
      showMenu.value = false;
    }
  });
});
</script>

<style scoped>
.user-menu {
  position: relative;
}

.login-button {
  padding: 0.5rem 1rem;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.login-button:hover {
  background: var(--vp-c-brand-2);
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-button:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand-1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.user-role {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 250px;
  z-index: 1000;
}

.dropdown-header {
  padding: 1rem;
}

.dropdown-email {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.dropdown-role-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 4px;
  font-weight: 500;
}

.dropdown-divider {
  height: 1px;
  background: var(--vp-c-divider);
}

.dropdown-item {
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: var(--vp-c-bg-soft);
}

.dropdown-item.logout {
  color: #dc2626;
}

.dropdown-item.logout:hover {
  background: #fee2e2;
}

.dark .dropdown-item.logout:hover {
  background: rgba(220, 38, 38, 0.1);
}
</style>
