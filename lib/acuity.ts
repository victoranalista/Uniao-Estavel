import { AcuityClient, AcuityFormField, MappedClient } from '@/types/acuity';

export class AcuityError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AcuityError';
    Object.setPrototypeOf(this, AcuityError.prototype);
  }
}

export class AcuityService {
  private static instance: AcuityService;
  private baseUrl: string;
  private auth: string;

  private constructor() {
    const userId = process.env.ACUITY_USER_ID;
    const apiKey = process.env.ACUITY_API_KEY;
    const baseUrl = process.env.ACUITY_API_BASE_URL || 'https://acuityscheduling.com/api/v1';

    if (!userId || !apiKey) {
      throw new AcuityError('Missing Acuity credentials', 500);
    }

    this.baseUrl = baseUrl;
    this.auth = Buffer.from(`${userId}:${apiKey}`).toString('base64');
  }

  public static getInstance(): AcuityService {
    if (!AcuityService.instance) {
      AcuityService.instance = new AcuityService();
    }
    return AcuityService.instance;
  }

  private getFieldValue(fields: AcuityFormField[], key: string): string {
    const field = fields.find(f => f.fieldID === key);
    if (!field) {
      console.warn(`Field ${key} not found in Acuity form data`);
      return '';
    }
    return field.value;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
          ...options.headers,
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AcuityError(
          `Acuity API error: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof AcuityError) {
        throw error;
      }
      throw new AcuityError(
        'Failed to communicate with Acuity API',
        500,
        error
      );
    }
  }

  public async getClients(search?: string): Promise<AcuityClient[]> {
    try {
      const endpoint = search ? `/clients?search=${encodeURIComponent(search)}` : '/clients';
      const clients = await this.fetchWithAuth(endpoint);
      return clients;
    } catch (error) {
      console.error('Failed to fetch Acuity clients:', error);
      throw new AcuityError(
        'Failed to fetch clients from Acuity',
        error instanceof AcuityError ? error.statusCode : 500,
        error
      );
    }
  }

  public async getClientById(id: string): Promise<AcuityClient> {
    try {
      const client = await this.fetchWithAuth(`/clients/${id}`);
      return client;
    } catch (error) {
      console.error(`Failed to fetch Acuity client with ID ${id}:`, error);
      throw new AcuityError(
        'Failed to fetch client from Acuity',
        error instanceof AcuityError ? error.statusCode : 500,
        error
      );
    }
  }

  public mapClientData(client: AcuityClient): MappedClient {
    if (!client.forms || client.forms.length === 0) {
      throw new AcuityError('Client has no form data', 400);
    }

    const fields = client.forms[0].values;

    try {
      return {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        declaration: {
          unionStartDate: this.getFieldValue(fields, 'union_start_date'),
          firstPerson: {
            name: this.getFieldValue(fields, 'first_person_name'),
            nationality: this.getFieldValue(fields, 'first_person_nationality'),
            civilStatus: this.getFieldValue(fields, 'first_person_civil_status'),
            birthDate: this.getFieldValue(fields, 'first_person_birth_date'),
            birthPlace: this.getFieldValue(fields, 'first_person_birth_place'),
            profession: this.getFieldValue(fields, 'first_person_profession'),
            rg: this.getFieldValue(fields, 'first_person_rg'),
            cpf: this.getFieldValue(fields, 'first_person_cpf'),
            address: this.getFieldValue(fields, 'first_person_address'),
            email: this.getFieldValue(fields, 'first_person_email'),
            phone: this.getFieldValue(fields, 'first_person_phone'),
            fatherName: this.getFieldValue(fields, 'first_person_father_name'),
            motherName: this.getFieldValue(fields, 'first_person_mother_name'),
            registryOffice: this.getFieldValue(fields, 'first_person_registry_office'),
            registryBook: this.getFieldValue(fields, 'first_person_registry_book'),
            registryPage: this.getFieldValue(fields, 'first_person_registry_page'),
            registryTerm: this.getFieldValue(fields, 'first_person_registry_term')
          },
          secondPerson: {
            name: this.getFieldValue(fields, 'second_person_name'),
            nationality: this.getFieldValue(fields, 'second_person_nationality'),
            civilStatus: this.getFieldValue(fields, 'second_person_civil_status'),
            birthDate: this.getFieldValue(fields, 'second_person_birth_date'),
            birthPlace: this.getFieldValue(fields, 'second_person_birth_place'),
            profession: this.getFieldValue(fields, 'second_person_profession'),
            rg: this.getFieldValue(fields, 'second_person_rg'),
            cpf: this.getFieldValue(fields, 'second_person_cpf'),
            address: this.getFieldValue(fields, 'second_person_address'),
            email: this.getFieldValue(fields, 'second_person_email'),
            phone: this.getFieldValue(fields, 'second_person_phone'),
            fatherName: this.getFieldValue(fields, 'second_person_father_name'),
            motherName: this.getFieldValue(fields, 'second_person_mother_name'),
            registryOffice: this.getFieldValue(fields, 'second_person_registry_office'),
            registryBook: this.getFieldValue(fields, 'second_person_registry_book'),
            registryPage: this.getFieldValue(fields, 'second_person_registry_page'),
            registryTerm: this.getFieldValue(fields, 'second_person_registry_term')
          }
        }
      };
    } catch (error) {
      throw new AcuityError(
        'Failed to map client data',
        400,
        { clientId: client.id, error }
      );
    }
  }
}