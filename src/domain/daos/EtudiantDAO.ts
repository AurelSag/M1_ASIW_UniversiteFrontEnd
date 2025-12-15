import type { IDAO } from './IDAO';
import axios from 'axios';
import type { Etudiant } from '@/domain/entities/Etudiant';

export class EtudiantDAO implements IDAO<Etudiant> {
    private static instance: EtudiantDAO;

    private constructor() {}

    public static getInstance(): EtudiantDAO {
        if (!EtudiantDAO.instance) {
            EtudiantDAO.instance = new EtudiantDAO();
        }
        return EtudiantDAO.instance;
    }

    public async create(data: Etudiant): Promise<Etudiant> {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/Etudiant`, data);
            return response.data;
        } catch (error) {
            throw new Error('Impossible de créer le nouvel étudiant');
        }
    }

    public async get(id: number): Promise<Etudiant> {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/Etudiant/${id}`);
            return response.data;
        } catch (error) {
            throw new Error('Impossible de récupérer l\'étudiant');
        }
    }

    public async update(id: number, data: Etudiant): Promise<Etudiant> {
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/Etudiant/${id}`, data);
            return response.data;
        } catch (error) {
            throw new Error('Impossible de mettre à jour l\'étudiant');
        }
    }

    public async delete(id: number): Promise<void> {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/Etudiant/${id}`);
        } catch (error) {
            throw new Error('Impossible de supprimer l\'étudiant');
        }
    }

    public async list(): Promise<Etudiant[]> {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/Etudiant`);
            return response.data;
        } catch (error) {
            throw new Error('Impossible de récupérer la liste des étudiants');
        }
    }
}