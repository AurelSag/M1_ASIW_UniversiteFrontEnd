export interface INote {
    ID: number | null;
    etudiant_id: number;
    ue_id: number;
    valeur: number;
    created_at?: string;
}

export class Note implements INote {
    constructor(
        public ID: number | null,
        public etudiant_id: number,
        public ue_id: number,
        public valeur: number,
        public created_at?: string
    ) {}
}