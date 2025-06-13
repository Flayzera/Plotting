import { defineStore } from 'pinia';
import { clients } from '../services/api';
import type { Client } from '../interfaces';

interface ClientState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  currentClient: Client | null;
}

export const useClientStore = defineStore('client', {
  state: (): ClientState => ({
    clients: [],
    loading: false,
    error: null,
    currentClient: null
  }),

  getters: {
    getClientById: (state) => (id: number) => {
      return state.clients.find(client => client.id === id);
    },
  },

  actions: {
    async fetchClients() {
      this.loading = true;
      this.error = null;
      try {
        const response = await clients.getAll();
        this.clients = response;
      } catch (error) {
        this.error = 'Failed to fetch clients';
        console.error('Error fetching clients:', error);
      } finally {
        this.loading = false;
      }
    },

    async searchClients(query: string) {
      try {
        const response = await clients.getAll();
        if (!response || !Array.isArray(response)) return [];
        return response.filter((client: Client) => {
          const name = client.name?.toLowerCase() || '';
          const company = client.company?.toLowerCase() || '';
          const searchQuery = query.toLowerCase();
          return name.includes(searchQuery) || company.includes(searchQuery);
        });
      } catch (error) {
        console.error('Error searching clients:', error);
        return [];
      }
    },

    async createClient(data: Omit<Client, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await clients.create(data);
        this.clients.push(response);
        return response;
      } catch (error) {
        this.error = 'Failed to create client';
        console.error('Error creating client:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateClient(id: number, data: { name: string; company: string; phone: string }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await clients.update(id, data);
        const index = this.clients.findIndex(client => client.id === id);
        if (index !== -1) {
          this.clients[index] = response;
        }
        return response;
      } catch (error) {
        this.error = 'Failed to update client';
        console.error('Error updating client:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteClient(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await clients.delete(id);
        this.clients = this.clients.filter(client => client.id !== id);
      } catch (error) {
        this.error = 'Failed to delete client';
        console.error('Error deleting client:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
