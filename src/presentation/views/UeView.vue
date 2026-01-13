<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import { UE } from '@/domain/entities/UE';
import { UEDAO } from '@/domain/daos/UEDAO';
import { Parcours } from '@/domain/entities/Parcours';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import { Etudiant } from '@/domain/entities/Etudiant';
import { EtudiantDAO } from '@/domain/daos/EtudiantDAO';
import { Note } from '@/domain/entities/Note';
import { NoteDAO } from '@/domain/daos/NoteDAO';
import Swal from 'sweetalert2';
import { useNotification } from '@kyvg/vue3-notification';

const route = useRoute();
const { notify } = useNotification();
const ueId = computed(() => Number(route.params.id));

const ue = ref<UE>(new UE(null, '', '', []));

const numero = ref('');
const intitule = ref('');

const allParcours = ref<Parcours[]>([]);
const selectedParcours = ref<Parcours[]>([]);
const availableParcours = computed(() => {
    return allParcours.value.filter(
        p => !selectedParcours.value.find(sp => sp.ID === p.ID)
    );
});

const etudiants = ref<Etudiant[]>([]);
const notes = ref<Map<number, Note>>(new Map());

const showParcoursDropdown = ref(false);

onMounted(async () => {
    try {
        // Charger l'UE
        const data = await UEDAO.getInstance().get(ueId.value);
        if (data) {
            ue.value = data;

            // Parser le numéro d'UE
            if (data.NumeroUe) {
                numero.value = data.NumeroUe;
            }

            intitule.value = data.Intitule || '';

            // Les parcours sont déjà chargés dans l'UE
            if (data.Parcours && data.Parcours.length > 0) {
                selectedParcours.value = data.Parcours;
            }
        }

        // Charger tous les parcours disponibles
        const parcoursData = await ParcoursDAO.getInstance().list();
        allParcours.value = parcoursData;

        // Charger les étudiants et notes
        await loadEtudiantsAndNotes();

    } catch (error) {
        notify({
            title: 'Erreur',
            text: 'Erreur lors du chargement des données',
            type: 'error'
        });
        console.error(error);
    }
});

const loadEtudiantsAndNotes = async () => {
    try {
        if (selectedParcours.value.length === 0) {
            etudiants.value = [];
            notes.value = new Map();
            return;
        }

        // Charger tous les étudiants
        const allEtudiants = await EtudiantDAO.getInstance().list();

        // Filtrer les étudiants qui appartiennent aux parcours sélectionnés
        const parcoursIds = selectedParcours.value.map(p => p.ID);
        const etudiantsFiltered = allEtudiants.filter(e =>
            parcoursIds.includes(e.parcours_id)
        );

        // Trier par nom/prénom
        etudiants.value = etudiantsFiltered.sort((a, b) => {
            const nomA = `${a.nom} ${a.prenom}`.toLowerCase();
            const nomB = `${b.nom} ${b.prenom}`.toLowerCase();
            return nomA.localeCompare(nomB);
        });

        // Charger les notes pour cette UE via le DAO
        try {
            const notesData = await NoteDAO.getInstance().getNotesByUe(ueId.value);
            const notesMap = new Map<number, Note>();
            notesData.forEach(note => {
                notesMap.set(note.etudiant_id, note);
            });
            notes.value = notesMap;
        } catch (error) {
            console.warn('Erreur lors du chargement des notes:', error);
            notes.value = new Map();
        }

    } catch (error) {
        notify({
            title: 'Erreur',
            text: 'Erreur lors du chargement des étudiants et notes',
            type: 'error'
        });
        console.error(error);
    }
};

const onEnregistrer = async () => {
    try {
        // Validation des champs
        if (!numero.value || !intitule.value) {
            notify({
                title: 'Attention',
                text: 'Veuillez remplir tous les champs',
                type: 'warn'
            });
            return;
        }

        // Construire l'UE mise à jour
        const updatedUe = new UE(
            ue.value.ID,
            intitule.value,
            numero.value,
            selectedParcours.value
        );

        await UEDAO.getInstance().update(ue.value.ID!, updatedUe);

        ue.value = updatedUe;

        notify({
            title: 'Succès',
            text: 'L\'UE a été modifiée avec succès',
            type: 'success'
        });
    } catch (error) {
        notify({
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la modification de l\'UE',
            type: 'error'
        });
        console.error(error);
    }
};

