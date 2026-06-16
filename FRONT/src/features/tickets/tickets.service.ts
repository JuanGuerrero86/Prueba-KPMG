import apiClient from '../../services/api.client';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';
import {
  Ticket, HistoricoGestion, TicketStats,
  CreateTicketDto, UpdateTicketDto, AssignTicketsDto, TicketQuery,
} from '../../types/ticket.types';

export const ticketsService = {
  async getTickets(query: TicketQuery = {}) {
    const res = await apiClient.get<PaginatedResponse<Ticket>>('/api/tickets', { params: query });
    return res.data;
  },
  async getTicketById(id: string) {
    const res = await apiClient.get<ApiResponse<Ticket>>(`/api/tickets/${id}`);
    return res.data.data;
  },
  async createTicket(dto: CreateTicketDto) {
    const res = await apiClient.post<ApiResponse<Ticket>>('/api/tickets', dto);
    return res.data.data;
  },
  async updateTicket(id: string, dto: UpdateTicketDto) {
    const res = await apiClient.put<ApiResponse<Ticket>>(`/api/tickets/${id}`, dto);
    return res.data.data;
  },
  async deleteTicket(id: string) {
    await apiClient.delete(`/api/tickets/${id}`);
  },
  async assignTickets(dto: AssignTicketsDto) {
    const res = await apiClient.put<ApiResponse<Ticket[]>>('/api/tickets/assign', dto);
    return res.data.data;
  },
  async getTicketHistory(ticketId: string) {
    const res = await apiClient.get<ApiResponse<HistoricoGestion[]>>(`/api/tickets/${ticketId}/history`);
    return res.data.data;
  },
  async addHistoricoGestion(ticketId: string, dto: { tipoAccion: string; comentario?: string }) {
    const res = await apiClient.post<ApiResponse<HistoricoGestion>>(`/api/tickets/${ticketId}/history`, dto);
    return res.data.data;
  },
  async getStats() {
    const res = await apiClient.get<ApiResponse<TicketStats>>('/api/tickets/stats');
    return res.data.data;
  },
  async getUnassigned() {
    const res = await apiClient.get<ApiResponse<Ticket[]>>('/api/tickets/unassigned');
    return res.data.data;
  },
};
