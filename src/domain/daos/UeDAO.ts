import type { IDAO } from './IDAO';
import axios from 'axios';
import type { UE } from '@/domain/entities/UE';

export class UeDAO implements IDAO<UE> {
    private static instance: UeDAO;

    private constructor() {}

    public static getInstance(): UeDAO {
        if (!UeDAO.instance) {
            UeDAO.instance = new UeDAO();
        }
        return UeDAO.instance;
    }

    public async create(data: UE): Promise<UE> {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/Ue`, data);
            return response.data;
        } catch (error) {
            throw new Error('Impossible de créer la nouvelle Ue');
        }
    }

    public async get(id: number): Promise<UE> {
        // Retrieve a Ue document from the database
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/Ue/${id}`);
            return response.data;
        } catch (error) {
            throw new Error('Impossible de récupérer la Ue');
        }
    }

    public async update(id: number, data: UE): Promise<UE> {
        // Update a Ue document in the database
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/Ue/${id}`, data);
            return response.data;
        } catch (error) {
            throw new Error('Impossible de mettre à jour la Ue');
        }
    }

    public async delete(id: number): Promise<void> {
        // Delete a Ue document from the database
        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/Ue/${id}`);
            return response.data;
        } catch (error) {
            throw new Error('Impossible de supprimer la UE');
        }
    }

    public async list(): Promise<UE[]> {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/Ue`);
            return response.data;
        } catch (error) {
            throw new Error('Impossible de récupérer la liste des UEs');
        }
    }
}