const ajouterParcours = async (parcours: Parcours) => {
    try {
        selectedParcours.value.push(parcours);
        showParcoursDropdown.value = false;

        // Sauvegarder la modification
        const updatedUe = new UE(
            ue.value.ID,
            intitule.value,
            numero.value,
            selectedParcours.value
        );

        await UEDAO.getInstance().update(ue.value.ID!, updatedUe);

        // Recharger la liste des étudiants et notes
        await loadEtudiantsAndNotes();

        notify({
            title: 'Succès',
            text: `Le parcours ${parcours.NomParcours} a été ajouté`,
            type: 'success'
        });
    } catch (error) {
        // Rollback en cas d'erreur
        selectedParcours.value = selectedParcours.value.filter(p => p.ID !== parcours.ID);

        notify({
            title: 'Erreur',
            text: 'Erreur lors de l\'ajout du parcours',
            type: 'error'
        });
        console.error(error);
    }
};

const supprimerParcours = async (parcours: Parcours, index: number) => {
    try {
        const result = await Swal.fire({
            title: 'Confirmer la suppression',
            text: `Êtes-vous sûr de vouloir retirer le parcours "${parcours.NomParcours}" de cette UE ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Supprimer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#dc3545'
        });

        if (result.isConfirmed) {
            const oldParcours = [...selectedParcours.value];
            selectedParcours.value.splice(index, 1);

            // Sauvegarder la modification
            const updatedUe = new UE(
                ue.value.ID,
                intitule.value,
                numero.value,
                selectedParcours.value
            );

            try {
                await UEDAO.getInstance().update(ue.value.ID!, updatedUe);

                // Recharger la liste des étudiants et notes
                await loadEtudiantsAndNotes();

                notify({
                    title: 'Succès',
                    text: `Le parcours "${parcours.NomParcours}" a été retiré`,
                    type: 'success'
                });
            } catch (error) {
                // Rollback en cas d'erreur
                selectedParcours.value = oldParcours;
                throw error;
            }
        }
    } catch (error) {
        notify({
            title: 'Erreur',
            text: 'Erreur lors de la suppression du parcours',
            type: 'error'
        });
        console.error(error);
    }
};

const getNoteValue = (etudiantId: number): string => {
    const note = notes.value.get(etudiantId);
    return note?.valeur?.toString() || '';
};

const updateNote = async (etudiant: Etudiant, event: Event) => {
    const input = event.target as HTMLInputElement;
    const valeur = input.value.trim();

    try {
        // Validation de la note
        if (valeur !== '') {
            const noteNum = parseFloat(valeur);
            if (isNaN(noteNum) || noteNum < 0 || noteNum > 20) {
                notify({
                    title: 'Attention',
                    text: 'La note doit être comprise entre 0 et 20',
                    type: 'warn'
                });
                input.value = getNoteValue(etudiant.ID!);
                return;
            }
        }

        const existingNote = notes.value.get(etudiant.ID!);

        if (valeur === '') {
            // Supprimer la note si le champ est vide
            if (existingNote && existingNote.ID) {
                await NoteDAO.getInstance().delete(existingNote.ID);
                notes.value.delete(etudiant.ID!);
                notify({
                    title: 'Succès',
                    text: 'La note a été supprimée',
                    type: 'success'
                });
            }
        } else {
            const noteNum = parseFloat(valeur);

            if (existingNote && existingNote.ID) {
                // Modifier la note existante
                const updatedNoteData = new Note(
                    existingNote.ID,
                    etudiant.ID!,
                    ueId.value,
                    noteNum
                );
                const updatedNote = await NoteDAO.getInstance().update(
                    existingNote.ID,
                    updatedNoteData
                );
                notes.value.set(etudiant.ID!, updatedNote);
                notify({
                    title: 'Succès',
                    text: 'La note a été modifiée',
                    type: 'success'
                });
            } else {
                // Créer une nouvelle note
                const newNoteData = new Note(
                    null,
                    etudiant.ID!,
                    ueId.value,
                    noteNum
                );
                const newNote = await NoteDAO.getInstance().create(newNoteData);
                notes.value.set(etudiant.ID!, newNote);
                notify({
                    title: 'Succès',
                    text: 'La note a été ajoutée',
                    type: 'success'
                });
            }
        }
    } catch (error) {
        notify({
            title: 'Erreur',
            text: 'Erreur lors de la modification de la note',
            type: 'error'
        });
        console.error(error);
        input.value = getNoteValue(etudiant.ID!);
    }
};

// Fermer le dropdown quand on clique en dehors
const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.parcours-dropdown-container')) {
        showParcoursDropdown.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});
</script>

<template>
    <div class="container-fluid">
        <div class="card mt-4">
            <div class="card-header bg-light">
                <h5 class="mb-0">Modification de l'UE</h5>
            </div>
            <div class="card-body">
                <div class="row g-3">
                    <!-- Section gauche: Formulaire UE -->
                    <div class="col-md-6">
                        <div class="row mb-3">
                            <div class="col-12">
                                <label class="form-label">Numéro :</label>
                                <input
                                    type="text"
                                    class="form-control"
                                    v-model="numero"
                                    placeholder="UE_1"
                                />
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Intitulé :</label>
                            <input
                                type="text"
                                class="form-control"
                                v-model="intitule"
                                placeholder="Intitulé de l'UE"
                            />
                        </div>

                        <div class="mt-3">
                            <CustomButton
                                :color="BootstrapButtonEnum.info"
                                @click="onEnregistrer"
                            >
                                Enregistrer
                            </CustomButton>
                        </div>
                    </div>

                    <!-- Section droite: Parcours -->
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">Parcours</h6>
                                <div class="parcours-dropdown-container position-relative">
                                    <button
                                        class="btn btn-sm btn-success"
                                        @click.stop="showParcoursDropdown = !showParcoursDropdown"
                                        :disabled="availableParcours.length === 0"
                                        :title="availableParcours.length === 0 ? 'Tous les parcours sont déjà ajoutés' : 'Ajouter un parcours'"
                                    >
                                        <i class="bi bi-plus-lg"></i>
                                    </button>

                                    <div
                                        v-if="showParcoursDropdown"
                                        class="dropdown-menu show position-absolute"
                                        style="right: 0; top: 100%; margin-top: 5px; min-width: 250px; max-height: 300px; overflow-y: auto; z-index: 1050;"
                                    >
                                        <button
                                            v-for="parcours in availableParcours"
                                            :key="parcours.ID"
                                            class="dropdown-item"
                                            @click.stop="ajouterParcours(parcours)"
                                        >
                                            {{ parcours.NomParcours }} ({{ parcours.AnneeFormation }})
                                        </button>
                                        <div v-if="availableParcours.length === 0" class="dropdown-item text-muted">
                                            Aucun parcours disponible
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body p-0">
                                <div
                                    v-for="(parcours, index) in selectedParcours"
                                    :key="parcours.ID"
                                    class="d-flex justify-content-between align-items-center p-2 border-bottom"
                                >
                                    <span>{{ parcours.NomParcours }} ({{ parcours.AnneeFormation }})</span>
                                    <button
                                        class="btn btn-sm btn-link text-danger p-0"
                                        @click="supprimerParcours(parcours, index)"
                                        title="Retirer ce parcours"
                                    >
                                        <i class="bi bi-dash-lg"></i>
                                    </button>
                                </div>
                                <div v-if="selectedParcours.length === 0" class="p-3 text-muted text-center">
                                    Aucun parcours sélectionné
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section Notes -->
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header bg-light">
                                <h6 class="mb-0">Notes</h6>
                            </div>
                            <div class="card-body p-0">
                                <div
                                    v-for="etudiant in etudiants"
                                    :key="etudiant.ID"
                                    class="d-flex justify-content-between align-items-center p-2 border-bottom bg-light"
                                >
                                    <span>{{ etudiant.nom }} {{ etudiant.prenom }}</span>
                                    <input
                                        type="text"
                                        class="form-control"
                                        style="width: 120px"
                                        :value="getNoteValue(etudiant.ID!)"
                                        @blur="(e) => updateNote(etudiant, e)"
                                        @keyup.enter="(e) => (e.target as HTMLInputElement).blur()"
                                        placeholder="__ / 20"
                                    />
                                </div>
                                <div v-if="etudiants.length === 0" class="p-3 text-muted text-center">
                                    Aucun étudiant trouvé. Ajoutez des parcours pour voir les étudiants.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card-header {
    background-color: #f8f9fa;
}

.form-control:focus {
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.border-bottom:last-child {
    border-bottom: none !important;
}

.dropdown-menu.show {
    display: block;
}

.dropdown-item {
    cursor: pointer;
}

.dropdown-item:hover {
    background-color: #f8f9fa;
}

.parcours-dropdown-container {
    position: relative;
}

.btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}
</style>