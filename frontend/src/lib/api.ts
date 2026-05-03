/**
 * api.ts — Centralized API client for Nyaya-Setu backend
 * All routes map to: http://localhost:8002
 */

import axios from 'axios';

const BASE_URL = "http://localhost:8002";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail ||
                   error.response?.data?.message ||
                   error.message ||
                   'API error';
    throw new Error(message);
  }
);

// Types
export interface UploadResponse {
  status: string;
  message: string;
  data: {
    doc_id: string;
    filename: string;
    size_bytes: number;
    status: string;
  };
}

export interface ProcessResponse {
  status: string;
  message: string;
  data: {
    doc_id: string;
    status: string;
    actions_created: number;
    case_details: any;
  };
}

export interface DocumentResponse {
  status: string;
  message: string;
  data: {
    doc_id: string;
    filename: string;
    status: string;
    raw_text?: string;
    structured_json?: any;
    actions?: Action[];
  };
}

export interface Action {
  id: string;
  document_id: string;
  action_type: string;
  description: string;
  deadline: string;
  department: string;
  priority: string;
  confidence: number;
  reasoning: string;
  status: string;
  created_at: string;
}

export interface ActionsResponse {
  status: string;
  message: string;
  data: {
    total: number;
    filters_applied: any;
    actions: Action[];
  };
}

export interface VerifyActionRequest {
  decision: 'APPROVE' | 'REJECT';
  notes?: string;
}

export interface VerifyActionResponse {
  status: string;
  message: string;
  data: {
    action_id: string;
    description: string;
    decision: string;
    department: string;
    deadline: string;
  };
}

export interface VerifyActionResponse {
  status: string;
  message?: string;
  action?: Action; 
}

export interface DocumentsResponse {
  status: string;
  message: string;
  data: {
    total: number;
    documents: {
      id: string;
      filename: string;
      status: string;
      created_at: string;
      actions_count: number;
    }[];
  };
}

// API functions
export const uploadPDF = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const processDocument = async (docId: string): Promise<ProcessResponse> => {
  const response = await api.post(`/process/${docId}`);
  return response.data;
};

export const getDocument = async (docId: string): Promise<DocumentResponse> => {
  const response = await api.get(`/document/${docId}`);
  return response.data;
};

export const getActions = async (filters?: {
  status?: string;
  department?: string;
  priority?: string;
}): Promise<ActionsResponse> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.department) params.append('department', filters.department);
  if (filters?.priority) params.append('priority', filters.priority);

  const response = await api.get(`/actions?${params.toString()}`);
  return response.data;
};

export const verifyAction = async (
  actionId: string,
  decision: VerifyActionRequest
): Promise<VerifyActionResponse> => {
  const response = await api.post(`/verify/${actionId}`, decision);
  return response.data;
};

export const getDocuments = async (): Promise<DocumentsResponse> => {
  const response = await api.get('/documents');
  return response.data;
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};