```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';

import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';

import EtudiantForm from '@/presentation/components/forms/EtudiantForm.vue';

import CustomTable from '../components/tables/CustomTable.vue';

import { Etudiant } from '@/domain/entities/Etudiant';

import { EtudiantDAO } from '@/domain/daos/EtudiantDAO';

import Swal from 'sweetalert2';

const etudiants = ref<Etudiant[]>([]);
const etudiantForm = ref();

const formatterEdition = (etudiant: Etudiant) => {
    return '<i class="bi bi-pen-fill text-primary"></i>';
};

const formatterSuppression = (etudiant: Etudiant) => {
    return '<i class="bi bi-trash-fill text-danger"></i>';
};

const columns = [
    {
        field: 'EditionEtudiant',
        label: 'Edition',
        formatter: formatterEdition,
        onClick: (e: Etudiant) => etudiantForm.value?.openForm(e),
        style: 'width: 32px;text-align:center;'
    },
    { field: 'ID', label: 'ID', formatter: null, onClick: null, style: null },
    { field: 'NumEtud', label: 'Numéro Étudiant', formatter: null, onClick: null, style: null },
    { field: 'Nom', label: 'Nom', formatter: null, onClick: null, style: null },
    { field: 'Prenom', label: 'Prénom', formatter: null, onClick: null, style: null },
    { field: 'Email', label: 'Email', formatter: null, onClick: null, style: null },
    {
        field: 'DeleteEtudiant',
        label: 'Suppression',
        formatter: formatterSuppression,
        onClick: (e: Etudiant) => onDeleteEtudiant(e),
        style: 'width: 32px;text-align:center;'
    }
];

onMounted(() => {
    EtudiantDAO.getInstance()
        .list()
        .then((data) => {
            etudiants.value = data;
        });
});

const onEtudiantCreated = (newEtudiant: Etudiant) => {
    etudiants.value.unshift(newEtudiant);
};

const onEtudiantUpdated = (etudiant: Etudiant) => {
    const index = etudiants.value.findIndex((e) => e.ID === etudiant.ID);
    if (index !== -1) {
        etudiants.value[index] = etudiant;
    }
};

const onDeleteEtudiant = (e: Etudiant) => {
    Swal.fire({
        title: 'Êtes-vous sûr de vouloir supprimer cet étudiant ?',
        showCancelButton: true,
        confirmButtonText: 'Supprimer',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            EtudiantDAO.getInstance()
                .delete(e.ID!)
                .then(() => {
                    etudiants.value = etudiants.value.filter((etudiant) => etudiant.ID !== e.ID);
                })
                .catch(() => {
                    alert('Une erreur est survenue lors de la suppression de l\'étudiant');
                });
        }
    });
};
</script>

<template>
    <div class="container-fluid">
        <div class="card mt-5">
            <div class="card-header d-flex flex-row">
                <div class="card-title">
                    <h4>Liste des Étudiants</h4>
                </div>
                <CustomButton
                    :color="BootstrapButtonEnum.info"
                    @click="() => etudiantForm?.openForm()"
                    style="justify-self: flex-end; margin-left: auto"
                >
                    Ajouter un Étudiant
                </CustomButton>
            </div>
            <div class="card-body">
                <CustomTable idAttribute="ID" :columns="columns" :data="etudiants" />
            </div>
        </div>
    </div>

    <EtudiantForm
        ref="etudiantForm"
        :etudiant="null"
        @create:etudiant="onEtudiantCreated"
        @update:etudiant="onEtudiantUpdated"
    />
</template>
```