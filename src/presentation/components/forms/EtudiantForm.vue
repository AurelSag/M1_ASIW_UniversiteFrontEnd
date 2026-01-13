<script setup lang="ts">
import { ref, onBeforeMount, defineExpose, defineProps, watch, defineEmits } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Etudiant } from '@/domain/entities/Etudiant';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
import { EtudiantDAO } from '@/domain/daos/EtudiantDAO';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';
import type { Parcours } from '@/domain/entities/Parcours';

const currentEtudiant = ref<Etudiant>(new Etudiant(null, null, null, null, null));
const isOpen = ref(false);
const selectedParcours = ref<Parcours | null>(null);

const formErrors = ref<{
    nom: string | null;
    prenom: string | null;
    email: string | null;
    parcours: string | null;
}>({
    nom: null,
    prenom: null,
    email: null,
    parcours: null,
});

const parcoursOptions = ref<Parcours[]>([]);

const openForm = (etudiant: Etudiant | null = null) => {
    isOpen.value = true;
    if (etudiant) {
        currentEtudiant.value = new Etudiant(
            etudiant.ID,
            etudiant.nom,
            etudiant.prenom,
            etudiant.email,
            etudiant.parcours_id
        );
        if (etudiant.parcours_id) {
            selectedParcours.value = parcoursOptions.value.find(p => p.ID === etudiant.parcours_id) || null;
        } else {
            selectedParcours.value = null;
        }
    } else {
        currentEtudiant.value = new Etudiant(null, null, null, null, null);
        selectedParcours.value = null;
    }
};

const closeForm = () => {
    isOpen.value = false;
    currentEtudiant.value = new Etudiant(null, null, null, null, null);
    selectedParcours.value = null;
    formErrors.value = { nom: null, prenom: null, email: null, parcours: null };
};

const saveEtudiant = () => {
    // 1. Validation
    if (formErrors.value.nom || formErrors.value.prenom || formErrors.value.email) {
        return;
    }

    // 2. Transfert de l'ID du parcours selectionné vers l'étudiant
    if (selectedParcours.value) {
        currentEtudiant.value.parcours_id = selectedParcours.value.ID;
    } else {
        formErrors.value.parcours = "Le parcours est obligatoire";
        return;
    }

    // 3. Envoi
    if (currentEtudiant.value.ID) {
        // Mise à jour
        EtudiantDAO.getInstance().update(currentEtudiant.value.ID, currentEtudiant.value).then((updated) => {
            alert('Étudiant mis à jour avec succès');
            emit('update:etudiant', updated);
            closeForm();
        }).catch((ex) => alert(ex.message));
    } else {
        // Création
        EtudiantDAO.getInstance().create(currentEtudiant.value).then((newEtudiant) => {
            alert('Étudiant créé avec succès');
            emit('create:etudiant', newEtudiant);
            closeForm();
        }).catch((ex) => alert(ex.message));
    }
};

const props = defineProps({
    etudiant: {
        type: Object as () => Etudiant | null,
        required: false,
        default: null,
    },
});

const emit = defineEmits(['create:etudiant', 'update:etudiant']);

onBeforeMount(() => {
    // Chargement de la liste des parcours pour le select
    ParcoursDAO.getInstance().list().then((parcours) => {
        parcoursOptions.value = parcours;
    });
});

defineExpose({
    openForm,
    closeForm,
});

// Watchers pour la validation
watch(() => currentEtudiant.value.nom, (val) => {
    if (!val || val.trim().length < 2) {
        formErrors.value.nom = 'Le nom doit faire au moins 2 caractères';
    } else {
        formErrors.value.nom = null;
    }
});

watch(() => currentEtudiant.value.prenom, (val) => {
    if (!val || val.trim().length < 2) {
        formErrors.value.prenom = 'Le prénom doit faire au moins 2 caractères';
    } else {
        formErrors.value.prenom = null;
    }
});

watch(() => currentEtudiant.value.email, (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val || !emailRegex.test(val)) {
        formErrors.value.email = 'Email invalide';
    } else {
        formErrors.value.email = null;
    }
});
</script>

<template>
    <CustomModal :isOpen="isOpen">
        <template v-slot:title>
            <template v-if="currentEtudiant.ID"> Modification de l'étudiant</template>
            <template v-else> Nouvel étudiant</template>
        </template>
        <template v-slot:body>
            <div class="text-start mt-1 mb-1">
                <form>
                    <CustomInput v-model="currentEtudiant.nom" id="nom" libelle="Nom" type="text"
                                 placeholder="Nom de l'étudiant" :error="formErrors.nom" />

                    <CustomInput v-model="currentEtudiant.prenom" id="prenom" libelle="Prénom" type="text"
                                 placeholder="Prénom de l'étudiant" :error="formErrors.prenom" />

                    <CustomInput v-model="currentEtudiant.email" id="email" libelle="Email" type="email"
                                 placeholder="exemple@univ.fr" :error="formErrors.email" />

                    <div class="form-group mt-2">
                        <label for="parcours">Parcours :</label>
                        <v-select
                            label="NomParcours"
                            v-model="selectedParcours"
                            :options="parcoursOptions"
                            placeholder="Sélectionnez un parcours"
                        ></v-select>
                        <div v-if="formErrors.parcours" class="text-danger small mt-1">
                            {{ formErrors.parcours }}
                        </div>
                    </div>
                </form>
            </div>
            <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.danger" @click="closeForm">
                Annuler
            </CustomButton>
            <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.primary" @click="saveEtudiant">
                Enregistrer
            </CustomButton>
        </template>
    </CustomModal>
</template>