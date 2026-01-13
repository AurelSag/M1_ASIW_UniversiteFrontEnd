import type { IDAO } from './IDAO';
import axios from 'axios';
import type { Note } from '@/domain/entities/Note';

export class NoteDAO implements IDAO<Note> {
    private static instance: NoteDAO;

    private constructor() {}

    public static getInstance(): NoteDAO {
        if (!NoteDAO.instance) {
            NoteDAO.instance = new NoteDAO();
        }
        return NoteDAO.instance;
    }

    public async create(data: Note): Promise<Note> {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/notes`,
                {
                    etudiant_id: data.etudiant_id,
                    ue_id: data.ue_id,
                    valeur: data.valeur
                }
            );
            return response.data;
        } catch (error) {
            throw new Error('Impossible de créer la nouvelle note');
        }
    }

    public async get(id: number): Promise<Note> {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/notes/${id}`
            );
            return response.data;
        } catch (error) {
            throw new Error('Impossible de récupérer la note');
        }
    }

    public async update(id: number, data: Note): Promise<Note> {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/notes/${id}`,
                {
                    valeur: data.valeur
                }
            );
            return response.data;
        } catch (error) {
            throw new Error('Impossible de mettre à jour la note');
        }
    }

    public async delete(id: number): Promise<void> {
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/notes/${id}`
            );
        } catch (error) {
            throw new Error('Impossible de supprimer la note');
        }
    }

    public async list(): Promise<Note[]> {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/notes`
            );
            return response.data;
        } catch (error) {
            throw new Error('Impossible de récupérer la liste des notes');
        }
    }

    // Méthodes spécifiques pour les notes

    public async getNotesByUe(ueId: number): Promise<Note[]> {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/notes?ue_id=${ueId}`
            );
            return response.data;
        } catch (error) {
            throw new Error('Impossible de récupérer les notes de cette UE');
        }
    }

    public async getNotesByEtudiant(etudiantId: number): Promise<Note[]> {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/notes?etudiant_id=${etudiantId}`
            );
            return response.data;
        } catch (error) {
            throw new Error('Impossible de récupérer les notes de cet étudiant');
        }
    }

    public async getNoteByEtudiantAndUe(etudiantId: number, ueId: number): Promise<Note | null> {
        try {
            const notes = await this.getNotesByUe(ueId);
            return notes.find(n => n.etudiant_id === etudiantId) || null;
        } catch (error) {
            return null;
        }
    }
}