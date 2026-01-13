import  { type Parcours } from '@/domain/entities/Parcours';

export interface IEtudiant {
    ID: number | null;
    nom: string | null;
    prenom: string | null;
    email: string | null;
    parcours_id: number | null;
}

export class Etudiant implements IEtudiant {
    constructor(
        public ID: number | null,
        public nom: string | null,
        public prenom: string | null,
        public email: string | null,
        public parcours_id: number | null
    ) {}
}