import { apiRequest } from './api';
import type { Patient } from './api';

export class PatientService {
  static async searchPatients(query: string = '', skip: number = 0, limit: number = 100): Promise<Patient[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(query && { search: query }),
    });

    return apiRequest(`/patients?${params}`);
  }

  static async getPatient(patientId: string): Promise<Patient> {
    return apiRequest(`/patients/${patientId}`);
  }

  static async createPatient(patientData: Omit<Patient, 'created_at' | 'reports' | 'comorbidities'>): Promise<Patient> {
    return apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  static async getPatientReports(patientId: string) {
    return apiRequest(`/patients/${patientId}/reports`);
  }
}
