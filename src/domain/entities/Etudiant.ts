import  { type Parcours } from '@/domain/entities/Parcours';

export interface IEtudiant {
    ID: number | null;
    NumEtud: string | null;
    Nom: string | null;
    Prenom: string | null;
    Email: string | null;
    ParcoursSuivi: Parcours | null;
}

export class Etudiant implements IEtudiant {
    constructor(
        public ID: number | null,
        public NumEtud: string | null,
        public Nom: string | null,
        public Prenom: string | null,
        public Email: string | null,
        public ParcoursSuivi: Parcours | null
    ) {}
}