<script setup lang="ts">
import { ref, onBeforeMount, defineExpose, defineProps, watch } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Etudiant } from '@/domain/entities/Etudiant';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import CustomModal from '@/presentation/components/modals/CustomModal.vue';
import { EtudiantDAO } from '@/domain/daos/EtudiantDAO';

const currentEtudiant = ref<Etudiant>(new Etudiant(null, '', '', '', '', null));
const isOpen = ref(false);

const openForm = (etudiant: Etudiant | null = null) => {
    isOpen.value = true;
    if (etudiant) {
        currentEtudiant.value = new Etudiant(
            etudiant.ID,
            etudiant.NumEtud,
            etudiant.Nom,
            etudiant.Prenom,
            etudiant.Email,
            etudiant.ParcoursSuivi
        );
    }
};

const closeForm = () => {
    isOpen.value = false;
    currentEtudiant.value = new Etudiant(null, '', '', '', '', null);
};

const formErrors = ref<{
    NumEtud: string | null;
    Nom: string | null;
    Prenom: string | null;
    Email: string | null;
}>({
    NumEtud: null,
    Nom: null,
    Prenom: null,
    Email: null
});

const saveEtudiant = () => {
    if (formErrors.value.NumEtud || formErrors.value.Nom || formErrors.value.Prenom || formErrors.value.Email) {
        return;
    }

    if (currentEtudiant.value.ID) {
        EtudiantDAO.getInstance()
            .update(currentEtudiant.value.ID, currentEtudiant.value)
            .then((updatedEtudiant) => {
                alert('Étudiant mis à jour avec succès');
                emit('update:etudiant', updatedEtudiant);
                closeForm();
            })
            .catch((ex) => {
                alert(ex.message);
            });
    } else {
        EtudiantDAO.getInstance()
            .create(currentEtudiant.value)
            .then((newEtudiant) => {
                alert('Étudiant créé avec succès');
                emit('create:etudiant', newEtudiant);
                closeForm();
            })
            .catch((ex) => {
                alert(ex.message);
            });
    }
};

const props = defineProps({
    etudiant: {
        type: Object as () => Etudiant | null,
        required: false,
        default: null
    }
});

const emit = defineEmits(['create:etudiant', 'update:etudiant']);

onBeforeMount(() => {
    if (props.etudiant) {
        currentEtudiant.value = props.etudiant;
    }
});

defineExpose({
    openForm,
    closeForm
});

watch(
    () => currentEtudiant.value.NumEtud,
    () => {
        if (!currentEtudiant.value.NumEtud || currentEtudiant.value.NumEtud.trim().length < 3) {
            formErrors.value.NumEtud = 'Le numéro étudiant doit faire au moins 3 caractères';
        } else {
            formErrors.value.NumEtud = null;
        }
    }
);

watch(
    () => currentEtudiant.value.Nom,
    () => {
        if (!currentEtudiant.value.Nom || currentEtudiant.value.Nom.trim().length < 2) {
            formErrors.value.Nom = 'Le nom doit faire au moins 2 caractères';
        } else {
            formErrors.value.Nom = null;
        }
    }
);

watch(
    () => currentEtudiant.value.Prenom,
    () => {
        if (!currentEtudiant.value.Prenom || currentEtudiant.value.Prenom.trim().length < 2) {
            formErrors.value.Prenom = 'Le prénom doit faire au moins 2 caractères';
        } else {
            formErrors.value.Prenom = null;
        }
    }
);

watch(
    () => currentEtudiant.value.Email,
    () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!currentEtudiant.value.Email || !emailRegex.test(currentEtudiant.value.Email)) {
            formErrors.value.Email = 'Veuillez entrer une adresse email valide';
        } else {
            formErrors.value.Email = null;
        }
    }
);
</script>

<template>
    <CustomModal :isOpen="isOpen">
        <template v-slot:title>
            <template v-if="currentEtudiant.ID">Modification de l'Étudiant</template>
            <template v-else>Nouvel Étudiant</template>
        </template>

        <template v-slot:body>
            <div class="text-start mt-1 mb-1">
                <form>
                    <CustomInput
                        v-model="currentEtudiant.NumEtud"
                        class="mt-2"
                        id="numetud"
                        libelle="Numéro Étudiant"
                        type="text"
                        placeholder="Numéro Étudiant"
                        :error="formErrors.NumEtud"
                    />

                    <CustomInput
                        v-model="currentEtudiant.Nom"
                        id="nom"
                        libelle="Nom"
                        type="text"
                        placeholder="Nom"
                        :error="formErrors.Nom"
                    />

                    <CustomInput
                        v-model="currentEtudiant.Prenom"
                        id="prenom"
                        libelle="Prénom"
                        type="text"
                        placeholder="Prénom"
                        :error="formErrors.Prenom"
                    />

                    <CustomInput
                        v-model="currentEtudiant.Email"
                        id="email"
                        libelle="Email"
                        type="email"
                        placeholder="Email"
                        :error="formErrors.Email"
                    />
                </form>
            </div>

            <CustomButton
                class="mt-1"
                style="margin-left: 5px"
                :color="BootstrapButtonEnum.danger"
                @click="closeForm"
            >
                Annuler
            </CustomButton>

            <CustomButton
                class="mt-1"
                style="margin-left: 5px"
                :color="BootstrapButtonEnum.primary"
                @click="saveEtudiant"
            >
                Enregistrer
            </CustomButton>
        </template>
    </CustomModal>
</template>